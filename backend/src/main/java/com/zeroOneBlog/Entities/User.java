package com.zeroOneBlog.Entities;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;

import org.checkerframework.checker.units.qual.C;

import com.zeroOneBlog.Types.RoleTypes;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;


@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 30)
    private String username;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private RoleTypes role = RoleTypes.USER;

    @Column(length = 255)
    private String bio;

    private String avatarUrl;

    private Timestamp createdAt = new Timestamp(System.currentTimeMillis());
    private Timestamp updatedAt = new Timestamp(System.currentTimeMillis());

    @OneToMany(mappedBy = "author", fetch = FetchType.LAZY)
    private List<Post> posts;

    @OneToMany(mappedBy = "author", fetch = FetchType.LAZY)
    private List<Comment> comments;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<Like> likes;

    @ManyToMany
    @JoinTable(
        name = "subscriptions",
        joinColumns = @JoinColumn(name = "follower_id"),
        inverseJoinColumns = @JoinColumn(name = "following_id")
    )
    private List<User> following;

    @ManyToMany(mappedBy = "following")
    private List<User> followers;
}
