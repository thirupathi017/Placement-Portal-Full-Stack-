package com.placementportal.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class JobEventDTO {
    private Long id;
    private Long jobId;
    private String jobTitle;
    private String companyName;
    private Integer roundNumber;
    private String roundName;
    private LocalDateTime scheduledAt;
}
