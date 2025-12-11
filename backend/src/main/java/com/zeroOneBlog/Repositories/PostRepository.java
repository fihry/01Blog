package com.zeroOneBlog.Repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.zeroOneBlog.Entities.Post;
import com.zeroOneBlog.Entities.User;

public interface PostRepository extends JpaRepository<Post, UUID> {
    @Override
    Optional<Post> findById(UUID id);

    // Replace all "user" with "author"
    List<Post> findByAuthor(User author);

    List<Post> findByAuthorOrderByCreatedAtDesc(User author);

    Page<Post> findByAuthor(User author, Pageable pageable);

    Page<Post> findByAuthorOrderByCreatedAtDesc(User author, Pageable pageable);

    List<Post> findByAuthorId(UUID authorId);

    List<Post> findByAuthorIdOrderByCreatedAtDesc(UUID authorId);

    Page<Post> findByAuthorId(UUID authorId, Pageable pageable);

    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);

    List<Post> findTop10ByOrderByCreatedAtDesc();

    List<Post> findByTitleContainingIgnoreCase(String title);

    List<Post> findByContentContainingIgnoreCase(String content);
}


