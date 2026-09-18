package com.jat.jat.company.application;

import com.jat.jat.company.domain.Company;
import com.jat.jat.company.domain.CompanyRepository;
import com.jat.jat.shared.exception.ResourceNotFoundException;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class CompanyService {

    private final CompanyRepository companyRepository;

    @Transactional(readOnly = true)
    public List<Company> findAll() {
        return companyRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Company findById(UUID id) {
        return companyRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + id));
    }

    public Company create(Company company) {
        company.setId(null);
        return companyRepository.save(company);
    }

    public Company update(UUID id, Company updates) {
        Company existing = findById(id);
        existing.setName(updates.getName());
        existing.setWebsite(updates.getWebsite());
        existing.setCareersUrl(updates.getCareersUrl());
        existing.setLocation(updates.getLocation());
        existing.setNotes(updates.getNotes());
        return companyRepository.save(existing);
    }

    public void delete(UUID id) {
        if (!companyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Company not found: " + id);
        }
        companyRepository.deleteById(id);
    }
}
