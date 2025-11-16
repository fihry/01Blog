package com.zeroOneBlog.Dto;

import com.zeroOneBlog.Types.RoleTypes;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private String id;
    @NotBlank(message = "Username cannot be empty")
    @Size(min = 3, max = 30, message = "Username must be between 3 and 30 characters")
    private String username;

    @NotBlank(message = "Email cannot be empty")
    @Email(message = "Email should be valid")
    private String email;

    @Size(max = 255, message = "Bio must not exceed 255 characters")
    private String bio;
    private String avatarUrl;
    private RoleTypes role;
    private boolean isActive;
}
