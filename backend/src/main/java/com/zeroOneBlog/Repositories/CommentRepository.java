package com.zeroOneBlog.Repositories;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.zeroOneBlog.Entities.Comment;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {
    @Override
    Optional<Comment> findById(UUID commentId);
    int countByPostId(UUID postId);
    List<Comment> findByPostId(UUID postId);
}
