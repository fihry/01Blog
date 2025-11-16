package com.zeroOneBlog.Entities;

import java.sql.Timestamp;
import java.util.UUID;
import jakarta.persistence.*;
import com.zeroOneBlog.Types.NotificationTypes;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    private NotificationTypes type;
    
    private String message;
    private boolean read = false;
    private Timestamp createdAt = new Timestamp(System.currentTimeMillis());
}
