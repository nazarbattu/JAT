package com.jat.jat.remark.domain;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RemarkRepository extends JpaRepository<Remark, UUID> {
    List<Remark> findByThreadIdOrderByRecordedAtAsc(UUID threadId);

    List<Remark> findByInteractionId(UUID interactionId);

    Optional<Remark> findFirstByInteractionIdOrderByRecordedAtAsc(UUID interactionId);

    List<Remark> findByFollowUpId(UUID followUpId);

    Optional<Remark> findFirstByFollowUpIdOrderByRecordedAtAsc(UUID followUpId);
}
