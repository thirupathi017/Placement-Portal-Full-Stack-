package com.placementportal.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CompanyProfileDTO {
    private Long id;
    private String companyName;
    private String industry;
    private String website;
    private String hrName;
    private Boolean verified;
    private Long userId;
    private String name;
    private String email;
}
