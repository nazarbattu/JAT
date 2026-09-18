package com.jat.jat.thread.domain;

import com.jat.jat.shared.domain.BaseAuditableEntity;
import jakarta.persistence.AttributeOverride;
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
        name = "thread_contacts",
        uniqueConstraints = @UniqueConstraint(columnNames = {"thread_id", "contact_id"}))
@AttributeOverride(
        name = "createdAt",
        column = @Column(name = "added_at", nullable = false, updatable = false))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThreadContact extends BaseAuditableEntity {

    @Column(name = "thread_id", nullable = false)
    private UUID threadId;

    @Column(name = "contact_id", nullable = false)
    private UUID contactId;

    private String roleOnThread;
}
