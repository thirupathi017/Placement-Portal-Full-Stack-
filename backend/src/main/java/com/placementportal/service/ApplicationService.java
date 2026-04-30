package com.placementportal.service;

import com.placementportal.model.Application;
import com.placementportal.model.JobPosting;
import com.placementportal.model.StudentProfile;
import com.placementportal.model.enums.ApplicationStatus;
import com.placementportal.repository.ApplicationRepository;
import com.placementportal.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final NotificationService notificationService;
    private final StudentProfileRepository studentProfileRepository;

    public Application apply(StudentProfile student, JobPosting job, String resumeUrl) {
        if (applicationRepository.existsByStudentAndJob(student, job)) {
            throw new RuntimeException("Already applied for this job");
        }

        if (job.getEligibilityCgpa() != null) {
            if (student.getCgpa() == null || student.getCgpa().compareTo(job.getEligibilityCgpa()) < 0) {
                throw new RuntimeException("You are not eligible: Minimum CGPA requirement not met.");
            }
        }

        if (job.getEligibleDepartments() != null && !job.getEligibleDepartments().isEmpty()) {
            String studentDept = student.getDepartment();
            if (studentDept == null || studentDept.trim().isEmpty()) {
                throw new RuntimeException("You are not eligible: Please update your department in profile.");
            }
            
            boolean deptMatch = false;
            String[] depts = job.getEligibleDepartments().split(",");
            for (String d : depts) {
                if (d.trim().equalsIgnoreCase(studentDept.trim())) {
                    deptMatch = true;
                    break;
                }
            }
            if (!deptMatch) {
                throw new RuntimeException("You are not eligible: Your department does not match the eligibility criteria.");
            }
        }

        Application application = Application.builder()
                .student(student)
                .job(job)
                .resumeUrl(resumeUrl != null ? resumeUrl : student.getResumeUrl())
                .status(ApplicationStatus.APPLIED)
                .build();

        Application saved = applicationRepository.save(application);

        // Notify Company HR
        notificationService.sendNotification(
                job.getCompany().getUser(),
                "New application received for " + job.getTitle() + " from " + student.getUser().getName()
        );

        return saved;
    }

    public List<Application> getApplicationsByStudent(StudentProfile student) {
        return applicationRepository.findByStudent(student);
    }

    public List<Application> getApplicationsByJob(JobPosting job) {
        return applicationRepository.findByJob(job);
    }

    public Application updateStatus(Long id, ApplicationStatus status) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        
        // If status changes to SELECTED, update student profile
        if (status == ApplicationStatus.SELECTED && application.getStatus() != ApplicationStatus.SELECTED) {
            StudentProfile student = application.getStudent();
            student.setPlaced(true);
            student.setOffers(student.getOffers() + 1);
            studentProfileRepository.save(student);
        }

        application.setStatus(status);
        Application saved = applicationRepository.save(application);

        // Notify Student
        notificationService.sendNotification(
                application.getStudent().getUser(),
                "Your application for " + application.getJob().getTitle() + " status updated to: " + status
        );

        return saved;
    }

    public Application getById(Long id) {
        return applicationRepository.findById(id).orElseThrow();
    }
}
