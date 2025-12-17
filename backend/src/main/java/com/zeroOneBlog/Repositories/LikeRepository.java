package com.zeroOneBlog.Repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.zeroOneBlog.Entities.Like;

@Repository
public interface LikeRepository extends JpaRepository<Like, UUID> {

    boolean existsByPostIdAndUserId(UUID postId, UUID userId);

    int countByPostId(UUID postId);

    void deleteByPostIdAndUserId(UUID postId, UUID userId);
}
