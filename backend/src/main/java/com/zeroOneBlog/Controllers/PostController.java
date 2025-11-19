package com.zeroOneBlog.Controllers;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;

import com.zeroOneBlog.Dto.PostCreateDto;
import com.zeroOneBlog.Dto.PostDto;
import com.zeroOneBlog.Security.CustomUserDetails;
import com.zeroOneBlog.Services.PostService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/posts/")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @GetMapping("/{postId}")
    public ResponseEntity<PostDto> getPost(
            @PathVariable UUID postId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        UUID currentUserId = userDetails.getId();
        PostDto post = postService.getByPostId(postId, currentUserId);
        return ResponseEntity.ok(post);
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<PostDto> createPost(
            @RequestPart("post") @Valid PostCreateDto postCreateDto,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        UUID currentUserId = userDetails.getId();
        PostDto createdPost = postService.createPost(postCreateDto, currentUserId);
        return ResponseEntity
        .status(HttpStatus.CREATED)
        .body(createdPost);
    }
}
