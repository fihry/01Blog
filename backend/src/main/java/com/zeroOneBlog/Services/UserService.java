package com.zeroOneBlog.Services;

import java.util.Optional;
import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.zeroOneBlog.Dto.AuthResponseDto;
import com.zeroOneBlog.Dto.LoginRequestDto;
import com.zeroOneBlog.Dto.RegisterRequestDto;
import com.zeroOneBlog.Dto.UserDto;
import com.zeroOneBlog.Entities.Media;
import com.zeroOneBlog.Entities.Post;
import com.zeroOneBlog.Entities.User;
import com.zeroOneBlog.Exceptions.ApiException;
import com.zeroOneBlog.Repositories.UserRepository;
import com.zeroOneBlog.Security.JwtService;
import com.zeroOneBlog.Types.RoleTypes;

import jakarta.transaction.Transactional;
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
        Optional<User> optionalUser = userRepository.findByEmail(dto.getEmail());
        if (optionalUser.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid credentials");
        }
        User user = optionalUser.get();
        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid credentials");
        }
        // Successful login
        AuthResponseDto response = new AuthResponseDto();
        // generate token or session here if needed
        String token = jwtService.generateToken(user.getUsername(), dto.isRememberMe());
        
        // Generate full media URL for avatar if it exists
        String avatarUrl = user.getAvatarUrl();
        if (avatarUrl != null && !avatarUrl.isBlank()) {
            try {
                avatarUrl = minioService.getMediaUrl(avatarUrl);
            } catch (Exception e) {
                System.err.println("Failed to generate media URL for avatar: " + e.getMessage());
                // Keep original path if URL generation fails
            }
        }
        
        response.setAccessToken(token);
        response.setUser(new UserDto(
                user.getId().toString(),
                user.getUsername(),
                user.getEmail(),
                user.getBio(),
                avatarUrl,
                user.getRole(),
                user.isActive(),
                false,
                user.getPosts() != null ? user.getPosts().size() : 0,
                user.getFollowers() != null ? user.getFollowers().size() : 0,
                user.getFollowing() != null ? user.getFollowing().size() : 0,
                user.getCreatedAt().toString()));
        return response;
    }

    public User getById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }

    public UserDto getUserById(UUID id) {
        User user = getById(id);
        // Only generate presigned URL if avatar exists
        if (user.getAvatarUrl() != null && !user.getAvatarUrl().isBlank()) {
            user.setAvatarUrl(minioService.getMediaUrl(user.getAvatarUrl()));
        }
        boolean isFollowed = userRepository.findById(getCurrentUserId())
                .map(currentUser -> currentUser.getFollowing().stream()
                .anyMatch(u -> u.getId().equals(id)))
                .orElse(false);
        return new UserDto(
                user.getId().toString(),
                user.getUsername(),
                user.getEmail(),
                user.getBio(),
                user.getAvatarUrl(),
                user.getRole(),
                user.isActive(),
                isFollowed,
                user.getPosts() != null ? user.getPosts().size() : 0,
                user.getFollowers() != null ? user.getFollowers().size() : 0,
                user.getFollowing() != null ? user.getFollowing().size() : 0,
                user.getCreatedAt().toString());
    }

    public UserDto updateUser(UUID id, com.zeroOneBlog.Dto.UserUpdateDto dto) {
        User user = getById(id);
        // Only update bio when provided (avoid overwriting with null)
        if (dto.getBio() != null) {
            user.setBio(dto.getBio());
        }
        if (dto.getAvatar() != null && !dto.getAvatar().isEmpty()) {
            String avatar_url = minioService.uploadFile(dto.getAvatar());
            user.setAvatarUrl(avatar_url);
        }
        userRepository.save(user);
        // Only generate presigned URL if avatar exists
        if (user.getAvatarUrl() != null && !user.getAvatarUrl().isBlank()) {
            user.setAvatarUrl(minioService.getMediaUrl(user.getAvatarUrl()));
        }
        boolean isFollowed = userRepository.findById(getCurrentUserId())
                .map(currentUser -> currentUser.getFollowing().stream()
                .anyMatch(u -> u.getId().equals(id)))
                .orElse(false);
        return new UserDto(
                user.getId().toString(),
                user.getUsername(),
                user.getEmail(),
                user.getBio(),
                user.getAvatarUrl(),
                user.getRole(),
                user.isActive(),
                isFollowed,
                user.getPosts() != null ? user.getPosts().size() : 0,
                user.getFollowers() != null ? user.getFollowers().size() : 0,
                user.getFollowing() != null ? user.getFollowing().size() : 0,
                user.getCreatedAt().toString());
    }

    @Transactional
    public void toggleFollowing(UUID followerId, UUID followingId) {
        if (followerId.equals(followingId)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot follow yourself");
        }

        User follower = getById(followerId);
        User followed = getById(followingId);

        boolean isFollowing = follower.getFollowing().stream()
                .anyMatch(user -> user.getId().equals(followingId));

        if (isFollowing) {
            follower.getFollowing().removeIf(user -> user.getId().equals(followingId));
        } else {
            follower.getFollowing().add(followed);
        }

        userRepository.save(follower);
    }

    public Page<UserDto> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(user -> {
            // Only generate presigned URL if avatar exists
            String avatarUrl = user.getAvatarUrl();
            if (avatarUrl != null && !avatarUrl.isBlank()) {
                avatarUrl = minioService.getMediaUrl(avatarUrl);
            }
            boolean isFollowed = userRepository.findById(getCurrentUserId())
                    .map(currentUser -> currentUser.getFollowing().stream()
                    .anyMatch(u -> u.getId().equals(user.getId())))
                    .orElse(false);
            return new UserDto(
                    user.getId().toString(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getBio(),
                    avatarUrl,
                    user.getRole(),
                    user.isActive(),
                    isFollowed,
                    user.getPosts() != null ? user.getPosts().size() : 0,
                    user.getFollowers() != null ? user.getFollowers().size() : 0,
                    user.getFollowing() != null ? user.getFollowing().size() : 0,
                    user.getCreatedAt().toString());
        });
    }

    public UserDto updateUserRole(UUID id, RoleTypes role) {
        User user = getById(id);
        user.setRole(role);
        User savedUser = userRepository.save(user);

        String avatarUrl = savedUser.getAvatarUrl();
        if (avatarUrl != null && !avatarUrl.isBlank()) {
            avatarUrl = minioService.getMediaUrl(avatarUrl);
        }
        boolean isFollowed = userRepository.findById(getCurrentUserId())
                .map(currentUser -> currentUser.getFollowing().stream()
                .anyMatch(u -> u.getId().equals(id)))
                .orElse(false);
        return new UserDto(
                savedUser.getId().toString(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getBio(),
                avatarUrl,
                savedUser.getRole(),
                savedUser.isActive(),
                isFollowed,
                savedUser.getPosts() != null ? savedUser.getPosts().size() : 0,
                savedUser.getFollowers() != null ? savedUser.getFollowers().size() : 0,
                savedUser.getFollowing() != null ? savedUser.getFollowing().size() : 0,
                savedUser.getCreatedAt().toString());
    }

    @Transactional
    public void deleteUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        // 1. Delete files from Minio
        if (user.getPosts() != null) {
            for (Post post : user.getPosts()) {
                if (post.getMedia() != null) {
                    for (Media media : post.getMedia()) {
                        minioService.deleteFile(media.getMediaUrl());
                    }
                }
            }
        }
        if (user.getAvatarUrl() != null && !user.getAvatarUrl().isBlank()) {
            minioService.deleteFile(user.getAvatarUrl());
        }

        // 2. Clear subscriptions (ManyToMany relationships usually need manual clearing)
        for (User follower : user.getFollowers()) {
            follower.getFollowing().remove(user);
        }
        user.getFollowing().clear();
        user.getFollowers().clear();

        // 3. Final Delete - Cascades handle Posts, Comments, Likes, Notifications, Reports
        userRepository.delete(user);
    }

    public UUID getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"))
                .getId();
    }

    public void toggleUserActive(UUID id) {
        User user = getById(id);
        user.setActive(!user.isActive());
        userRepository.save(user);
    }

    public long getUserCount() {
        return userRepository.count();
    }
}
