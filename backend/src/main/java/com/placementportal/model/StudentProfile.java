package com.placementportal.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "student_profiles")
public class StudentProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "roll_number", unique = true)
    private String rollNumber;

    @Column(nullable = true)
    private String department;

    @Column(nullable = true)
    private String college;

    @Builder.Default
    @Column(name = "batch_year", nullable = true)
    private Integer batchYear = 0;

    @Column(nullable = true)
    private BigDecimal cgpa;

    @Column(columnDefinition = "TEXT", nullable = true)
    private String skills;

    @Column(name = "resume_url", nullable = true)
    private String resumeUrl;

    @Builder.Default
    @Column(nullable = false)
    private Boolean placed = false;

    @Builder.Default
    @Column(nullable = false)
    private Integer offers = 0;

    @Builder.Default
    @Column(nullable = false)
    private Boolean verified = false;
}
