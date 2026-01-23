package com.zeroOneBlog.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminStatsDto {
    private long total_users;
    private long total_posts;
    private long total_reports;
    private long pending_reports;
}
