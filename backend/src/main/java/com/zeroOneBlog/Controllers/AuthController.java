package com.zeroOneBlog.Controllers;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zeroOneBlog.Dto.AuthResponseDto;
import com.zeroOneBlog.Dto.LoginRequestDto;
import com.zeroOneBlog.Dto.RegisterRequestDto;
import com.zeroOneBlog.Services.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor

public class AuthController {
    final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid LoginRequestDto dto) {
        return ResponseEntity.ok(userService.login(dto));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDto> register(@RequestBody @Valid RegisterRequestDto dto) {
        userService.register(dto);
        // Auto-login after registration
        LoginRequestDto loginDto = new LoginRequestDto();
        loginDto.setEmail(dto.getEmail());
        loginDto.setPassword(dto.getPassword());
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.login(loginDto));
    }

}
