package com.zeroOneBlog.Controllers;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zeroOneBlog.Dto.UserDto;
import com.zeroOneBlog.Dto.UserUpdateDto;
import com.zeroOneBlog.Exceptions.ApiException;
import com.zeroOneBlog.Services.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<Page<UserDto>> getAllUsers(Pageable pageable) {
        return ResponseEntity.ok(userService.getAllUsers(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping(path = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<UserDto> updateUserMultipart(
            @PathVariable UUID id,
            @ModelAttribute @Valid UserUpdateDto dto) throws Exception {
        // Check authorization: user can only update their own profile
        UUID currentUserId = userService.getCurrentUserId();
        if (!currentUserId.equals(id)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only update your own profile");
        }
        UserDto updatedUser = userService.updateUser(id, dto);
        return ResponseEntity.ok(updatedUser);
    }

    // Accept JSON updates (no avatar) for clients that send application/json
    @PutMapping(path = "/{id}", consumes = {"application/json"})
    public ResponseEntity<UserDto> updateUserJson(
            @PathVariable UUID id,
            @RequestBody @Valid UserUpdateDto dto) {
        // Check authorization: user can only update their own profile
        UUID currentUserId = userService.getCurrentUserId();
        if (!currentUserId.equals(id)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only update your own profile");
        }
        UserDto updatedUser = userService.updateUser(id, dto);
        return ResponseEntity.ok(updatedUser);
    }

    @PostMapping("/{id}/subscribe")
    public ResponseEntity<?> subscribe(@PathVariable UUID id) {
        userService.toggleFollowing(userService.getCurrentUserId(), id);
        return ResponseEntity.ok().build();
    }

    // @DeleteMapping("/{id}/unsubscribe")
    // public ResponseEntity<?> unsubscribe(@PathVariable UUID id) {
    //     userService.unsubscribeUser(id, id);
    //     return ResponseEntity.ok().build();
    // }
}
