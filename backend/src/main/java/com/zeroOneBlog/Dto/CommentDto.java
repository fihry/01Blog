package com.zeroOneBlog.Dto;

import java.sql.Timestamp;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentDto {
    private UUID id;
    private UUID postId;
    UserSummaryDto author;
    @JsonIgnore
    private UUID parentCommentId;
    @Size(max = 500, message = "Content must not exceed 500 characters")
    private String content;

    private Timestamp createdAt;
    private Timestamp updatedAt;
}
