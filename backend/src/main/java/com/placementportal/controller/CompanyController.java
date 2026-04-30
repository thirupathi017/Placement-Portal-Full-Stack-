package com.placementportal.controller;

import com.placementportal.dto.ApplicationDTO;
import com.placementportal.dto.InterviewDTO;
import com.placementportal.dto.JobPostingDTO;
import com.placementportal.dto.JobRoundDTO;
import com.placementportal.dto.RoundResultRequest;
import com.placementportal.dto.ScheduleInterviewRequest;
import com.placementportal.model.*;
import com.placementportal.model.enums.ApplicationStatus;
import com.placementportal.repository.CompanyProfileRepository;
import com.placementportal.service.ApplicationService;
import com.placementportal.service.AuthService;
import com.placementportal.service.InterviewService;
import com.placementportal.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CompanyController {

    private final JobService jobService;
    private final ApplicationService applicationService;
    private final AuthService authService;
    private final CompanyProfileRepository companyProfileRepository;
    private final InterviewService interviewService;

    @PostMapping("/jobs")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> createJob(@RequestBody JobPosting job) {
        User user = authService.getCurrentUser();
        CompanyProfile company = companyProfileRepository.findByUserId(user.getId()).orElseThrow();
        if (!company.getVerified()) {
            throw new RuntimeException("Company not verified by admin");
        }
        JobPosting created = jobService.createJob(job, company);
        return ResponseEntity.ok(toJobDTO(created));
    }

    @PutMapping("/jobs/{id}")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> updateJob(@PathVariable Long id, @RequestBody JobPosting job) {
        JobPosting updated = jobService.updateJob(id, job);
        return ResponseEntity.ok(toJobDTO(updated));
    }

    @DeleteMapping("/jobs/{id}")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/jobs/my")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> myJobs() {
        User user = authService.getCurrentUser();
        CompanyProfile company = companyProfileRepository.findByUserId(user.getId()).orElseThrow();
        java.util.List<JobPostingDTO> dtos = jobService.getJobsByCompany(company).stream()
                .map(this::toJobDTO).toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/jobs/{id}/applicants")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> getApplicants(@PathVariable Long id) {
        JobPosting job = jobService.getJobById(id);
        java.util.List<ApplicationDTO> dtos = applicationService.getApplicationsByJob(job).stream()
                .map(this::toApplicationDTO).toList();
        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/applications/{id}/status")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> updateApplicationStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        ApplicationStatus status = ApplicationStatus.valueOf(payload.get("status"));
        Application updated = applicationService.updateStatus(id, status);
        return ResponseEntity.ok(toApplicationDTO(updated));
    }

    @GetMapping("/company/interviews")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> myInterviews() {
        User user = authService.getCurrentUser();
        CompanyProfile company = companyProfileRepository.findByUserId(user.getId()).orElseThrow();
        java.util.List<InterviewDTO> dtos = interviewService.getInterviewsByCompany(company).stream()
                .map(this::toInterviewDTO).toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/company/stats")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> getCompanyStats() {
        User user = authService.getCurrentUser();
        CompanyProfile company = companyProfileRepository.findByUserId(user.getId()).orElseThrow();
        
        java.util.List<JobPosting> jobs = jobService.getJobsByCompany(company);
        
        long activeJobs = jobs.stream().filter(j -> "OPEN".equals(j.getStatus())).count();
        long totalApplicants = 0;
        long shortlisted = 0;
        
        for (JobPosting job : jobs) {
            totalApplicants += (job.getApplicantsCount() != null ? job.getApplicantsCount() : 0);
            java.util.List<Application> apps = applicationService.getApplicationsByJob(job);
            shortlisted += apps.stream().filter(a -> 
                a.getStatus() == ApplicationStatus.SHORTLISTED || 
                a.getStatus() == ApplicationStatus.INTERVIEW_SCHEDULED || 
                a.getStatus() == ApplicationStatus.SELECTED
            ).count();
        }
        
        java.util.Map<String, Long> stats = new java.util.HashMap<>();
        stats.put("activeJobs", activeJobs);
        stats.put("totalApplicants", totalApplicants);
        stats.put("shortlisted", shortlisted);
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/company/analytics")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> getCompanyAnalytics() {
        User user = authService.getCurrentUser();
        CompanyProfile company = companyProfileRepository.findByUserId(user.getId()).orElseThrow();
        java.util.List<JobPosting> jobs = jobService.getJobsByCompany(company);

        // 1. Applications per job (for Bar Chart)
        java.util.List<java.util.Map<String, Object>> jobStats = jobs.stream().map(j -> {
            java.util.Map<String, Object> m = new java.util.HashMap<>();
            m.put("title", j.getTitle());
            m.put("count", j.getApplicantsCount() != null ? j.getApplicantsCount() : 0);
            return m;
        }).toList();

        // 2. Applications by status (for Pie Chart)
        java.util.Map<ApplicationStatus, Long> statusCounts = new java.util.HashMap<>();
        for (JobPosting job : jobs) {
            applicationService.getApplicationsByJob(job).forEach(a -> {
                statusCounts.put(a.getStatus(), statusCounts.getOrDefault(a.getStatus(), 0L) + 1);
            });
        }

        java.util.List<java.util.Map<String, Object>> statusStats = statusCounts.entrySet().stream().map(e -> {
            java.util.Map<String, Object> m = new java.util.HashMap<>();
            m.put("status", e.getKey().name());
            m.put("value", e.getValue());
            return m;
        }).toList();

        return ResponseEntity.ok(java.util.Map.of(
            "jobStats", jobStats,
            "statusStats", statusStats
        ));
    }

    @PostMapping("/interviews")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> scheduleInterview(@RequestBody ScheduleInterviewRequest req) {
        Application app = applicationService.getById(req.getApplicationId());
        
        // Update application status to INTERVIEW_SCHEDULED
        applicationService.updateStatus(app.getId(), ApplicationStatus.INTERVIEW_SCHEDULED);

        Interview interview = Interview.builder()
                .application(app)
                .scheduledAt(req.getScheduledAt())
                .mode(req.getMode())
                .venueOrLink(req.getVenueOrLink())
                .round(req.getRound())
                .build();

        return ResponseEntity.ok(toInterviewDTO(interviewService.scheduleInterview(interview)));
    }

    @PutMapping("/interviews/{id}")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> updateInterview(@PathVariable Long id, @RequestBody Interview interview) {
        return ResponseEntity.ok(toInterviewDTO(interviewService.updateInterviewResult(id, interview.getResult())));
    }

    /**
     * Comprehensive round-result endpoint.
     * Payload: { action: "FAIL" | "NEXT_ROUND" | "SELECT", scheduledAt?, mode?, venueOrLink? }
     * - FAIL       → rejects application, notifies student + admins
     * - NEXT_ROUND → schedules next round interview, notifies student
     * - SELECT     → selects applicant, notifies student + admins
     */
    @PutMapping("/interviews/{id}/round-result")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> processRoundResult(@PathVariable Long id, @RequestBody RoundResultRequest req) {
        return ResponseEntity.ok(toInterviewDTO(interviewService.processRoundResult(id, req)));
    }

    private InterviewDTO toInterviewDTO(Interview i) {
        return InterviewDTO.builder()
                .id(i.getId())
                .applicationId(i.getApplication().getId())
                .studentName(i.getApplication().getStudent().getUser().getName())
                .rollNumber(i.getApplication().getStudent().getRollNumber())
                .jobTitle(i.getApplication().getJob().getTitle())
                .companyName(i.getApplication().getJob().getCompany().getCompanyName())
                .scheduledAt(i.getScheduledAt())
                .mode(i.getMode())
                .venueOrLink(i.getVenueOrLink())
                .round(i.getRound())
                .result(i.getResult())
                .build();
    }

    private JobPostingDTO toJobDTO(JobPosting j) {
        return JobPostingDTO.builder()
                .id(j.getId())
                .companyId(j.getCompany().getId())
                .companyName(j.getCompany().getCompanyName())
                .title(j.getTitle())
                .description(j.getDescription())
                .eligibilityCgpa(j.getEligibilityCgpa())
                .eligibleDepartments(j.getEligibleDepartments())
                .packageLpa(j.getPackageLpa())
                .jobType(j.getJobType())
                .location(j.getLocation())
                .lastDate(j.getLastDate())
                .status(j.getStatus())
                .createdAt(j.getCreatedAt())
                .applicantsCount(j.getApplicantsCount())
                .rounds(j.getRounds() != null ? j.getRounds().stream().map(r -> JobRoundDTO.builder()
                        .id(r.getId())
                        .roundNumber(r.getRoundNumber())
                        .roundName(r.getRoundName())
                        .scheduledAt(r.getScheduledAt())
                        .build()).toList() : new java.util.ArrayList<>())
                .build();
    }

    private ApplicationDTO toApplicationDTO(Application a) {
        return ApplicationDTO.builder()
                .id(a.getId())
                .studentId(a.getStudent().getId())
                .studentName(a.getStudent().getUser().getName())
                .rollNumber(a.getStudent().getRollNumber())
                .department(a.getStudent().getDepartment())
                .cgpa(a.getStudent().getCgpa())
                .college(a.getStudent().getCollege())
                .jobId(a.getJob().getId())
                .jobTitle(a.getJob().getTitle())
                .companyName(a.getJob().getCompany().getCompanyName())
                .packageLpa(a.getJob().getPackageLpa())
                .status(a.getStatus())
                .appliedAt(a.getAppliedAt())
                .resumeUrl(a.getResumeUrl())
                .build();
    }
}
