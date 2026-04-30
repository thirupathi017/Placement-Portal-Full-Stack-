package com.placementportal.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class StudentProfileUpdateRequest {
    private String rollNumber;
    private String department;
    private String college;
    private Integer batchYear;
    private BigDecimal cgpa;
    private String skills;
}
