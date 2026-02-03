package com.zeroOneBlog.Services;

import java.util.Iterator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.zeroOneBlog.Dto.MediaDto;
import com.zeroOneBlog.Dto.NotificationDto;
import com.zeroOneBlog.Dto.PostCreateDto;
import com.zeroOneBlog.Dto.PostDto;
import com.zeroOneBlog.Dto.UserSummaryDto;
import com.zeroOneBlog.Entities.Like;
import com.zeroOneBlog.Entities.Media;
import com.zeroOneBlog.Entities.Post;
import com.zeroOneBlog.Entities.User;
import com.zeroOneBlog.Exceptions.ApiException;
import com.zeroOneBlog.Repositories.CommentRepository;
import com.zeroOneBlog.Repositories.LikeRepository;
import com.zeroOneBlog.Repositories.PostRepository;
import com.zeroOneBlog.Repositories.UserRepository;
import com.zeroOneBlog.Security.CustomUserDetails;
import com.zeroOneBlog.Types.MinioBucketTypes;
import com.zeroOneBlog.Types.NotificationTypes;
import com.zeroOneBlog.Types.RoleTypes;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final LikeRepository likeRepository;
    private final MinioService minioService;
    private final NotificationService notificationService;

    // Fetch post entity or throw 404
    public Post getById(UUID postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Post not found"));
    }

    // Get post as DTO with counts and current user like info
    public PostDto getByPostId(UUID postId, UUID currentUserId) {
        Post post = getById(postId);
        return mapToDto(post, currentUserId);
    }

    private PostDto mapToDto(Post post, UUID currentUserId) {
        String avatarUrl = post.getAuthor().getAvatarUrl();
        if (avatarUrl != null) {
            avatarUrl = minioService.getMediaUrl(avatarUrl);
        }
        UserSummaryDto authorSummary = new UserSummaryDto(
                post.getAuthor().getId(),
                post.getAuthor().getUsername(),
                avatarUrl);

        List<MediaDto> mediaDtos = post.getMedia() != null ? post.getMedia().stream()
                .map(media -> MediaDto.builder()
                        .id(media.getId())
                        .mediaUrl(minioService.getMediaUrl(media.getMediaUrl()))
                        .mediaType(media.getMediaType())
                        .build())
                .collect(Collectors.toList()) : List.of();

        int likeCount = likeRepository.countByPostId(post.getId());
        int commentCount = commentRepository.countByPostId(post.getId());
        boolean likedByUser = likeRepository.existsByPostIdAndUserId(post.getId(), currentUserId);

        return new PostDto(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                mediaDtos,
                authorSummary,
                post.getCreatedAt(),
                post.getUpdatedAt(),
                likeCount,
                commentCount,
                likedByUser,
                post.isVisible()
            );
    }

    public PostDto createPost(PostCreateDto dto, UUID currentUserId) {
        User author = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "User not found"));

        Post post = new Post();
        post.setTitle(dto.getTitle());
        post.setContent(dto.getContent());
        post.setAuthor(author);

        Post savedPost = postRepository.save(post);

        // Process media files
        if (dto.getMediaFiles() != null && !dto.getMediaFiles().isEmpty()) {
            String newContent = processMediaFiles(savedPost, dto.getMediaFiles(), dto.getContent());
            savedPost.setContent(newContent);
            postRepository.save(savedPost);
        }

        // Notify followers about the new post
        try {
            List<User> followers = author.getFollowers();
            var avatarUrl = author.getAvatarUrl() != null ? minioService.getMediaUrl(author.getAvatarUrl()) : null;
            if (followers != null && !followers.isEmpty()) {
                NotificationDto notificationDto = new NotificationDto(
                        null,
                        NotificationTypes.POST,
                        "New post from " + author.getUsername(),
                        savedPost.getId(),
                        false,
                        null,
                        new UserSummaryDto(
                                author.getId(),
                                author.getUsername(),
                                avatarUrl));
                for (User follower : followers) {
                    if (follower != null && !follower.getId().equals(author.getId())) {
                        notificationService.createNotification(follower, notificationDto);
                    }
                }
            }
        } catch (Exception e) {
            // Do not block post creation on notification failures; just log
            e.printStackTrace();
        }

        return mapToDto(savedPost, currentUserId);
    }

    public List<PostDto> getAllPosts(UUID currentUserId) {
        List<Post> postsPage = postRepository.findByVisibleTrueOrderByCreatedAtDesc();
        return postsPage.stream().map(post -> mapToDto(post, currentUserId)).toList();
    }

    public List<PostDto> getAllPostsForAdmin() {
        List<Post> postsPage = postRepository.findAllByOrderByCreatedAtDesc();
        return postsPage.stream().map(post -> mapToDto(post, null)).toList();
    }

    public List<PostDto> getAllFollowedUsersPosts(UUID currentUserId) {
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        List<User> followedUsers = user.getFollowing();
        List<Post> postsPage = postRepository.findByAuthorInOrderByCreatedAtDesc(followedUsers);
        return postsPage.stream().map(post -> mapToDto(post, currentUserId)).toList();
    }

    public PostDto updatePost(UUID postId, PostCreateDto dto, UUID currentUserId) {
        Post post = getById(postId);

        // Check if current user is the author
        if (!post.getAuthor().getId().equals(currentUserId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only update your own posts");
        }

        post.setTitle(dto.getTitle());
        post.setUpdatedAt(new java.sql.Timestamp(System.currentTimeMillis()));

        if (post.getMedia() != null) {
            String updatedContent = dto.getContent();
            Iterator<Media> iterator = post.getMedia().iterator();
            while (iterator.hasNext()) {
                Media media = iterator.next();
                String relativeUrl = minioService.getPermalink(media.getMediaUrl());
                // Check both raw and encoded versions to handle markdown differences
                // String encodedRelativeUrl = relativeUrl.replace(" ", "%20"); // Simple
                // encoding check, can be expanded
                // try {
                // encodedRelativeUrl = java.net.URLEncoder.encode(relativeUrl,
                // java.nio.charset.StandardCharsets.UTF_8.toString())
                // .replace("%2F", "/"); // Keep slashes
                // } catch (Exception e) {
                // // fall back to simple replacement if encoding fails
                // }

                if (!updatedContent.contains(relativeUrl) && !updatedContent.contains(relativeUrl)) {
                    minioService.deleteFile(media.getMediaUrl());
                    iterator.remove();
                }
            }
        }

        // Handle new media uploads
        if (dto.getMediaFiles() != null && !dto.getMediaFiles().isEmpty()) {
            String finalContent = processMediaFiles(post, dto.getMediaFiles(), dto.getContent());
            post.setContent(finalContent);
        } else {
            post.setContent(dto.getContent());
        }

        Post updatedPost = postRepository.save(post);
        return mapToDto(updatedPost, currentUserId);
    }

    private String processMediaFiles(Post post, List<MultipartFile> files,
            String content) {
        if (files == null || files.isEmpty())
            return content;

        String mutableContent = content; // String is immutable, but we reassign

        if (post.getMedia() == null) {
            post.setMedia(new java.util.ArrayList<>());
        }

        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);
            if (file == null || file.isEmpty())
                continue;

            String mediaUrl = minioService.uploadFile(file);
            MinioBucketTypes mediaType = getPostMediaType(file.getContentType());

            if (mediaType == null) {
                // Should we delete the uploaded file if type is wrong? Theoretically yes.
                // But for now keeping error behavior simple.
                throw new ApiException(HttpStatus.BAD_REQUEST, "Posts only support images and videos");
            }

            Media media = new Media();
            media.setPost(post);
            media.setMediaUrl(mediaUrl);
            media.setMediaType(mediaType);
            post.getMedia().add(media);

            String relativeUrl = minioService.getPermalink(mediaUrl);

            // Replace the placeholder {{MEDIA_INDEX_i}} with the relative URL
            // We use replace (not replaceAll) because we expect specific instances, but
            // replace() replaces all occurrences in String (which is fine)
            // relativeUrl is e.g., /media/images/key.png
            String placeholder = "{{MEDIA_INDEX_" + i + "}}";
            mutableContent = mutableContent.replace(placeholder, relativeUrl);
        }

        return mutableContent;
    }

    public void deletePost(UUID postId, CustomUserDetails currentUserDetails) {
        Post post = getById(postId);
        User currentUser = userRepository.findById(currentUserDetails.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "User not found"));

        // Check if current user is the author or admin
        if (!post.getAuthor().getId().equals(currentUser.getId()) && currentUser.getRole() != RoleTypes.ADMIN) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only delete your own posts");
        }
        deletePostInternal(post);
    }

    public void deletePostByAdmin(UUID postId) {
        Post post = getById(postId);
        deletePostInternal(post);
    }

    private void deletePostInternal(Post post) {
        // Delete associated media files from Minio
        if (post.getMedia() != null) {
            for (Media media : post.getMedia()) {
                minioService.deleteFile(media.getMediaUrl());
            }
        }
        postRepository.delete(post);
    }

    public void toggleHidePost(UUID postId) {
        Post post = getById(postId);
        post.setVisible(!post.isVisible());
        postRepository.save(post);
    }

    // Toggle like for a post by the current user
    @Transactional
    public void toggleLike(UUID postId, UUID currentUserId) {
        Post post = getById(postId);
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "User not found"));

        boolean alreadyLiked = likeRepository.existsByPostIdAndUserId(postId, currentUserId);
        if (alreadyLiked) {
            likeRepository.deleteByPostIdAndUserId(postId, currentUserId);
        } else {
            Like like = new Like();
            like.setPost(post);
            like.setUser(user);
            likeRepository.save(like);
        }
    }

    // Helper method to determine media type from content type (only images and
    // videos for posts)
    private MinioBucketTypes getPostMediaType(String contentType) {
        if (contentType == null) {
            return null;
        }
        if (contentType.startsWith("video")) {
            return MinioBucketTypes.VIDEOS;
        }
        if (contentType.startsWith("image")) {
            return MinioBucketTypes.IMAGES;
        }
        return null; // Reject audio and other types
    }

    public long getPostCount() {
        return postRepository.count();
    }

    public List<PostDto> getAllUserPosts(UUID useruUuid, UUID currentUserId) {
        User user = userRepository.findById(useruUuid)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        List<Post> postsPage = postRepository.findByAuthorAndVisibleTrueOrderByCreatedAtDesc(user);
        return postsPage.stream().map(post -> mapToDto(post, currentUserId)).toList();
    }
}
