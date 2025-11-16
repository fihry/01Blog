package com.zeroOneBlog.Controllers;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.zeroOneBlog.Services.UserService;
import com.zeroOneBlog.Dto.UserDto;

import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(
            @PathVariable UUID id,
            @RequestBody UserDto dto
    ) {    return ResponseEntity.ok(userService.updateUser(id, dto));
    }

    @PostMapping("/{id}/subscribe")
    public ResponseEntity<?> subscribe(@PathVariable UUID id) {
        userService.subscribeUser(userService.getCurrentUserId(), id);
        return ResponseEntity.ok("Subscribed successfully");
    }

    @DeleteMapping("/{id}/unsubscribe")
    public ResponseEntity<?> unsubscribe(@PathVariable UUID id) {
        userService.unsubscribeUser(id, id);
        return ResponseEntity.ok("Unsubscribed successfully");
    }
}

