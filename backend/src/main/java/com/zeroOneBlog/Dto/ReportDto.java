package com.zeroOneBlog.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.sql.Timestamp;
import com.zeroOneBlog.Types.StatusTypes;
import  com.zeroOneBlog.Types.ReportTypes;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportDto {
    private String id;
    private UserSummaryDto reporter;
    private String targetId; // post | comment | user being reported ID 
    private ReportTypes reportType;
    private String reason;
    private Timestamp createdAt;
    private StatusTypes status;
}
