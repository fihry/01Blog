package com.zeroOneBlog.Entities;

import java.sql.Timestamp;
import java.util.UUID;
import java.util.List;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;


@Entity
@Table(name = "posts")
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, length = 10000)
    private String content;

    private String mediaUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    private Timestamp createdAt = new Timestamp(System.currentTimeMillis());
    private Timestamp updatedAt = new Timestamp(System.currentTimeMillis());

    @OneToMany(mappedBy = "post", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Comment> comments;

    @OneToMany(mappedBy = "post", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Like> likes;

    @PreUpdate
    public void onUpdate() {
        updatedAt = new Timestamp(System.currentTimeMillis());
    }
}
