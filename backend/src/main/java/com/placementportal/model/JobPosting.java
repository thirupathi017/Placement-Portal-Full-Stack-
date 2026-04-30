package com.placementportal.model;

import com.placementportal.model.enums.JobType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "job_postings", indexes = {
    @Index(name = "idx_job_status_type", columnList = "status, job_type")
})
public class JobPosting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private CompanyProfile company;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "eligibility_cgpa")
    private BigDecimal eligibilityCgpa;

    @Column(name = "eligible_departments")
    private String eligibleDepartments;

    @Column(name = "package_lpa")
    private BigDecimal packageLpa;

    @Enumerated(EnumType.STRING)
    @Column(name = "job_type", nullable = false)
    private JobType jobType;

    private String location;

    @Column(name = "last_date")
    private LocalDate lastDate;

    @Column(name = "status")
    @Builder.Default
    private String status = "PENDING";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @org.hibernate.annotations.Formula("(SELECT COUNT(a.id) FROM applications a WHERE a.job_id = id)")
    private Integer applicantsCount;

    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonManagedReference
    @Builder.Default
    private java.util.List<JobRound> rounds = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<Application> applications;
}
