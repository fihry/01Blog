package com.zeroOneBlog.Repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.zeroOneBlog.Entities.Comment;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {
    int countByPostId(UUID postId);
}
