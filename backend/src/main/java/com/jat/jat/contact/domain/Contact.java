package com.jat.jat.contact.domain;

import com.jat.jat.shared.domain.BaseAuditableEntity;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "contacts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Contact extends BaseAuditableEntity {

    /**
     * Company where this person works. Nullable only so Hibernate can add the column to
     * existing DBs before {@code ContactCompanyMigrator} backfills; service requires it.
     */
    @Column(name = "employer_company_id")
    private UUID employerCompanyId;

    /** Companies this person is hiring / recruiting for (may include employer). */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "contact_hiring_companies",
            joinColumns = @JoinColumn(name = "contact_id"))
    @Column(name = "company_id", nullable = false)
    @Builder.Default
    private Set<UUID> hiringCompanyIds = new HashSet<>();

    @Column(nullable = false)
    private String name;

    private String position;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "contact_emails", joinColumns = @JoinColumn(name = "contact_id"))
    @Column(name = "email")
    @Builder.Default
    private List<String> emails = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "contact_phones", joinColumns = @JoinColumn(name = "contact_id"))
    @Column(name = "phone")
    @Builder.Default
    private List<String> phones = new ArrayList<>();

    @Column(length = 2048)
    private String linkedinUrl;

    @Column(columnDefinition = "text")
    private String notes;
}
