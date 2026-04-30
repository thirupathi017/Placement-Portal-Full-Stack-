package com.placementportal.dto;

import com.placementportal.model.enums.ApplicationStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ApplicationDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private String rollNumber;
    private String department;
    private BigDecimal cgpa;
    private String college;
    private Long jobId;
    private String jobTitle;
    private String companyName;
    private BigDecimal packageLpa;
    private ApplicationStatus status;
    private LocalDateTime appliedAt;
    private String resumeUrl;
}
