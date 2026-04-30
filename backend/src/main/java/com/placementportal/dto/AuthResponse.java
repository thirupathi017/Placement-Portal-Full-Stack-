package com.placementportal.dto;

import com.placementportal.model.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private Long userId;
    private String name;
    private Role role;
    private Object profile; // Can be StudentProfileDTO or CompanyProfileDTO
}
