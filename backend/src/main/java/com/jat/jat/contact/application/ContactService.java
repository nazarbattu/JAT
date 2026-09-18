package com.jat.jat.contact.application;

import com.jat.jat.company.domain.CompanyRepository;
import com.jat.jat.contact.domain.Contact;
import com.jat.jat.contact.domain.ContactRepository;
import com.jat.jat.shared.exception.ResourceNotFoundException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ContactService {

    private final ContactRepository contactRepository;
    private final CompanyRepository companyRepository;

    @Transactional(readOnly = true)
    public List<Contact> findAll() {
        return contactRepository.findAll();
    }

    /** Contacts who work at or hire for the given company. */
    @Transactional(readOnly = true)
    public List<Contact> findByCompanyId(UUID companyId) {
        return contactRepository.findRelatedToCompany(companyId);
    }

    @Transactional(readOnly = true)
    public Contact findById(UUID id) {
        return contactRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found: " + id));
    }

    public Contact create(Contact contact) {
        normalizeAndValidate(contact);
        contact.setId(null);
        return contactRepository.save(contact);
    }

    public Contact update(UUID id, Contact updates) {
        Contact existing = findById(id);
        if (updates.getEmployerCompanyId() != null) {
            existing.setEmployerCompanyId(updates.getEmployerCompanyId());
        }
        if (updates.getHiringCompanyIds() != null) {
            existing.setHiringCompanyIds(new HashSet<>(updates.getHiringCompanyIds()));
        }
        existing.setName(updates.getName());
        existing.setPosition(updates.getPosition());
        existing.setEmails(updates.getEmails());
        existing.setPhones(updates.getPhones());
        existing.setLinkedinUrl(updates.getLinkedinUrl());
        existing.setNotes(updates.getNotes());
        normalizeAndValidate(existing);
        return contactRepository.save(existing);
    }

    public void delete(UUID id) {
        if (!contactRepository.existsById(id)) {
            throw new ResourceNotFoundException("Contact not found: " + id);
        }
        contactRepository.deleteById(id);
    }

    private void normalizeAndValidate(Contact contact) {
        if (contact.getEmployerCompanyId() == null) {
            throw new IllegalArgumentException("employerCompanyId is required");
        }
        ensureCompanyExists(contact.getEmployerCompanyId());

        Set<UUID> hiring = contact.getHiringCompanyIds();
        if (hiring == null) {
            hiring = new HashSet<>();
            contact.setHiringCompanyIds(hiring);
        } else {
            contact.setHiringCompanyIds(new HashSet<>(hiring));
            hiring = contact.getHiringCompanyIds();
        }

        if (hiring.isEmpty()) {
            throw new IllegalArgumentException("At least one hiringCompanyId is required");
        }

        for (UUID companyId : hiring) {
            if (companyId == null) {
                throw new IllegalArgumentException("hiringCompanyIds must not contain null");
            }
            ensureCompanyExists(companyId);
        }
    }

    private void ensureCompanyExists(UUID companyId) {
        if (!companyRepository.existsById(companyId)) {
            throw new ResourceNotFoundException("Company not found: " + companyId);
        }
    }
}
