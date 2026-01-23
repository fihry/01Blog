package com.zeroOneBlog.Repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.zeroOneBlog.Entities.Notification;
import com.zeroOneBlog.Entities.User;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    
    long countByUserAndReadFalse(User user);
}
