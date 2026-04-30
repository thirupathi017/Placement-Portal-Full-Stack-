package com.placementportal.controller;

import com.placementportal.model.User;
import com.placementportal.service.AuthService;
import com.placementportal.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<?> getMyNotifications() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(notificationService.getNotificationsForUser(user));
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead() {
        User user = authService.getCurrentUser();
        notificationService.markAllAsRead(user);
        return ResponseEntity.ok().build();
    }
}
