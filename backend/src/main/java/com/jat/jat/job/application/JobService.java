package com.jat.jat.job.application;

import com.jat.jat.company.domain.CompanyRepository;
import com.jat.jat.job.domain.Job;
import com.jat.jat.job.domain.JobRepository;
import com.jat.jat.job.domain.JobStatus;
import com.jat.jat.shared.exception.ResourceNotFoundException;
import com.jat.jat.thread.domain.JobThread;
import com.jat.jat.thread.domain.JobThreadRepository;
import com.jat.jat.thread.domain.ThreadStatus;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class JobService {

    private final JobRepository jobRepository;
    private final JobThreadRepository jobThreadRepository;
    private final CompanyRepository companyRepository;

    @Transactional(readOnly = true)
    public List<Job> findAll() {
        return jobRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Job> findByCompanyId(UUID companyId) {
        return jobRepository.findByCompanyId(companyId);
    }

    @Transactional(readOnly = true)
    public List<Job> findByStatus(JobStatus status) {
        return jobRepository.findByStatus(status);
    }

    @Transactional(readOnly = true)
    public List<Job> findByCompanyIdAndStatus(UUID companyId, JobStatus status) {
        return jobRepository.findByCompanyIdAndStatus(companyId, status);
    }

    @Transactional(readOnly = true)
    public Job findById(UUID id) {
        return jobRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + id));
    }

    public Job create(Job job) {
        if (!companyRepository.existsById(job.getCompanyId())) {
            throw new ResourceNotFoundException("Company not found: " + job.getCompanyId());
        }
        job.setId(null);
        Job saved = jobRepository.save(job);
        jobThreadRepository.save(
                JobThread.builder().jobId(saved.getId()).status(ThreadStatus.active).build());
        return saved;
    }

    public Job update(UUID id, Job updates) {
        Job existing = findById(id);
        if (updates.getCompanyId() != null) {
            if (!companyRepository.existsById(updates.getCompanyId())) {
                throw new ResourceNotFoundException("Company not found: " + updates.getCompanyId());
            }
            existing.setCompanyId(updates.getCompanyId());
        }
        existing.setTitle(updates.getTitle());
        existing.setPortal(updates.getPortal());
        existing.setPortalApplicationId(updates.getPortalApplicationId());
        existing.setAppliedAt(updates.getAppliedAt());
        if (updates.getStatus() != null) {
            existing.setStatus(updates.getStatus());
        }
        existing.setJobUrl(updates.getJobUrl());
        existing.setNotes(updates.getNotes());
        return jobRepository.save(existing);
    }

    public void delete(UUID id) {
        Job job = findById(id);
        jobThreadRepository.findByJobId(job.getId()).ifPresent(jobThreadRepository::delete);
        jobRepository.delete(job);
    }
}
