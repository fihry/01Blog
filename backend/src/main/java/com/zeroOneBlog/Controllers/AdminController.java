package com.zeroOneBlog.Controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zeroOneBlog.Dto.UserDto;
import com.zeroOneBlog.Services.PostService;
import com.zeroOneBlog.Services.UserService;
import com.zeroOneBlog.Types.RoleTypes;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final PostService postService;
    private final com.zeroOneBlog.Services.ReportService reportService;

    @GetMapping("/stats")
    public ResponseEntity<com.zeroOneBlog.Dto.AdminStatsDto> getStats() {
        return ResponseEntity.ok(com.zeroOneBlog.Dto.AdminStatsDto.builder()
                .total_users(userService.getUserCount())
                .total_posts(postService.getPostCount())
                .total_reports(reportService.getReportCount())
                .pending_reports(reportService.getPendingReportCount())
                .build());
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<UserDto> updateUserRole(
            @PathVariable UUID id,
            @RequestBody RoleTypes role) {
        return ResponseEntity.ok(userService.updateUserRole(id, role));
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable UUID id) {
        postService.deletePostByAdmin(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/users/{id}/ban")
    public ResponseEntity<Void> banUser(@PathVariable UUID id) {
        userService.toggleUserActive(id);
        return ResponseEntity.ok().build();
    }
}
