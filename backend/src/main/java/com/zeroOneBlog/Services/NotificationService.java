package com.zeroOneBlog.Services;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.zeroOneBlog.Dto.NotificationDto;
import com.zeroOneBlog.Dto.UserSummaryDto;
import com.zeroOneBlog.Entities.Notification;
import com.zeroOneBlog.Entities.User;
import com.zeroOneBlog.Repositories.NotificationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public List<NotificationDto> getNotificationsForUser(UUID userId) {

        return notificationRepository.findAllByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(notification -> new NotificationDto(
                        notification.getId().toString(),
                        notification.getType(),
                        notification.getMessage(),
                        notification.getReferenceId(),
                        notification.isRead(),
                        notification.getCreatedAt(),
                        new UserSummaryDto(
                                notification.getUser().getId(),
                                notification.getUser().getUsername(),
                                notification.getUser().getAvatarUrl())))
                .toList();
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
        List<Notification> notifications = notificationRepository.findAllByUserIdOrderByCreatedAtDesc(user.getId());
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
    }

    public void createNotification(User user, NotificationDto notificationDto) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(notificationDto.getMessage());
        notification.setType(notificationDto.getType());
        notification.setReferenceId(notificationDto.getReferenceId());
        notification.setRead(false);
        notificationRepository.save(notification);
    }

    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public void deleteNotification(UUID id, User user) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }
        notificationRepository.deleteById(id);
    }
}
