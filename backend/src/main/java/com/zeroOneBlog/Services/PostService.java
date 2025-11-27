package com.zeroOneBlog.Services;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.zeroOneBlog.Dto.PostCreateDto;
import com.zeroOneBlog.Dto.PostDto;
import com.zeroOneBlog.Dto.UserSummaryDto;
import com.zeroOneBlog.Entities.Post;
import com.zeroOneBlog.Entities.User;
import com.zeroOneBlog.Exceptions.ApiException;
import com.zeroOneBlog.Repositories.CommentRepository;
import com.zeroOneBlog.Repositories.LikeRepository;
import com.zeroOneBlog.Repositories.PostRepository;
import com.zeroOneBlog.Repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final LikeRepository likeRepository;
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
        if (post.getMediaUrl() != null && !post.getMediaUrl().isBlank()) {
            post.setMediaUrl(minioService.getPresignedUrl(post.getMediaUrl()));
        }
        int likeCount = likeRepository.countByPostId(postId);
        int commentCount = commentRepository.countByPostId(postId);

        boolean likedByUser = likeRepository.existsByPostIdAndUserId(postId, currentUserId);
        return new PostDto(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                post.getMediaUrl(),
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
        if (dto.getMedia() != null && dto.getMedia().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Media file was not properly streamed");
        }
        // Upload media file if present
        String mediaUrl = null;
        if (dto.getMedia() != null && !dto.getMedia().isEmpty()) {
            mediaUrl = minioService.uploadFile(dto.getMedia());
            post.setMediaUrl(mediaUrl);
        }

        Post savedPost = postRepository.save(post);

        String presignedUrl = (mediaUrl != null && mediaUrl.isBlank()) ? minioService.getPresignedUrl(mediaUrl) : null;

        UserSummaryDto authorSummary = new UserSummaryDto(
                author.getId(),
                author.getUsername(),
                author.getAvatarUrl()
        );

        return new PostDto(
                savedPost.getId(),
                savedPost.getTitle(),
                savedPost.getContent(),
                presignedUrl,
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
            System.out.println("Generating presigned URL for media: " + post.getMediaUrl());
            if (post.getMediaUrl() != null && !post.getMediaUrl().isBlank()) {
                post.setMediaUrl(minioService.getPresignedUrl(post.getMediaUrl()));
            }
            int likeCount = likeRepository.countByPostId(post.getId());
            int commentCount = commentRepository.countByPostId(post.getId());
            boolean likedByUser = likeRepository.existsByPostIdAndUserId(post.getId(), currentUserId);
            return new PostDto(
                    post.getId(),
                    post.getTitle(),
                    post.getContent(),
                    post.getMediaUrl(),
                    authorSummary,
                    post.getCreatedAt(),
                    post.getUpdatedAt(),
                    likeCount,
                    commentCount,
                    likedByUser
            );
        });
    }

}
