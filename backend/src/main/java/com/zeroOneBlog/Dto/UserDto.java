package com.zeroOneBlog.Dto;

import com.zeroOneBlog.Types.RoleTypes;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private String id;
    private String username;
    private String email;
    private String bio;
    private String avatarUrl;
    private RoleTypes role;
    private boolean isActive;
    private boolean isFollowed;
    private long postsCount;
    private long followersCount;
    private long followingCount;
    private String createdAt;
}
