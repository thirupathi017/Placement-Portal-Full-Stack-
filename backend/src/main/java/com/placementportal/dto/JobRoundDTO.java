package com.placementportal.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class JobRoundDTO {
    private Long id;
    private Integer roundNumber;
    private String roundName;
    private LocalDateTime scheduledAt;
}
