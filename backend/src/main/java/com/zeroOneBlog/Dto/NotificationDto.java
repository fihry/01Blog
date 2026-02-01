package com.zeroOneBlog.Dto;

import java.sql.Timestamp;
import java.util.UUID;

import com.zeroOneBlog.Types.NotificationTypes;

import jakarta.validation.constraints.Size;
// import jakarta.persistence.Enumerated;
// import jakarta.persistence.EnumType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private String id;
    private NotificationTypes type;
    @Size(max = 200, message = "Notification message cannot exceed 200 characters")
    private String message;
    private UUID referenceId;
    private boolean read;
    private Timestamp createdAt;
    private UserSummaryDto author;
}