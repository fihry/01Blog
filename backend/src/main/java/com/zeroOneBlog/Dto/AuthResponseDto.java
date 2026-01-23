package com.zeroOneBlog.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDto {
    private String accessToken;   // JWT token
    private String tokenType = "Bearer";
    private UserDto user;
}