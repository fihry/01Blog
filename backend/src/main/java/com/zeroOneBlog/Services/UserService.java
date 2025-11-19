package com.zeroOneBlog.Services;

import java.util.Optional;
import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.zeroOneBlog.Dto.AuthResponseDto;
import com.zeroOneBlog.Dto.LoginRequestDto;
import com.zeroOneBlog.Dto.RegisterRequestDto;
import com.zeroOneBlog.Dto.UserDto;
import com.zeroOneBlog.Entities.User;
import com.zeroOneBlog.Exceptions.ApiException;
import com.zeroOneBlog.Repositories.UserRepository;
import com.zeroOneBlog.Types.MinioBucketTypes;
import com.zeroOneBlog.Types.RoleTypes;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final MinioService minioService;

    // Registration
    public User register(@Valid RegisterRequestDto dto) {
        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole(RoleTypes.USER);
        try {
            return userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            if (userRepository.existsByUsername(dto.getUsername())) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Username already taken");
            }
            if (userRepository.existsByEmail(dto.getEmail())) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Email already registered");
            }
            throw new ApiException(HttpStatus.BAD_REQUEST, "User registration failed");
        }
    }

    // Login
    public AuthResponseDto login(LoginRequestDto dto) {
        Optional<User> optionalUser = userRepository.findByUsername(dto.getUsername());
        if (optionalUser.isEmpty())
            optionalUser = userRepository.findByEmail(dto.getUsername());
        if (optionalUser.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid credentials");
        }
        User user = optionalUser.get();
        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword()))
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid credentials");
        // Successful login
        AuthResponseDto response = new AuthResponseDto();
        // generate token or session here if needed
        String token = jwtService.generateToken(user.getUsername(), dto.isRememberMe());
        response.setAccessToken(token);
        response.setUser(new UserDto(
                user.getId().toString(),
                user.getUsername(),
                user.getEmail(),
                user.getBio(),
                user.getAvatarUrl(),
                null,
                user.getRole(),
                user.isActive()));
        return response;
    }

    public User getById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }

    public UserDto getUserById(UUID id) {
        User user = getById(id);
        return new UserDto(
                user.getId().toString(),
                user.getUsername(),
                user.getEmail(),
                user.getBio(),
                user.getAvatarUrl(),
                null,
                user.getRole(),
                user.isActive());
    }

    public UserDto updateUser(UUID id, UserDto dto) {
        User user = getById(id);
        user.setBio(dto.getBio());
        if (!dto.getAvatar().isEmpty() && dto.getAvatar() != null) {
            MinioBucketTypes bucketType = getBucketByContentType(dto.getAvatar().getContentType());
            String avatar_url = minioService.uploadFile(bucketType, dto.getAvatar());
            user.setAvatarUrl(avatar_url);
        }
        userRepository.save(user);
        user.setAvatarUrl(minioService.getPresignedUrl(user.getAvatarUrl()));
        return new UserDto(
                user.getId().toString(),
                user.getUsername(),
                user.getEmail(),
                user.getBio(),
                user.getAvatarUrl(),
                null,
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
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"))
                .getId();
    }

    private MinioBucketTypes getBucketByContentType(String contentType) {
        if (contentType == null) {
            throw new IllegalArgumentException("Content type cannot be null");
        }

        switch (contentType.split("/")[0]) { // Take the part before "/"
            case "image":
                return MinioBucketTypes.IMAGES;
            case "video":
                return MinioBucketTypes.VIDEOS;
            case "audio":
                return MinioBucketTypes.AUDIOS;
            default:
                throw new IllegalArgumentException("Unsupported content type: " + contentType);
        }
    }

}
