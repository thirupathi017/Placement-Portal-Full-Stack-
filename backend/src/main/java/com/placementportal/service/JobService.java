package com.placementportal.service;

import com.placementportal.model.CompanyProfile;
import com.placementportal.model.JobPosting;
import com.placementportal.model.enums.JobType;
import com.placementportal.repository.JobPostingRepository;
import com.placementportal.repository.UserRepository;
import com.placementportal.service.NotificationService;
import com.placementportal.model.enums.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobPostingRepository jobPostingRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public List<JobPosting> getAllOpenJobs(String dept, JobType jobType, BigDecimal minPackage, String companyName) {
        return jobPostingRepository.findFilteredJobs(dept, jobType, minPackage, companyName);
    }

    public JobPosting getJobById(Long id) {
        return jobPostingRepository.findById(id).orElseThrow(() -> new RuntimeException("Job not found"));
    }

    public JobPosting createJob(JobPosting job, CompanyProfile company) {
        job.setCompany(company);
        job.setStatus("PENDING");  // All job postings require Admin approval before going live
        if (job.getRounds() != null) {
            job.getRounds().forEach(r -> r.setJob(job));
        }
        JobPosting savedJob = jobPostingRepository.save(job);

        // Notify the company that their posting is under review
        notificationService.sendNotification(company.getUser(),
            "Your job posting '" + job.getTitle() + "' has been submitted and is pending Admin approval.");

        // Notify all admins that a new job needs review
        userRepository.findByRole(Role.ADMIN).forEach(admin ->
            notificationService.sendNotification(admin,
                "New job posting to review: '" + job.getTitle() + "' from " + company.getCompanyName())
        );

        // Notify all students about 'Coming Soon' job
        userRepository.findByRole(Role.STUDENT).forEach(student ->
            notificationService.sendNotification(student,
                "Coming Soon: A new job posting '" + job.getTitle() + "' from " + company.getCompanyName() + " is currently under verification.")
        );

        return savedJob;
    }

    public JobPosting updateJob(Long id, JobPosting updatedJob) {
        JobPosting job = getJobById(id);
        job.setTitle(updatedJob.getTitle());
        job.setDescription(updatedJob.getDescription());
        job.setEligibilityCgpa(updatedJob.getEligibilityCgpa());
        job.setEligibleDepartments(updatedJob.getEligibleDepartments());
        job.setPackageLpa(updatedJob.getPackageLpa());
        job.setJobType(updatedJob.getJobType());
        job.setLocation(updatedJob.getLocation());
        job.setLastDate(updatedJob.getLastDate());
        job.setStatus(updatedJob.getStatus() != null ? updatedJob.getStatus() : job.getStatus());
        
        if (updatedJob.getRounds() != null) {
            job.getRounds().clear();
            for (com.placementportal.model.JobRound round : updatedJob.getRounds()) {
                round.setJob(job);
                job.getRounds().add(round);
            }
        } else {
            job.getRounds().clear();
        }
        
        return jobPostingRepository.save(job);
    }

    public void deleteJob(Long id) {
        jobPostingRepository.deleteById(id);
    }

    public List<JobPosting> getJobsByCompany(CompanyProfile company) {
        return jobPostingRepository.findByCompany(company);
    }
}
