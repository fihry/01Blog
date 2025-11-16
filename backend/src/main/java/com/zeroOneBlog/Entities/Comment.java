package com.zeroOneBlog.Entities;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;
import jakarta.persistence.*;



@Entity
@Table(name = "comments")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    private Timestamp createdAt = new Timestamp(System.currentTimeMillis());

    // Replies in same table
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_comment_id")
    private Comment parentComment;

    @OneToMany(mappedBy = "parentComment", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Comment> replies;
}
