package com.zeroOneBlog.Controllers;


import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zeroOneBlog.Dto.CommentCreateDto;
import com.zeroOneBlog.Dto.CommentDto;
import com.zeroOneBlog.Security.CustomUserDetails;
import com.zeroOneBlog.Services.CommentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;



@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class CommentsControler {

    private final CommentService commentService;
    
    @GetMapping("/{postId}/comments")
    public ResponseEntity<List<CommentDto>> getCommentsByPostId(@PathVariable UUID postId) {
        List<CommentDto> comments = commentService.getCommentsByPostId(postId);
        return ResponseEntity.ok(comments);
    }

    @PostMapping("/{postId}/comments")
    public ResponseEntity<CommentCreateDto> saveComment(
        @Valid @PathVariable UUID postId,
        @RequestBody CommentDto comment,
        @AuthenticationPrincipal CustomUserDetails userDetails) {
        comment.setPostId(postId);
        CommentCreateDto  savedComment = commentService.saveComment(comment, userDetails.getId());
        return ResponseEntity.ok(savedComment);
    }

    @PutMapping("/{postId}/comments/{commentId}")
    public ResponseEntity<CommentCreateDto> updateComment(
        @PathVariable UUID postId,
        @PathVariable UUID commentId,
        @Valid @RequestBody CommentDto comment,
        @AuthenticationPrincipal CustomUserDetails userDetails){
        comment.setId(commentId);
        comment.setPostId(postId);
         CommentCreateDto updatedComment = commentService.updateComment(comment, userDetails.getId());
         return ResponseEntity.ok(updatedComment);
    }

    @DeleteMapping("/{postId}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
        @PathVariable UUID postId,
        @PathVariable UUID commentId,
        @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        commentService.deleteCommentById(commentId,userDetails.getId());
        return ResponseEntity.noContent().build();
    }


    // Replies endpoints for comments
    @PostMapping("/{postId}/comments/reply")
    public ResponseEntity<CommentCreateDto> saveReply(
        @Valid @PathVariable UUID postId,
        @RequestBody CommentDto reply,
        @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        reply.setPostId(postId);
        CommentCreateDto savedComment = commentService.saveComment(reply, userDetails.getId());
        return ResponseEntity.ok(savedComment);
    }

    @GetMapping("/{postId}/comments/replies")
    public ResponseEntity<List<CommentDto>> getRepliesByCommentId(@PathVariable UUID postId) {
        List<CommentDto> replies = commentService.getCommentsByPostId(postId);
        return ResponseEntity.ok(replies);
    }
    @PutMapping("/{postId}/comments/replies/{replyId}")
    public ResponseEntity<CommentCreateDto> updateReply(@PathVariable UUID postId, @PathVariable UUID replyId, @Valid @RequestBody CommentDto reply, @AuthenticationPrincipal CustomUserDetails userDetails) {
        reply.setId(replyId);
        reply.setPostId(postId);
        CommentCreateDto updatedReply = commentService.updateComment(reply, userDetails.getId());
        return ResponseEntity.ok(updatedReply);
    }

    @DeleteMapping("/{postId}/comments/replies/{replyId}")
    public ResponseEntity<Void> deleteReply(@PathVariable UUID postId, @PathVariable UUID commentId, @PathVariable UUID replyId, @AuthenticationPrincipal CustomUserDetails userDetails) {
        commentService.deleteCommentById(replyId, userDetails.getId());
        return ResponseEntity.noContent().build(); 
    }
}