package com.zeroOneBlog.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Size;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;

import java.sql.Timestamp;

import com.zeroOneBlog.Types.NotificationTypes;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private String id;
    @Enumerated(EnumType.STRING)
    private NotificationTypes type;
    @Size(max = 200, message = "Notification message cannot exceed 200 characters")
    private String message;
    private boolean read;
    private Timestamp createdAt;
}
