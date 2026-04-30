package com.placementportal.service;

import com.placementportal.dto.RoundResultRequest;
import com.placementportal.model.Application;
import com.placementportal.model.Interview;
import com.placementportal.model.User;
import com.placementportal.model.enums.ApplicationStatus;
import com.placementportal.model.enums.InterviewResult;
import com.placementportal.model.enums.Role;
import com.placementportal.repository.InterviewRepository;
import com.placementportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final NotificationService notificationService;
    private final ApplicationService applicationService;
    private final UserRepository userRepository;

    public Interview scheduleInterview(Interview interview) {
        interview.setResult(InterviewResult.PENDING);
        Interview saved = interviewRepository.save(interview);

        // Notify Student
        notificationService.sendNotification(
                saved.getApplication().getStudent().getUser(),
                "📅 Interview scheduled for " + saved.getApplication().getJob().getTitle()
                + " — Round " + saved.getRound()
                + " on " + saved.getScheduledAt().toLocalDate()
                + ". Mode: " + saved.getMode()
        );

        return saved;
    }

    public Interview updateInterviewResult(Long id, InterviewResult result) {
        Interview interview = interviewRepository.findById(id).orElseThrow();
        interview.setResult(result);
        Interview saved = interviewRepository.save(interview);

        // Notify Student
        notificationService.sendNotification(
                saved.getApplication().getStudent().getUser(),
                "Interview result for " + saved.getApplication().getJob().getTitle() + " updated: " + result
        );

        return saved;
    }

    /**
     * Central round-lifecycle method.
     *
     *  action = FAIL       → mark FAILED, reject application, notify student + all admins
     *  action = NEXT_ROUND → mark PASSED, schedule next round, notify student
     *  action = SELECT     → mark PASSED, select application, notify student + all admins
     */
    @Transactional
    public Interview processRoundResult(Long interviewId, RoundResultRequest req) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        Application app = interview.getApplication();
        String jobTitle = app.getJob().getTitle();
        String companyName = app.getJob().getCompany().getCompanyName();
        String studentName = app.getStudent().getUser().getName();
        int currentRound = interview.getRound() != null ? interview.getRound() : 1;

        switch (req.getAction().toUpperCase()) {

            case "FAIL" -> {
                interview.setResult(InterviewResult.FAILED);
                interviewRepository.save(interview);

                // Build rejection reason clause
                String reasonClause = (req.getRejectionReason() != null && !req.getRejectionReason().isBlank())
                        ? " Reason: " + req.getRejectionReason().trim()
                        : "";

                // Update application status → REJECTED (also notifies student with generic status message)
                applicationService.updateStatus(app.getId(), ApplicationStatus.REJECTED);

                // Detailed rejection notification to student (with reason)
                notificationService.sendNotification(
                        app.getStudent().getUser(),
                        "❌ Result for Round " + currentRound + " — " + jobTitle + " at " + companyName + ": "
                        + "Unfortunately, you did not clear this round." + reasonClause
                        + " We appreciate your participation and wish you the best!"
                );

                // Notify all admins (include reason)
                notifyAdmins("🔴 " + studentName + " was REJECTED after Round " + currentRound
                        + " for " + jobTitle + " at " + companyName + "." + reasonClause);
            }

            case "NEXT_ROUND" -> {
                interview.setResult(InterviewResult.PASSED);
                interviewRepository.save(interview);

                // Schedule next round interview
                Interview nextInterview = Interview.builder()
                        .application(app)
                        .scheduledAt(req.getScheduledAt())
                        .mode(req.getMode())
                        .venueOrLink(req.getVenueOrLink())
                        .round(currentRound + 1)
                        .result(InterviewResult.PENDING)
                        .build();
                interviewRepository.save(nextInterview);

                // Update application status → INTERVIEW_SCHEDULED
                applicationService.updateStatus(app.getId(), ApplicationStatus.INTERVIEW_SCHEDULED);

                // Notify student — round result + next round schedule
                notificationService.sendNotification(
                        app.getStudent().getUser(),
                        "✅ Round " + currentRound + " Result — " + jobTitle + " at " + companyName + ": "
                        + "Congratulations! You have passed Round " + currentRound + "! 🎉 "
                        + "Your Round " + (currentRound + 1) + " interview is scheduled on "
                        + req.getScheduledAt().toLocalDate() + ". Mode: " + req.getMode()
                        + (req.getVenueOrLink() != null ? " | " + req.getVenueOrLink() : "")
                );
            }

            case "SELECT" -> {
                interview.setResult(InterviewResult.PASSED);
                interviewRepository.save(interview);

                // Update application status → SELECTED (also marks student as placed)
                applicationService.updateStatus(app.getId(), ApplicationStatus.SELECTED);

                // Final selection notification to student
                notificationService.sendNotification(
                        app.getStudent().getUser(),
                        "🏆 Final Result — " + jobTitle + " at " + companyName + ": "
                        + "Congratulations " + studentName + "! You have successfully cleared all rounds "
                        + "and have been SELECTED! Welcome to the team! 🎊"
                );

                // Notify all admins
                notifyAdmins("🟢 " + studentName + " has been SELECTED for " + jobTitle
                        + " at " + companyName + " after Round " + currentRound + ".");
            }

            default -> throw new RuntimeException("Unknown action: " + req.getAction());
        }

        return interviewRepository.findById(interviewId).orElseThrow();
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private void notifyAdmins(String message) {
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (User admin : admins) {
            notificationService.sendNotification(admin, message);
        }
    }

    public List<Interview> getInterviewsByApplication(Application application) {
        return interviewRepository.findByApplication(application);
    }

    public List<Interview> getInterviewsByStudent(com.placementportal.model.StudentProfile student) {
        return interviewRepository.findByApplication_Student(student);
    }

    public List<Interview> getInterviewsByCompany(com.placementportal.model.CompanyProfile company) {
        return interviewRepository.findByApplication_Job_Company(company);
    }
}
