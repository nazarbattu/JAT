package com.jat.jat.contact.application;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * One-shot, idempotent migration from legacy contacts.company_id to
 * employer_company_id + contact_hiring_companies.
 */
@Component
@Slf4j
public class ContactCompanyMigrator implements ApplicationRunner {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!legacyCompanyIdColumnExists()) {
            return;
        }

        int employersUpdated =
                entityManager
                        .createNativeQuery(
                                """
                                UPDATE contacts
                                SET employer_company_id = company_id
                                WHERE employer_company_id IS NULL
                                  AND company_id IS NOT NULL
                                """)
                        .executeUpdate();

        int hiringInserted =
                entityManager
                        .createNativeQuery(
                                """
                                INSERT INTO contact_hiring_companies (contact_id, company_id)
                                SELECT c.id, c.employer_company_id
                                FROM contacts c
                                WHERE c.employer_company_id IS NOT NULL
                                  AND NOT EXISTS (
                                    SELECT 1
                                    FROM contact_hiring_companies h
                                    WHERE h.contact_id = c.id
                                      AND h.company_id = c.employer_company_id
                                  )
                                """)
                        .executeUpdate();

        // Legacy column is no longer written; drop NOT NULL so new inserts succeed.
        try {
            entityManager
                    .createNativeQuery(
                            "ALTER TABLE contacts ALTER COLUMN company_id DROP NOT NULL")
                    .executeUpdate();
        } catch (Exception ex) {
            log.debug("Could not relax contacts.company_id NOT NULL (may already be nullable): {}",
                    ex.getMessage());
        }

        if (employersUpdated > 0 || hiringInserted > 0) {
            log.info(
                    "Migrated contact companies: {} employers backfilled, {} hiring links added",
                    employersUpdated,
                    hiringInserted);
        }
    }

    private boolean legacyCompanyIdColumnExists() {
        Number count =
                (Number)
                        entityManager
                                .createNativeQuery(
                                        """
                                        SELECT COUNT(*)
                                        FROM information_schema.columns
                                        WHERE table_schema = current_schema()
                                          AND table_name = 'contacts'
                                          AND column_name = 'company_id'
                                        """)
                                .getSingleResult();
        return count.intValue() > 0;
    }
}
