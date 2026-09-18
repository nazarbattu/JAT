package com.jat.jat.company.domain;

import com.jat.jat.shared.domain.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company extends BaseAuditableEntity {

    @Column(nullable = false)
    private String name;

    @Column(length = 2048)
    private String website;

    @Column(length = 2048)
    private String careersUrl;

    private String location;

    @Column(columnDefinition = "text")
    private String notes;
}
