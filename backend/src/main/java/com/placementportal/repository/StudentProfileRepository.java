package com.placementportal.repository;

import com.placementportal.model.StudentProfile;
import com.placementportal.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    Optional<StudentProfile> findByUser(User user);
    Optional<StudentProfile> findByUserId(Long userId);
    boolean existsByRollNumber(String rollNumber);
}
