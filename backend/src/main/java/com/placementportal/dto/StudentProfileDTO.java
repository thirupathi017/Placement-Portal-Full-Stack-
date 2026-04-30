package com.placementportal.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class StudentProfileDTO {
    private Long id;
    private String rollNumber;
    private String department;
    private String college;
    private Integer batchYear;
    private BigDecimal cgpa;
    private String skills;
    private String resumeUrl;
    private Boolean placed;
    private Integer offers;
    private Boolean verified;

    // user info
    private Long userId;
    private String name;
    private String email;
    private String phone;
}
