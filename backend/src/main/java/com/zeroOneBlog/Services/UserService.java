package com.zeroOneBlog.Services;

import java.util.Optional;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.zeroOneBlog.Dto.AuthResponseDto;
import com.zeroOneBlog.Dto.LoginRequestDto;
import com.zeroOneBlog.Dto.RegisterRequestDto;
import com.zeroOneBlog.Dto.UserDto;
import com.zeroOneBlog.Entities.User;
import com.zeroOneBlog.Repositories.UserRepository;
import com.zeroOneBlog.Types.RoleTypes;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Registration
    public User register(RegisterRequestDto dto) {
        if (userRepository.existsByUsername(dto.getUsername()))
            throw new RuntimeException("Username already taken");
        if (userRepository.existsByEmail(dto.getEmail()))
            throw new RuntimeException("Email already registered");

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole(RoleTypes.USER);
        return userRepository.save(user);
    }

    // Login
    public AuthResponseDto login(LoginRequestDto dto) {
        Optional<User> optionalUser = userRepository.findByUsername(dto.getUsername());
        if (optionalUser.isEmpty())
            optionalUser = userRepository.findByEmail(dto.getUsername());
        if (optionalUser.isEmpty())
            throw new RuntimeException("Invalid credentials");

        User user = optionalUser.get();
        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword()))
            throw new RuntimeException("Invalid credentials");
        // Successful login
        AuthResponseDto response = new AuthResponseDto();
        // generate token or session here if needed
        String token = new JwtService().generateToken(user.getUsername(), dto.isRememberMe());
        response.setAccessToken(token);
        response.setUser(new UserDto(
                user.getId().toString(),
                user.getUsername(),
                user.getEmail(),
                user.getBio(),
                user.getAvatarUrl(),
                user.getRole(),
                user.isActive()));
        return response;
    }

    public User getById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public UserDto getUserById(UUID id) {
        User user = getById(id);
        return new UserDto(
                user.getId().toString(),
                user.getUsername(),
                user.getEmail(),
                user.getBio(),
                user.getAvatarUrl(),
                user.getRole(),
                user.isActive());
    }

    public UserDto updateUser(UUID id, UserDto dto) {
        User user = getById(id);
        user.setBio(dto.getBio());
        user.setAvatarUrl(dto.getAvatarUrl());
        userRepository.save(user);
        return new UserDto(
                user.getId().toString(),
                user.getUsername(),
                user.getEmail(),
                user.getBio(),
                user.getAvatarUrl(),
                user.getRole(),
                user.isActive());
    }

    public void subscribeUser(UUID followerId, UUID followingId) {
        User follower = getById(followerId);
        User following = getById(followingId);
        follower.getFollowing().add(following);
        userRepository.save(follower);
    }

    public void unsubscribeUser(UUID followerId, UUID followingId) {
        User follower = getById(followerId);
        User following = getById(followingId);
        follower.getFollowing().remove(following);
        userRepository.save(follower);
    }

    public UUID getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }
}
