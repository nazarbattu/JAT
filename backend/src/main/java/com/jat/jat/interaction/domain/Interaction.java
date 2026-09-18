package com.jat.jat.interaction.domain;

import com.jat.jat.shared.domain.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "interactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Interaction extends BaseAuditableEntity {

    @Column(name = "thread_id", nullable = false)
    private UUID threadId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InteractionDirection direction;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InteractionChannel channel;

    @Column(nullable = false)
    private Instant occurredAt;

    private String subject;

    @Column(columnDefinition = "text")
    private String summary;

    private String externalRef;
}
