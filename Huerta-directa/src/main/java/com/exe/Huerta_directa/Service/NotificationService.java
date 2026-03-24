package com.exe.Huerta_directa.Service;

import com.exe.Huerta_directa.Entity.Notification;
import java.util.List;

public interface NotificationService {
    void createNotification(Long userId, String message);
    List<Notification> getUnreadNotifications(Long userId);
    void markAsRead(Long notificationId);
    void markAllAsRead(Long userId);
}
