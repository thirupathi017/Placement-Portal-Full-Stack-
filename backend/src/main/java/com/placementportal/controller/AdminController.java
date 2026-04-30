package com.placementportal.controller;

import com.placementportal.dto.ApplicationDTO;
import com.placementportal.dto.CompanyProfileDTO;
import com.placementportal.dto.JobPostingDTO;
import com.placementportal.dto.StudentProfileDTO;
import com.placementportal.model.Application;
import com.placementportal.model.CompanyProfile;
import com.placementportal.model.JobPosting;
import com.placementportal.model.StudentProfile;
import com.placementportal.model.User;
import com.placementportal.model.enums.ApplicationStatus;
import com.placementportal.model.enums.Role;
import com.placementportal.repository.ApplicationRepository;
import com.placementportal.repository.CompanyProfileRepository;
import com.placementportal.repository.JobPostingRepository;
import com.placementportal.repository.StudentProfileRepository;
import com.placementportal.repository.UserRepository;
import com.placementportal.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final StudentProfileRepository studentProfileRepository;
    private final CompanyProfileRepository companyProfileRepository;
    private final JobPostingRepository jobPostingRepository;
    private final ApplicationRepository applicationRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @GetMapping("/students")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<?> getAllStudents() {
        return ResponseEntity.ok(studentProfileRepository.findAll().stream()
                .map(this::toStudentDTO).toList());
    }

    @GetMapping("/students/{id}")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<?> getStudentById(@PathVariable Long id) {
        try {
            System.out.println("Fetching student profile with ID: " + id);
            return studentProfileRepository.findById(id)
                    .map(s -> {
                        System.out.println("Found profile: " + s.getId());
                        StudentProfileDTO dto = toStudentDTO(s);
                        System.out.println("Converted to DTO: " + dto.getName());
                        return ResponseEntity.ok(dto);
                    })
                    .orElseGet(() -> {
                        System.out.println("Profile not found: " + id);
                        return ResponseEntity.notFound().build();
                    });
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/companies")
    public ResponseEntity<?> getAllCompanies() {
        return ResponseEntity.ok(companyProfileRepository.findAll().stream()
                .map(this::toCompanyDTO).toList());
    }

    @GetMapping("/jobs/pending")
    public ResponseEntity<?> getPendingJobs() {
        return ResponseEntity.ok(jobPostingRepository.findByStatus("PENDING").stream()
                .map(this::toJobDTO).toList());
    }

    @GetMapping("/jobs")
    public ResponseEntity<?> getAllJobs() {
        return ResponseEntity.ok(jobPostingRepository.findAll().stream()
                .map(this::toJobDTO).toList());
    }

    @PutMapping("/jobs/{id}/verify")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> verifyJob(@PathVariable Long id) {
        JobPosting job = jobPostingRepository.findById(id).orElseThrow();
        job.setStatus("OPEN");
        jobPostingRepository.save(job);

        // Notify the company their job is now live
        notificationService.sendNotification(job.getCompany().getUser(),
            "Your job posting '" + job.getTitle() + "' has been verified and is now live!");

        // Notify all students about the new opportunity
        userRepository.findByRole(Role.STUDENT).forEach(student ->
            notificationService.sendNotification(student,
                "Official Update: Job posting '" + job.getTitle() + "' at " + job.getCompany().getCompanyName() + " has been VERIFIED by the Placement Admin and is now live!")
        );

        return ResponseEntity.ok(toJobDTO(job));
    }

    @PutMapping("/companies/{id}/verify")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> verifyCompany(@PathVariable Long id) {
        CompanyProfile company = companyProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found with id: " + id));
        company.setVerified(true);
        companyProfileRepository.save(company);
        
        notificationService.sendNotification(company.getUser(), "Your company account has been verified by the Admin!");
        
        return ResponseEntity.ok(toCompanyDTO(company));
    }

    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable Long id) {
        JobPosting job = jobPostingRepository.findById(id).orElseThrow();
        jobPostingRepository.delete(job);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/jobs/{id}/reject")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> rejectJob(@PathVariable Long id) {
        JobPosting job = jobPostingRepository.findById(id).orElseThrow();
        job.setStatus("REJECTED");
        jobPostingRepository.save(job);

        notificationService.sendNotification(job.getCompany().getUser(),
            "Your job posting '" + job.getTitle() + "' has been rejected by the Admin. It is no longer visible to students.");

        // Notify students that the previously announced job is no longer available
        userRepository.findByRole(Role.STUDENT).forEach(student ->
            notificationService.sendNotification(student,
                "Placement Update: The status of job posting '" + job.getTitle() + "' from " + job.getCompany().getCompanyName() + " has been changed to REJECTED by the Placement Admin.")
        );

        return ResponseEntity.ok(toJobDTO(job));
    }

    /**
     * Unverify (withdraw) a live job — moves it back to PENDING,
     * immediately hiding it from students until admin re-approves.
     */
    @PutMapping("/jobs/{id}/unverify")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> unverifyJob(@PathVariable Long id) {
        JobPosting job = jobPostingRepository.findById(id).orElseThrow();
        job.setStatus("PENDING");
        jobPostingRepository.save(job);

        notificationService.sendNotification(job.getCompany().getUser(),
            "Your job posting '" + job.getTitle() + "' has been temporarily withdrawn by the Admin and is no longer visible to students.");

        // Notify students about the withdrawal
        userRepository.findByRole(Role.STUDENT).forEach(student ->
            notificationService.sendNotification(student,
                "Placement Update: The status of job posting '" + job.getTitle() + "' from " + job.getCompany().getCompanyName() + " has been changed to PENDING (Unverified) by the Placement Admin for further review.")
        );

        return ResponseEntity.ok(toJobDTO(job));
    }

    @PutMapping("/students/{id}/verify")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> verifyStudent(@PathVariable Long id) {
        try {
            System.out.println("Verifying student with ID: " + id);
            StudentProfile student = studentProfileRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Student profile not found with id: " + id));
            
            student.setVerified(true);
            StudentProfile saved = studentProfileRepository.save(student);
            System.out.println("Student verified and saved: " + saved.getId());
            
            if (student.getUser() != null) {
                try {
                    notificationService.sendNotification(student.getUser(), "Your student profile has been verified by the Admin!");
                } catch (Exception ne) {
                    System.err.println("Warning: Failed to send verification notification: " + ne.getMessage());
                }
            } else {
                System.out.println("Warning: Student user is null for profile ID: " + id);
            }
            
            return ResponseEntity.ok(toStudentDTO(saved));
        } catch (Exception e) {
            System.err.println("Error verifying student: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Error verifying student: " + e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStudents", studentProfileRepository.count());
        stats.put("placedCount", studentProfileRepository.findAll().stream().filter(s -> s.getPlaced()).count());
        stats.put("activeJobs", jobPostingRepository.findByStatus("OPEN").size());
        stats.put("totalCompanies", companyProfileRepository.count());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/stats/departments")
    public ResponseEntity<?> getDepartmentStats() {
        java.util.List<com.placementportal.model.StudentProfile> students = studentProfileRepository.findAll();
        
        // Group by department and calculate placed/unplaced
        java.util.Map<String, java.util.Map<String, Long>> grouped = students.stream()
            .filter(s -> s.getDepartment() != null && !s.getDepartment().isEmpty())
            .collect(java.util.stream.Collectors.groupingBy(
                com.placementportal.model.StudentProfile::getDepartment,
                java.util.stream.Collectors.collectingAndThen(
                    java.util.stream.Collectors.toList(),
                    list -> {
                        long placed = list.stream().filter(s -> s.getPlaced()).count();
                        java.util.Map<String, Long> m = new java.util.HashMap<>();
                        m.put("placed", placed);
                        m.put("unplaced", (long)list.size() - placed);
                        return m;
                    }
                )
            ));

        java.util.List<java.util.Map<String, Object>> chartData = grouped.entrySet().stream()
            .map(e -> {
                java.util.Map<String, Object> item = new java.util.HashMap<>();
                item.put("name", e.getKey());
                item.put("placed", e.getValue().get("placed"));
                item.put("unplaced", e.getValue().get("unplaced"));
                return item;
            })
            .toList();

        return ResponseEntity.ok(chartData);
    }

    @GetMapping("/placements")
    public ResponseEntity<?> getPlacements() {
        return ResponseEntity.ok(applicationRepository.findByStatus(ApplicationStatus.SELECTED).stream()
                .map(this::toApplicationDTO).toList());
    }

    private StudentProfileDTO toStudentDTO(StudentProfile s) {
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
                .verified(s.getVerified())
                .userId(u.getId())
                .name(u.getName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .build();
    }

    private CompanyProfileDTO toCompanyDTO(CompanyProfile c) {
        User u = c.getUser();
        return CompanyProfileDTO.builder()
                .id(c.getId())
                .companyName(c.getCompanyName())
                .industry(c.getIndustry())
                .website(c.getWebsite())
                .hrName(c.getHrName())
                .verified(c.getVerified())
                .userId(u.getId())
                .name(u.getName())
                .email(u.getEmail())
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
                .status(j.getStatus()) // Assuming JobPostingDTO.status is also changed to String
                .createdAt(j.getCreatedAt())
                .build();
    }

    private ApplicationDTO toApplicationDTO(Application a) {
        return ApplicationDTO.builder()
                .id(a.getId())
                .studentId(a.getStudent().getId())
                .studentName(a.getStudent().getUser().getName())
                .rollNumber(a.getStudent().getRollNumber())
                .college(a.getStudent().getCollege())
                .department(a.getStudent().getDepartment())
                .cgpa(a.getStudent().getCgpa())
                .jobId(a.getJob().getId())
                .jobTitle(a.getJob().getTitle())
                .companyName(a.getJob().getCompany().getCompanyName())
                .packageLpa(a.getJob().getPackageLpa())
                .status(a.getStatus())
                .appliedAt(a.getAppliedAt())
                .build();
    }
}
