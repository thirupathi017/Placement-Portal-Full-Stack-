package com.placementportal.repository;

import com.placementportal.model.CompanyProfile;
import com.placementportal.model.JobPosting;
import com.placementportal.model.enums.JobType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {
    List<JobPosting> findByCompany(CompanyProfile company);
    List<JobPosting> findByStatus(String status);

    @Query("SELECT j FROM JobPosting j WHERE j.status = 'OPEN' " +
           "AND (:dept IS NULL OR :dept = '' OR j.eligibleDepartments LIKE concat('%', :dept, '%')) " +
           "AND (:jobType IS NULL OR j.jobType = :jobType) " +
           "AND (:minPackage IS NULL OR j.packageLpa >= :minPackage) " +
           "AND (:companyName IS NULL OR :companyName = '' OR LOWER(j.company.companyName) LIKE LOWER(concat('%', :companyName, '%')) OR LOWER(j.title) LIKE LOWER(concat('%', :companyName, '%')))")
    List<JobPosting> findFilteredJobs(
            @Param("dept") String dept,
            @Param("jobType") JobType jobType,
            @Param("minPackage") BigDecimal minPackage,
            @Param("companyName") String companyName
    );
}
