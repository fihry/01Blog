package com.zeroOneBlog.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.sql.Timestamp;
import java.util.UUID;

import com.zeroOneBlog.Types.StatusTypes;
import  com.zeroOneBlog.Types.ReportTypes;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportDto {
    private UUID id;
    private UserSummaryDto reporter;
    private UUID targetId; // post | comment | user being reported ID 
    private ReportTypes reportType;
    private String reason;
    private Timestamp createdAt;
    private StatusTypes status;
}
