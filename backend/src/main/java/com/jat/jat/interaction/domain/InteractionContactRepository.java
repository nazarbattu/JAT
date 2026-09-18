package com.jat.jat.interaction.domain;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InteractionContactRepository extends JpaRepository<InteractionContact, UUID> {
    List<InteractionContact> findByInteractionId(UUID interactionId);

    @Query(
            """
            select ic from InteractionContact ic
            where ic.interactionId in (
                select i.id from Interaction i where i.threadId = :threadId
            )
            """)
    List<InteractionContact> findByThreadId(@Param("threadId") UUID threadId);

    void deleteByInteractionIdAndContactId(UUID interactionId, UUID contactId);
}
