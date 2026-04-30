package com.placementportal.repository;

import com.placementportal.model.Application;
import com.placementportal.model.Interview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByApplication(Application application);
    List<Interview> findByApplicationIn(List<Application> applications);
    List<Interview> findByApplication_Student(com.placementportal.model.StudentProfile student);
    List<Interview> findByApplication_Job_Company(com.placementportal.model.CompanyProfile company);
}
