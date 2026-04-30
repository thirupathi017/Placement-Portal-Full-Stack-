package com.placementportal.service;

import com.placementportal.dto.AuthResponse;
import com.placementportal.dto.CompanyProfileDTO;
import com.placementportal.dto.LoginRequest;
import com.placementportal.dto.RegisterRequest;
import com.placementportal.dto.StudentProfileDTO;
import com.placementportal.model.CompanyProfile;
import com.placementportal.model.StudentProfile;
import com.placementportal.model.User;
import com.placementportal.model.enums.Role;
import com.placementportal.repository.CompanyProfileRepository;
import com.placementportal.repository.StudentProfileRepository;
import com.placementportal.repository.UserRepository;
import com.placementportal.service.NotificationService;
import com.placementportal.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final CompanyProfileRepository companyProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    private final NotificationService notificationService;

    @Transactional
    public User register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .phone(request.getPhone())
                .build();

        user = userRepository.save(user);

        if (user.getRole() == Role.STUDENT) {
            StudentProfile studentProfile = StudentProfile.builder()
                    .user(user)
                    .placed(false)
                    .build();
            studentProfileRepository.save(studentProfile);
        } else if (user.getRole() == Role.COMPANY) {
            CompanyProfile companyProfile = CompanyProfile.builder()
                    .user(user)
                    .companyName(user.getName())
                    .website(request.getWebsite())
                    .hrName(request.getHrName())
                    .verified(false)
                    .build();
            companyProfileRepository.save(companyProfile);
            
            // Notify all admins about the new company registration
            final String companyName = user.getName();
            userRepository.findByRole(Role.ADMIN).forEach(admin -> {
                notificationService.sendNotification(admin, "New company registered: " + companyName + ". Please verify their account.");
            });
        }

        return user;
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        
        Object profile = null;
        if (user.getRole() == Role.STUDENT) {
            StudentProfile student = studentProfileRepository.findByUserId(user.getId()).orElse(null);
            if (student != null) profile = toStudentDTO(student);
        } else if (user.getRole() == Role.COMPANY) {
            CompanyProfile company = companyProfileRepository.findByUserId(user.getId()).orElse(null);
            if (company != null) profile = toCompanyDTO(company);
        }

        return AuthResponse.builder()
                .token(jwt)
                .userId(user.getId())
                .name(user.getName())
                .role(user.getRole())
                .profile(profile)
                .build();
    }

    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    private StudentProfileDTO toStudentDTO(StudentProfile s) {
        User u = s.getUser();
        return StudentProfileDTO.builder()
                .id(s.getId())
                .rollNumber(s.getRollNumber())
                .department(s.getDepartment())
                .college(s.getCollege())
                .batchYear(s.getBatchYear())
                .cgpa(s.getCgpa())
                .skills(s.getSkills())
                .resumeUrl(s.getResumeUrl())
                .placed(s.getPlaced())
                .userId(u.getId())
                .name(u.getName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .build();
    }

    private CompanyProfileDTO toCompanyDTO(CompanyProfile c) {
        User u = c.getUser();
        return CompanyProfileDTO.builder()
                .id(c.getId())
                .companyName(c.getCompanyName())
                .industry(c.getIndustry())
                .website(c.getWebsite())
                .hrName(c.getHrName())
                .verified(c.getVerified())
                .userId(u.getId())
                .name(u.getName())
                .email(u.getEmail())
                .build();
    }
}
