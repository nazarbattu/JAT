package com.jat.jat.thread.domain;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ThreadContactRepository extends JpaRepository<ThreadContact, UUID> {
    List<ThreadContact> findByThreadId(UUID threadId);

    Optional<ThreadContact> findByThreadIdAndContactId(UUID threadId, UUID contactId);

    void deleteByThreadIdAndContactId(UUID threadId, UUID contactId);
}
