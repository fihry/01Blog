package com.zeroOneBlog.Repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.zeroOneBlog.Entities.Post;
import com.zeroOneBlog.Entities.User;

public interface PostRepository extends JpaRepository<Post, UUID> {
    @Override
    Optional<Post> findById(UUID id);

    List<Post> findByAuthorOrderByCreatedAtDesc(User author);

    List<Post> findByAuthor(User author);

    List<Post> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"author"})
    List<Post>findByAuthorInOrderByCreatedAtDesc(List<User> foolowedList);

    // List<Post> findByAuthorIdOrderByCreatedAtDesc(UUID authorId);

    // List<Post> findTop10ByOrderByCreatedAtDesc();

    // List<Post> findByTitleContainingIgnoreCase(String title);

    // List<Post> findByContentContainingIgnoreCase(String content);
}


