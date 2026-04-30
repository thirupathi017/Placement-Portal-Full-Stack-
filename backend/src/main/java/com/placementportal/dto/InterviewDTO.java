package com.placementportal.dto;

import com.placementportal.model.enums.InterviewMode;
import com.placementportal.model.enums.InterviewResult;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class InterviewDTO {
    private Long id;
    private Long applicationId;
    private String studentName;
    private String rollNumber;
    private String jobTitle;
    private String companyName;
    private LocalDateTime scheduledAt;
    private InterviewMode mode;
    private String venueOrLink;
    private Integer round;
    private InterviewResult result;
}
