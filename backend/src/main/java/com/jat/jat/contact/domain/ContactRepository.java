package com.jat.jat.contact.domain;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ContactRepository extends JpaRepository<Contact, UUID> {

    @Query(
            """
            select distinct c from Contact c
            left join c.hiringCompanyIds h
            where c.employerCompanyId = :companyId or h = :companyId
            """)
    List<Contact> findRelatedToCompany(@Param("companyId") UUID companyId);
}
