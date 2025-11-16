package com.zeroOneBlog.Entities;

import jakarta.persistence.*;
import java.sql.Timestamp;
import java.util.UUID;



@Entity
@Table(name = "likes")
public class Like {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private Timestamp createdAt = new Timestamp(System.currentTimeMillis());
}
