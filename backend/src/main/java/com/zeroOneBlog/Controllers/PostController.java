package com.zeroOneBlog.Controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.zeroOneBlog.Dto.PostCreateDto;
import com.zeroOneBlog.Dto.PostDto;
import com.zeroOneBlog.Security.CustomUserDetails;
import com.zeroOneBlog.Services.PostService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @GetMapping({ "", "/" })
    public ResponseEntity<List<PostDto>> getAllPosts(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        UUID currentUserId = userDetails.getId();
        List<PostDto> posts = postService.getAllPosts(currentUserId);
        return ResponseEntity.ok(posts);
    }
    @GetMapping("/following")
    public ResponseEntity<List<PostDto>> getFollwedUsersPosts(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        UUID currentUserId = userDetails.getId();
        List<PostDto> posts = postService.getAllFollowedUsersPosts(currentUserId);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/{postId}")
    public ResponseEntity<PostDto> getPost(
            @PathVariable UUID postId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        UUID currentUserId = userDetails.getId();
        PostDto post = postService.getByPostId(postId, currentUserId);
        return ResponseEntity.ok(post);
    }

    @PostMapping(path = { "", "/" })
    public ResponseEntity<PostDto> createPost(
            @RequestPart("post") @Valid PostCreateDto postCreateDto,
            @RequestPart(value = "media", required = false) List<MultipartFile> mediaFiles,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        // If files were uploaded in the 'media' part, set them into the DTO so the
        // service can handle them
        if (mediaFiles != null && !mediaFiles.isEmpty()) {
            postCreateDto.setMediaFiles(mediaFiles);
        }

        UUID currentUserId = userDetails.getId();
        PostDto createdPost = postService.createPost(postCreateDto, currentUserId);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdPost);
    }

    @PutMapping(path = "/{postId}")
    public ResponseEntity<PostDto> updatePost(
            @PathVariable UUID postId,
            @RequestPart("post") @Valid PostCreateDto postUpdateDto,
            @RequestPart(value = "media", required = false) List<MultipartFile> mediaFiles,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        if (mediaFiles != null && !mediaFiles.isEmpty()) {
            postUpdateDto.setMediaFiles(mediaFiles);
        }

        UUID currentUserId = userDetails.getId();
        PostDto updatedPost = postService.updatePost(postId, postUpdateDto, currentUserId);
        return ResponseEntity.ok(updatedPost);
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(
            @PathVariable UUID postId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        UUID currentUserId = userDetails.getId();
        postService.deletePost(postId, currentUserId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<Void> toggleLike(
            @PathVariable UUID postId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        UUID currentUserId = userDetails.getId();
        postService.toggleLike(postId, currentUserId);
        return ResponseEntity.ok().build();
    }
}
