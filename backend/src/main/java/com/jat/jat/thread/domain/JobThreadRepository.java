package com.jat.jat.thread.domain;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobThreadRepository extends JpaRepository<JobThread, UUID> {
    Optional<JobThread> findByJobId(UUID jobId);

    List<JobThread> findByStatus(ThreadStatus status);
}
