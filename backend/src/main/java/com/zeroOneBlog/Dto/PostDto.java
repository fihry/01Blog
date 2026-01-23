package com.zeroOneBlog.Dto;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostDto {
    private UUID id;
    private String title;
    private String content;
    private List<MediaDto> media;
    private UserSummaryDto author;
    private Timestamp createdAt;
    private Timestamp updatedAt;
    private int likeCount;
    private int commentCount;
    private boolean likedByCurrentUser;
}