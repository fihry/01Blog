package com.zeroOneBlog.Entities;

import java.sql.Timestamp;
import java.util.UUID;

import com.zeroOneBlog.Types.StatusTypes;
import com.zeroOneBlog.Types.ReportTypes;

import jakarta.persistence.*;

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
    @JoinColumn(name = "target_id", nullable = false)
    private User target;
    
    @Enumerated(EnumType.STRING)
    private ReportTypes reportType;
    
    private String reason;

    @Enumerated(EnumType.STRING)
    private StatusTypes status = StatusTypes.PENDING;
    
    private Timestamp createdAt = new Timestamp(System.currentTimeMillis());
}
