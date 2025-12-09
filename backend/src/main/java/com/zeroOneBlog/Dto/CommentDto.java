package com.zeroOneBlog.Dto;

import java.sql.Timestamp;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentDto {
    private String id;
    private String content;
    private UserSummaryDto author;
    private Timestamp createdAt;
    private List<CommentDto> replies;
    private int likeCount;
    private boolean likedByCurrentUser;
}
