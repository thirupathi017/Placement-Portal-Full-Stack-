package com.placementportal.repository;

import com.placementportal.model.Application;
import com.placementportal.model.JobPosting;
import com.placementportal.model.StudentProfile;
import com.placementportal.model.enums.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByStudent(StudentProfile student);
    List<Application> findByJob(JobPosting job);
    List<Application> findByStatus(ApplicationStatus status);
    boolean existsByStudentAndJob(StudentProfile student, JobPosting job);
}
