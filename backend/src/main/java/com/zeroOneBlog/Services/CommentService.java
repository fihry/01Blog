package com.zeroOneBlog.Services;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.zeroOneBlog.Entities.Comment;
import com.zeroOneBlog.Repositories.CommentRepository;
import com.zeroOneBlog.Entities.User;
import com.zeroOneBlog.Repositories.UserRepository;
import com.zeroOneBlog.Exceptions.ApiException;

import org.springframework.http.HttpStatus;
import com.zeroOneBlog.Dto.CommentCreateDto;
import com.zeroOneBlog.Dto.CommentDto;
import com.zeroOneBlog.Dto.UserSummaryDto;
import com.zeroOneBlog.Entities.Post;
import com.zeroOneBlog.Repositories.PostRepository;
import com.zeroOneBlog.Types.RoleTypes;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor

public class CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    public List<CommentDto> getCommentsByPostId(UUID postId) {
        List<Comment> comments = commentRepository.findByPostId(postId);
        return comments.stream().map(comment -> {
            UUID parentCommentId = comment.getParentComment() != null ? comment.getParentComment().getId() : null;
            CommentDto dto = new CommentDto(
                    comment.getId(),
                    comment.getPost().getId(),
                    parentCommentId,
                    comment.getContent()
            );
            return dto;
        }).toList();
    }

    public CommentCreateDto saveComment(CommentDto comment, UUID userId) {
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "User not found"));

        Post post = postRepository.findById(comment.getPostId())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Post not found"));

        UserSummaryDto authorSummary = new UserSummaryDto(
                author.getId(), author.getUsername(), author.getAvatarUrl()
        );

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

        return new CommentCreateDto(
                savedComment.getId(),
                post.getId(),
                savedComment.getContent(),
                authorSummary,
                savedComment.getCreatedAt(),
                savedComment.getUpdatedAt()
        );
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
        UserSummaryDto authorSummary = new UserSummaryDto(author.getId(), author.getUsername(), author.getAvatarUrl());
        return new CommentCreateDto(
                updatedComment.getId(),
                updatedComment.getPost().getId(),
                updatedComment.getContent(),
                authorSummary,
                updatedComment.getCreatedAt(),
                updatedComment.getUpdatedAt()
        );
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
