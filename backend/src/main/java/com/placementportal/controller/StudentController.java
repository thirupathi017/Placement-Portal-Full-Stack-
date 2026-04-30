package com.placementportal.controller;

import com.placementportal.dto.ApplicationDTO;
import com.placementportal.dto.InterviewDTO;
import com.placementportal.dto.JobEventDTO;
import com.placementportal.dto.JobPostingDTO;
import com.placementportal.dto.JobRoundDTO;
import com.placementportal.dto.StudentProfileDTO;
import com.placementportal.dto.StudentProfileUpdateRequest;
import com.placementportal.model.Application;
import com.placementportal.model.Interview;
import com.placementportal.model.JobPosting;
import com.placementportal.model.JobRound;
import com.placementportal.model.StudentProfile;
import com.placementportal.model.User;
import com.placementportal.model.enums.JobType;
import com.placementportal.repository.StudentProfileRepository;
import com.placementportal.service.ApplicationService;
import com.placementportal.service.AuthService;
import com.placementportal.service.FileUploadService;
import com.placementportal.service.InterviewService;
import com.placementportal.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class StudentController {

    private final JobService jobService;
    private final ApplicationService applicationService;
    private final AuthService authService;
    private final FileUploadService fileUploadService;
    private final StudentProfileRepository studentProfileRepository;
    private final InterviewService interviewService;

    @GetMapping("/jobs")
    public ResponseEntity<?> listJobs(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) JobType jobType,
            @RequestParam(required = false) BigDecimal minCGPA,
            @RequestParam(required = false) String company) {
        return ResponseEntity.ok(jobService.getAllOpenJobs(department, jobType, minCGPA, company).stream()
                .map(this::toJobDTO).toList());
    }

    @GetMapping("/jobs/{id}")
    public ResponseEntity<JobPostingDTO> getJob(@PathVariable Long id) {
        return ResponseEntity.ok(toJobDTO(jobService.getJobById(id)));
    }

    @PostMapping("/applications")
    @PreAuthorize("hasRole('STUDENT')")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> apply(@RequestBody Map<String, Long> payload) {
        User user = authService.getCurrentUser();
        StudentProfile student = studentProfileRepository.findByUserId(user.getId()).orElseThrow();
        
        if (!student.getVerified()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Your profile is not verified by the admin yet. You cannot apply for jobs until verified."));
        }
        
        JobPosting job = jobService.getJobById(payload.get("jobId"));
        return ResponseEntity.ok(toAppDTO(applicationService.apply(student, job, null)));
    }

    @GetMapping("/applications/my")
    @PreAuthorize("hasRole('STUDENT')")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<?> myApplications() {
        User user = authService.getCurrentUser();
        StudentProfile student = studentProfileRepository.findByUserId(user.getId()).orElseThrow();
        // Only show applications for OPEN jobs — hide if admin has unverified/rejected the job
        java.util.List<ApplicationDTO> dtos = applicationService.getApplicationsByStudent(student).stream()
                .filter(a -> "OPEN".equals(a.getJob().getStatus()))
                .map(this::toAppDTO).toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/interviews/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> myInterviews() {
        User user = authService.getCurrentUser();
        StudentProfile student = studentProfileRepository.findByUserId(user.getId()).orElseThrow();
        // Only show interviews for OPEN jobs — hide if admin has unverified/rejected the job
        java.util.List<InterviewDTO> dtos = interviewService.getInterviewsByStudent(student).stream()
                .filter(i -> "OPEN".equals(i.getApplication().getJob().getStatus()))
                .map(this::toInterviewDTO).toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/students/events")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> myEvents() {
        User user = authService.getCurrentUser();
        StudentProfile student = studentProfileRepository.findByUserId(user.getId()).orElseThrow();

        java.util.List<Application> applications = applicationService.getApplicationsByStudent(student);
        java.util.List<JobEventDTO> events = new java.util.ArrayList<>();

        for (Application app : applications) {
            JobPosting job = app.getJob();
            // Skip events for jobs that are no longer OPEN (unverified/rejected by admin)
            if (!"OPEN".equals(job.getStatus())) continue;
            if (job.getRounds() != null) {
                for (JobRound round : job.getRounds()) {
                    events.add(JobEventDTO.builder()
                            .id(round.getId())
                            .jobId(job.getId())
                            .jobTitle(job.getTitle())
                            .companyName(job.getCompany().getCompanyName())
                            .roundNumber(round.getRoundNumber())
                            .roundName(round.getRoundName())
                            .scheduledAt(round.getScheduledAt())
                            .build());
                }
            }
        }
        
        // Sort chronologically
        events.sort((a, b) -> {
            if (a.getScheduledAt() == null) return 1;
            if (b.getScheduledAt() == null) return -1;
            return a.getScheduledAt().compareTo(b.getScheduledAt());
        });
        
        return ResponseEntity.ok(events);
    }

    @PostMapping("/students/resume")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> uploadResume(@RequestParam("file") MultipartFile file) {
        try {
            String url = fileUploadService.storeFile(file);
            User user = authService.getCurrentUser();
            StudentProfile student = studentProfileRepository.findByUserId(user.getId()).orElseThrow();
            student.setResumeUrl(url);
            studentProfileRepository.save(student);
            return ResponseEntity.ok(Map.of("url", url));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/students/profile")
    @PreAuthorize("hasRole('STUDENT')")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<StudentProfileDTO> getProfile() {
        User user = authService.getCurrentUser();
        StudentProfile student = studentProfileRepository.findByUserId(user.getId()).orElseThrow();
        return ResponseEntity.ok(toDTO(student));
    }

    @PutMapping("/students/profile")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentProfileDTO> updateProfile(@RequestBody StudentProfileUpdateRequest req) {
        User user = authService.getCurrentUser();
        StudentProfile student = studentProfileRepository.findByUserId(user.getId()).orElseThrow();
        student.setSkills(req.getSkills());
        student.setCgpa(req.getCgpa());
        student.setDepartment(req.getDepartment());
        student.setCollege(req.getCollege());
        student.setBatchYear(req.getBatchYear());
        student.setRollNumber(req.getRollNumber());
        return ResponseEntity.ok(toDTO(studentProfileRepository.save(student)));
    }

    private StudentProfileDTO toDTO(StudentProfile s) {
        User u = s.getUser();
        return StudentProfileDTO.builder()
                .id(s.getId())
                .rollNumber(s.getRollNumber())
                .department(s.getDepartment())
                .college(s.getCollege())
                .batchYear(s.getBatchYear())
                .cgpa(s.getCgpa())
                .skills(s.getSkills())
                .resumeUrl(s.getResumeUrl())
                .placed(s.getPlaced())
                .offers(s.getOffers())
                .verified(s.getVerified())
                .userId(u.getId())
                .name(u.getName())
                .email(u.getEmail())
                .phone(u.getPhone())
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
                .rounds(j.getRounds() != null ? j.getRounds().stream().map(r -> JobRoundDTO.builder()
                        .id(r.getId())
                        .roundNumber(r.getRoundNumber())
                        .roundName(r.getRoundName())
                        .scheduledAt(r.getScheduledAt())
                        .build()).toList() : new java.util.ArrayList<>())
                .build();
    }

    private ApplicationDTO toAppDTO(Application a) {
        return ApplicationDTO.builder()
                .id(a.getId())
                .studentId(a.getStudent().getId())
                .studentName(a.getStudent().getUser().getName())
                .rollNumber(a.getStudent().getRollNumber())
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
}
