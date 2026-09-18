package com.jat.jat.job.domain;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobRepository extends JpaRepository<Job, UUID> {
    List<Job> findByCompanyId(UUID companyId);

    List<Job> findByStatus(JobStatus status);

    List<Job> findByCompanyIdAndStatus(UUID companyId, JobStatus status);
}
