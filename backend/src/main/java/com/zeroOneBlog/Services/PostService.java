package com.zeroOneBlog.Services;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.zeroOneBlog.Dto.MediaDto;
import com.zeroOneBlog.Dto.PostCreateDto;
import com.zeroOneBlog.Dto.PostDto;
import com.zeroOneBlog.Dto.UserSummaryDto;
import com.zeroOneBlog.Entities.Media;
import com.zeroOneBlog.Entities.Post;
import com.zeroOneBlog.Entities.User;
import com.zeroOneBlog.Exceptions.ApiException;
import com.zeroOneBlog.Repositories.CommentRepository;
import com.zeroOneBlog.Repositories.LikeRepository;
import com.zeroOneBlog.Repositories.MediaRepository;
import com.zeroOneBlog.Repositories.PostRepository;
import com.zeroOneBlog.Repositories.UserRepository;
import com.zeroOneBlog.Types.MinioBucketTypes;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final LikeRepository likeRepository;
    private final MediaRepository mediaRepository;
    private final MinioService minioService;

    // Fetch post entity or throw 404
    public Post getById(UUID postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Post not found"));
    }

    // Get post as DTO with counts and current user like info
    public PostDto getByPostId(UUID postId, UUID currentUserId) {
        Post post = getById(postId);

        UserSummaryDto authorSummary = new UserSummaryDto(
                post.getAuthor().getId(),
                post.getAuthor().getUsername(),
                post.getAuthor().getAvatarUrl()
        );

        List<MediaDto> mediaDtos = post.getMedia() != null ? post.getMedia().stream()
                .map(media -> MediaDto.builder()
                        .id(media.getId())
                        .mediaUrl(minioService.getPresignedUrl(media.getMediaUrl()))
                        .mediaType(media.getMediaType())
                        .build())
                .collect(Collectors.toList()) : List.of();

        int likeCount = likeRepository.countByPostId(postId);
        int commentCount = commentRepository.countByPostId(postId);

        boolean likedByUser = likeRepository.existsByPostIdAndUserId(postId, currentUserId);
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
                likedByUser
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

        // Upload media files if present
        List<MediaDto> mediaDtos = List.of();
        if (dto.getMediaFiles() != null && !dto.getMediaFiles().isEmpty()) {
            mediaDtos = dto.getMediaFiles().stream()
                    .filter(file -> file != null && !file.isEmpty())
                    .map(file -> {
                        String mediaUrl = minioService.uploadFile(file);
                        MinioBucketTypes mediaType = getPostMediaType(file.getContentType());
                        
                        if (mediaType == null) {
                            throw new ApiException(HttpStatus.BAD_REQUEST, "Posts only support images and videos");
                        }
                        
                        Media media = new Media();
                        media.setPost(savedPost);
                        media.setMediaUrl(mediaUrl);
                        media.setMediaType(mediaType);
                        mediaRepository.save(media);
                        
                        return MediaDto.builder()
                                .id(media.getId())
                                .mediaUrl(minioService.getPresignedUrl(mediaUrl))
                                .mediaType(mediaType)
                                .build();
                    })
                    .collect(Collectors.toList());
        }

        UserSummaryDto authorSummary = new UserSummaryDto(
                author.getId(),
                author.getUsername(),
                author.getAvatarUrl()
        );

        return new PostDto(
                savedPost.getId(),
                savedPost.getTitle(),
                savedPost.getContent(),
                mediaDtos,
                authorSummary,
                savedPost.getCreatedAt(),
                savedPost.getUpdatedAt(),
                0,
                0,
                false
        );
    }

    public Page<PostDto> getAllPosts(Pageable pageable, UUID currentUserId) {
        pageable = (pageable == null) ? Pageable.unpaged() : pageable;
        Page<Post> postsPage = postRepository.findAllByOrderByCreatedAtDesc(pageable);
        return postsPage.map(post -> {
            UserSummaryDto authorSummary = new UserSummaryDto(
                    post.getAuthor().getId(),
                    post.getAuthor().getUsername(),
                    post.getAuthor().getAvatarUrl()
            );

            List<MediaDto> mediaDtos = post.getMedia() != null ? post.getMedia().stream()
                    .map(media -> MediaDto.builder()
                            .id(media.getId())
                            .mediaUrl(minioService.getPresignedUrl(media.getMediaUrl()))
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
                    likedByUser
            );
        });
    }

    public PostDto updatePost(UUID postId, PostCreateDto dto, UUID currentUserId) {
        Post post = getById(postId);
        
        // Check if current user is the author
        if (!post.getAuthor().getId().equals(currentUserId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only update your own posts");
        }
        
        post.setTitle(dto.getTitle());
        post.setContent(dto.getContent());
        post.setUpdatedAt(new java.sql.Timestamp(System.currentTimeMillis()));
        
        Post updatedPost = postRepository.save(post);
        
        // Handle media updates if provided
        List<MediaDto> mediaDtos = List.of();
        if (dto.getMediaFiles() != null && !dto.getMediaFiles().isEmpty()) {
            // Delete old media
            if (updatedPost.getMedia() != null) {
                for (Media oldMedia : updatedPost.getMedia()) {
                    minioService.deleteFile(oldMedia.getMediaUrl());
                    mediaRepository.delete(oldMedia);
                }
            }
            
            // Upload new media
            mediaDtos = dto.getMediaFiles().stream()
                    .filter(file -> file != null && !file.isEmpty())
                    .map(file -> {
                        String mediaUrl = minioService.uploadFile(file);
                        MinioBucketTypes mediaType = getPostMediaType(file.getContentType());
                        
                        if (mediaType == null) {
                            throw new ApiException(HttpStatus.BAD_REQUEST, "Posts only support images and videos");
                        }
                        
                        Media media = new Media();
                        media.setPost(updatedPost);
                        media.setMediaUrl(mediaUrl);
                        media.setMediaType(mediaType);
                        mediaRepository.save(media);
                        
                        return MediaDto.builder()
                                .id(media.getId())
                                .mediaUrl(minioService.getPresignedUrl(mediaUrl))
                                .mediaType(mediaType)
                                .build();
                    })
                    .collect(Collectors.toList());
        } else {
            // Keep existing media if no new files provided
            if (updatedPost.getMedia() != null) {
                mediaDtos = updatedPost.getMedia().stream()
                        .map(media -> MediaDto.builder()
                                .id(media.getId())
                                .mediaUrl(minioService.getPresignedUrl(media.getMediaUrl()))
                                .mediaType(media.getMediaType())
                                .build())
                        .collect(Collectors.toList());
            }
        }
        
        UserSummaryDto authorSummary = new UserSummaryDto(
                updatedPost.getAuthor().getId(),
                updatedPost.getAuthor().getUsername(),
                updatedPost.getAuthor().getAvatarUrl()
        );
        
        int likeCount = likeRepository.countByPostId(postId);
        int commentCount = commentRepository.countByPostId(postId);
        boolean likedByUser = likeRepository.existsByPostIdAndUserId(postId, currentUserId);
        
        return new PostDto(
                updatedPost.getId(),
                updatedPost.getTitle(),
                updatedPost.getContent(),
                mediaDtos,
                authorSummary,
                updatedPost.getCreatedAt(),
                updatedPost.getUpdatedAt(),
                likeCount,
                commentCount,
                likedByUser
        );
    }
    
    public void deletePost(UUID postId, UUID currentUserId) {
        Post post = getById(postId);
        
        // Check if current user is the author
        if (!post.getAuthor().getId().equals(currentUserId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only delete your own posts");
        }
        
        // Delete associated media files from Minio
        if (post.getMedia() != null) {
            for (Media media : post.getMedia()) {
                minioService.deleteFile(media.getMediaUrl());
            }
        }
        
        postRepository.delete(post);
    }

    // Helper method to determine media type from content type (only images and videos for posts)
    private MinioBucketTypes getPostMediaType(String contentType) {
        if (contentType == null) return null;
        if (contentType.startsWith("video")) return MinioBucketTypes.VIDEOS;
        if (contentType.startsWith("image")) return MinioBucketTypes.IMAGES;
        return null; // Reject audio and other types
    }
}
