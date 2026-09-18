package com.jat.jat.contact.application;

import com.jat.jat.company.domain.CompanyRepository;
import com.jat.jat.contact.domain.Contact;
import com.jat.jat.contact.domain.ContactRepository;
import com.jat.jat.shared.exception.ResourceNotFoundException;
import java.util.List;
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

    @Transactional(readOnly = true)
    public List<Contact> findByCompanyId(UUID companyId) {
        return contactRepository.findByCompanyId(companyId);
    }

    @Transactional(readOnly = true)
    public Contact findById(UUID id) {
        return contactRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found: " + id));
    }

    public Contact create(Contact contact) {
        ensureCompanyExists(contact.getCompanyId());
        contact.setId(null);
        return contactRepository.save(contact);
    }

    public Contact update(UUID id, Contact updates) {
        Contact existing = findById(id);
        if (updates.getCompanyId() != null) {
            ensureCompanyExists(updates.getCompanyId());
            existing.setCompanyId(updates.getCompanyId());
        }
        existing.setName(updates.getName());
        existing.setPosition(updates.getPosition());
        existing.setEmails(updates.getEmails());
        existing.setPhones(updates.getPhones());
        existing.setLinkedinUrl(updates.getLinkedinUrl());
        existing.setNotes(updates.getNotes());
        return contactRepository.save(existing);
    }

    public void delete(UUID id) {
        if (!contactRepository.existsById(id)) {
            throw new ResourceNotFoundException("Contact not found: " + id);
        }
        contactRepository.deleteById(id);
    }

    private void ensureCompanyExists(UUID companyId) {
        if (!companyRepository.existsById(companyId)) {
            throw new ResourceNotFoundException("Company not found: " + companyId);
        }
    }
}
