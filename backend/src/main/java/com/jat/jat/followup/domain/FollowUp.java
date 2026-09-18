package com.jat.jat.followup.domain;

import com.jat.jat.interaction.domain.InteractionChannel;
import com.jat.jat.shared.domain.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "follow_ups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FollowUp extends BaseAuditableEntity {

    @Column(name = "thread_id", nullable = false)
    private UUID threadId;

    @Column(nullable = false)
    private Instant dueAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FollowUpSource source;

    private Integer intervalDays;

    private String suggestedNote;

    @Enumerated(EnumType.STRING)
    private InteractionChannel channelHint;

    @Column(name = "contact_id")
    private UUID contactId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private FollowUpStatus status = FollowUpStatus.pending;

    private Instant completedAt;

    @Column(name = "completed_interaction_id")
    private UUID completedInteractionId;

    @PrePersist
    void applyDefaults() {
        if (status == null) {
            status = FollowUpStatus.pending;
        }
        if (source == FollowUpSource.fixed_interval && intervalDays == null) {
            intervalDays = 2;
        }
    }
}
