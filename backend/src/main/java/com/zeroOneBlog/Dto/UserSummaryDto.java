package com.zeroOneBlog.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryDto {
    private String id;
    @Size(min = 3, max = 30, message = "Username must be between 3 and 30 characters")
    private String username;
    private String avatarUrl;
}