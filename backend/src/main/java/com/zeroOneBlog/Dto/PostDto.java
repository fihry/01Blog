package com.zeroOneBlog.Dto;

import java.sql.Timestamp;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostDto {
    private UUID id;
    @NotBlank(message = "Title cannot be empty")
    @Size(min = 10, max = 100, message = "Title must be between 10 and 100 characters")
    private String title;
    @NotBlank(message = "Content cannot be empty")
    @Size(min=100, max = 10000, message = "Content must be between 100 and 10000 characters")
    private String content;
    private String mediaUrl;
    private UserSummaryDto author;
    private Timestamp createdAt;
    private Timestamp updatedAt;
    private int likeCount;
    private int commentCount;
    private boolean likedByCurrentUser;
}
