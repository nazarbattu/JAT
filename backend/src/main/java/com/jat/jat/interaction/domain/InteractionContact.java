package com.jat.jat.interaction.domain;

import com.jat.jat.shared.domain.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "interaction_contacts",
        uniqueConstraints = @UniqueConstraint(columnNames = {"interaction_id", "contact_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InteractionContact extends BaseAuditableEntity {

    @Column(name = "interaction_id", nullable = false)
    private UUID interactionId;

    @Column(name = "contact_id", nullable = false)
    private UUID contactId;
}
