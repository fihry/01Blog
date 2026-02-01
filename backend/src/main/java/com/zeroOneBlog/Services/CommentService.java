package com.zeroOneBlog.Services;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.zeroOneBlog.Dto.CommentCreateDto;
import com.zeroOneBlog.Dto.CommentDto;
import com.zeroOneBlog.Dto.NotificationDto;
import com.zeroOneBlog.Dto.UserSummaryDto;
import com.zeroOneBlog.Entities.Comment;
import com.zeroOneBlog.Entities.Post;
import com.zeroOneBlog.Entities.User;
import com.zeroOneBlog.Exceptions.ApiException;
import com.zeroOneBlog.Repositories.CommentRepository;
import com.zeroOneBlog.Repositories.PostRepository;
import com.zeroOneBlog.Repositories.UserRepository;
import com.zeroOneBlog.Types.NotificationTypes;
import com.zeroOneBlog.Types.RoleTypes;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor

public class CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final MinioService minioService;
    private final NotificationService notificationService;

    public List<CommentDto> getCommentsByPostId(UUID postId) {
        List<Comment> comments = commentRepository.findByPostId(postId);
        return comments.stream().map(comment -> {
            UUID parentCommentId = comment.getParentComment() != null ? comment.getParentComment().getId() : null;
            String author = comment.getAuthor().getAvatarUrl() != null
                    ? minioService.getMediaUrl(comment.getAuthor().getAvatarUrl())
                    : null;
            UserSummaryDto authorSummary = new UserSummaryDto(
                    comment.getAuthor().getId(),
                    comment.getAuthor().getUsername(),
                    author);
            CommentDto dto = new CommentDto(
                    comment.getId(),
                    comment.getPost().getId(),
                    authorSummary,
                    parentCommentId,
                    comment.getContent(),
                    comment.getCreatedAt(),
                    comment.getUpdatedAt());
            return dto;
        }).toList();
    }

    public CommentCreateDto saveComment(CommentDto comment, UUID userId) {
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "User not found"));

        Post post = postRepository.findById(comment.getPostId())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Post not found"));

        String avatarUrl = author.getAvatarUrl();
        if (avatarUrl != null) {
            avatarUrl = minioService.getMediaUrl(avatarUrl);
        }
        UserSummaryDto authorSummary = new UserSummaryDto(
                author.getId(), author.getUsername(), avatarUrl);

        Comment newComment = new Comment();
        newComment.setContent(comment.getContent());
        newComment.setAuthor(author);
        newComment.setPost(post);

        if (comment.getParentCommentId() != null) {
            Comment parent = commentRepository.findById(comment.getParentCommentId())
                    .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Parent comment not found"));
            newComment.setParentComment(parent);
        }

        Comment savedComment = commentRepository.save(newComment);

        // Notify post author (if not the commenter)
        try {
            User postAuthor = post.getAuthor();
            String commenterName = author.getUsername();
            if (postAuthor != null && !postAuthor.getId().equals(author.getId())) {
                NotificationDto notificationDto = new NotificationDto(
                        null,
                        NotificationTypes.COMMENT,
                        commenterName + " commented on your post"
                                + (post.getTitle() != null ? ": " + post.getTitle() : ""),
                        post.getId(),
                        false,
                        null,
                        authorSummary);
                notificationService.createNotification(postAuthor, notificationDto);
            }

            // If replying to a comment, notify the parent comment's author (if different)
            if (savedComment.getParentComment() != null) {
                User parentAuthor = savedComment.getParentComment().getAuthor();
                if (parentAuthor != null && !parentAuthor.getId().equals(author.getId())
                        && !parentAuthor.getId().equals(post.getAuthor().getId())) {
                    String replyMessage = commenterName + " replied to your comment";
                    if (post.getTitle() != null)
                        replyMessage += " on: " + post.getTitle();
                    NotificationDto replyNotificationDto = new NotificationDto(
                            null,
                            NotificationTypes.COMMENT,
                            replyMessage,
                            post.getId(),
                            false,
                            null,
                            authorSummary
                        );
                    notificationService.createNotification(parentAuthor, replyNotificationDto);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return new CommentCreateDto(
                savedComment.getId(),
                post.getId(),
                savedComment.getContent(),
                authorSummary,
                savedComment.getCreatedAt(),
                savedComment.getUpdatedAt());
    }

    public CommentCreateDto updateComment(CommentDto comment, UUID userId) {
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "User not found"));
        Comment existingComment = commentRepository.findById(comment.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Comment not found"));
        // Check if the user is the author of the comment
        if (!existingComment.getAuthor().getId().equals(userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You are not authorized to update this comment");
        }
        existingComment.setContent(comment.getContent());
        Comment updatedComment = commentRepository.save(existingComment);
        String avatarUrl = author.getAvatarUrl();
        if (avatarUrl != null) {
            avatarUrl = minioService.getMediaUrl(avatarUrl);
        }
        UserSummaryDto authorSummary = new UserSummaryDto(author.getId(), author.getUsername(), avatarUrl);
        return new CommentCreateDto(
                updatedComment.getId(),
                updatedComment.getPost().getId(),
                updatedComment.getContent(),
                authorSummary,
                updatedComment.getCreatedAt(),
                updatedComment.getUpdatedAt());
    }

    public void deleteCommentById(UUID commentId, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "User not found"));
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Comment not found"));
        // Check if the user is the author of the comment or has admin role
        if (!comment.getAuthor().getId().equals(userId) && !user.getRole().equals(RoleTypes.ADMIN)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You are not authorized to delete this comment");
        }
        commentRepository.deleteById(commentId);
    }
}
