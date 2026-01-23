package com.zeroOneBlog.Services;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.zeroOneBlog.Entities.Notification;
import com.zeroOneBlog.Entities.User;
import com.zeroOneBlog.Repositories.NotificationRepository;
import com.zeroOneBlog.Types.NotificationTypes;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public List<Notification> getNotificationsForUser(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public void markAsRead(UUID id, User user) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public void markAllAsRead(User user) {
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
    }

    public void createNotification(User user, String message, NotificationTypes type) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRead(false);
        notificationRepository.save(notification);
    }
    
    public long getUnreadCount(User user) {
        return notificationRepository.countByUserAndReadFalse(user);
    }
}
