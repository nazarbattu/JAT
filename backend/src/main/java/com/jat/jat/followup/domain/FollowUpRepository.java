package com.jat.jat.followup.domain;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FollowUpRepository extends JpaRepository<FollowUp, UUID> {
    List<FollowUp> findByThreadId(UUID threadId);

    List<FollowUp> findByStatusOrderByDueAtAsc(FollowUpStatus status);
}
