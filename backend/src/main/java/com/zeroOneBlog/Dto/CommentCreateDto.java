package com.zeroOneBlog.Dto;

import java.sql.Timestamp;
import java.util.UUID;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentCreateDto {
    private UUID id;
    private UUID postId;
    @Size(max = 500, message = "Content must not exceed 500 characters")
    private String content;
    private UserSummaryDto author;
    private Timestamp createdAt;
    private Timestamp updatedAt;
}
