package com.jat.jat.remark.domain;

import com.jat.jat.shared.domain.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "remarks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Remark extends BaseAuditableEntity {

    @Column(name = "thread_id", nullable = false)
    private UUID threadId;

    @Column(name = "interaction_id")
    private UUID interactionId;

    @Column(name = "follow_up_id")
    private UUID followUpId;

    @Column(nullable = false, columnDefinition = "text")
    private String body;

    @Column(nullable = false)
    private Instant recordedAt;

    @PrePersist
    void defaultRecordedAt() {
        if (recordedAt == null) {
            recordedAt = Instant.now();
        }
    }
}
