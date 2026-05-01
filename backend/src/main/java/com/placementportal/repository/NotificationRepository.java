package com.placementportal.repository;

import com.placementportal.model.Notification;
import com.placementportal.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    long countByUserAndIsReadFalse(User user);
    void deleteByUser(User user);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM Notification n WHERE n.message LIKE concat('%', :keyword, '%')")
    void deleteByMessageContaining(@org.springframework.data.repository.query.Param("keyword") String keyword);
}
