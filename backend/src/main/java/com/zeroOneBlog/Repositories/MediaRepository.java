package com.zeroOneBlog.Repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.zeroOneBlog.Entities.Media;

@Repository
public interface MediaRepository extends JpaRepository<Media, UUID> {
    List<Media> findByPostId(UUID postId);
    void deleteByPostId(UUID postId);
}
