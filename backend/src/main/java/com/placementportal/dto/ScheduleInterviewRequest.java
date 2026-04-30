package com.placementportal.dto;

import com.placementportal.model.enums.InterviewMode;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ScheduleInterviewRequest {
    private Long applicationId;
    private LocalDateTime scheduledAt;
    private InterviewMode mode;
    private String venueOrLink;
    private Integer round;
}
