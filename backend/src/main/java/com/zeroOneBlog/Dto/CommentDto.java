package com.zeroOneBlog.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.sql.Timestamp;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentDto {
    private String id;
    @NotBlank(message = "Comment content cannot be empty")
    @Size(min = 1, max = 1000, message = "Comment content must be between 1 and 1000 characters")
    private String content;
    private UserSummaryDto author;
    private Timestamp createdAt;
    private List<CommentDto> replies;
    private int likeCount;
    private boolean likedByCurrentUser;
}
