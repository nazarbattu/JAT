package com.jat.jat.thread.application;

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
public class JobThreadService {

    private final JobThreadRepository jobThreadRepository;

    @Transactional(readOnly = true)
    public List<JobThread> findAll() {
        return jobThreadRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<JobThread> findByStatus(ThreadStatus status) {
        return jobThreadRepository.findByStatus(status);
    }

    @Transactional(readOnly = true)
    public JobThread findById(UUID id) {
        return jobThreadRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Thread not found: " + id));
    }

    @Transactional(readOnly = true)
    public JobThread findByJobId(UUID jobId) {
        return jobThreadRepository
                .findByJobId(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Thread not found for job: " + jobId));
    }

    public JobThread update(UUID id, JobThread updates) {
        JobThread existing = findById(id);
        if (updates.getOrigin() != null) {
            existing.setOrigin(updates.getOrigin());
        }
        if (updates.getStatus() != null) {
            existing.setStatus(updates.getStatus());
        }
        existing.setNextFollowUpAt(updates.getNextFollowUpAt());
        existing.setClosedAt(updates.getClosedAt());
        return jobThreadRepository.save(existing);
    }
}
