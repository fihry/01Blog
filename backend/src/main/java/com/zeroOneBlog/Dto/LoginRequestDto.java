package com.zeroOneBlog.Dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequestDto {
    @NotBlank(message = "Username or email is required")
    @Size(min = 3, max = 50, message = "Username or email must be between 3 and 50 characters")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;
    private boolean rememberMe;
}
