package com.placementportal.dto;

import com.placementportal.model.enums.InterviewMode;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Request body for the comprehensive round-result endpoint.
 *
 * action = "FAIL"       → mark round failed, reject application, notify student + admins (with reason)
 * action = "NEXT_ROUND" → mark round passed, schedule next round, notify student
 * action = "SELECT"     → mark round passed, select applicant, notify student + admins
 */
@Data
public class RoundResultRequest {

    /** "FAIL" | "NEXT_ROUND" | "SELECT" */
    private String action;

    /** Required when action = "FAIL" — company must explain why the student was rejected */
    private String rejectionReason;

    // ── required only when action = "NEXT_ROUND" ──────────────────────────────
    private LocalDateTime scheduledAt;
    private InterviewMode mode;
    private String venueOrLink;
}

