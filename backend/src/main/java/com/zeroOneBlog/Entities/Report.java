package com.zeroOneBlog.Entities;

import java.sql.Timestamp;
import java.util.UUID;

import com.zeroOneBlog.Types.ReportTypes;
import com.zeroOneBlog.Types.StatusTypes;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "reports")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_id", nullable = true)
    private User target;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = true)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_id", nullable = true)
    private Comment comment;
    
    @Enumerated(EnumType.STRING)
    private ReportTypes reportType;
    
    private String reason;

    @Enumerated(EnumType.STRING)
    private StatusTypes status = StatusTypes.PENDING;
    
    private Timestamp createdAt = new Timestamp(System.currentTimeMillis());
}
