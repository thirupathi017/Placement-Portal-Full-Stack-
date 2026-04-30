package com.placementportal.dto;

import com.placementportal.model.enums.JobType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class JobPostingDTO {
    private Long id;
    private Long companyId;
    private String companyName;
    private String title;
    private String description;
    private BigDecimal eligibilityCgpa;
    private String eligibleDepartments;
    private BigDecimal packageLpa;
    private JobType jobType;
    private String location;
    private LocalDate lastDate;
    private String status;
    private LocalDateTime createdAt;
    private Integer applicantsCount;
    private java.util.List<JobRoundDTO> rounds;
}
