package com.jat.jat.thread.application;

import com.jat.jat.contact.domain.ContactRepository;
import com.jat.jat.shared.exception.ResourceNotFoundException;
import com.jat.jat.thread.domain.JobThreadRepository;
import com.jat.jat.thread.domain.ThreadContact;
import com.jat.jat.thread.domain.ThreadContactRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ThreadContactService {

    private final ThreadContactRepository threadContactRepository;
    private final JobThreadRepository jobThreadRepository;
    private final ContactRepository contactRepository;

    @Transactional(readOnly = true)
    public List<ThreadContact> findByThreadId(UUID threadId) {
        return threadContactRepository.findByThreadId(threadId);
    }

    @Transactional(readOnly = true)
    public ThreadContact findById(UUID id) {
        return threadContactRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ThreadContact not found: " + id));
    }

    public ThreadContact create(ThreadContact threadContact) {
        if (!jobThreadRepository.existsById(threadContact.getThreadId())) {
            throw new ResourceNotFoundException("Thread not found: " + threadContact.getThreadId());
        }
        if (!contactRepository.existsById(threadContact.getContactId())) {
            throw new ResourceNotFoundException("Contact not found: " + threadContact.getContactId());
        }
        threadContact.setId(null);
        return threadContactRepository.save(threadContact);
    }

    public ThreadContact update(UUID id, ThreadContact updates) {
        ThreadContact existing = findById(id);
        existing.setRoleOnThread(updates.getRoleOnThread());
        return threadContactRepository.save(existing);
    }

    public void delete(UUID id) {
        if (!threadContactRepository.existsById(id)) {
            throw new ResourceNotFoundException("ThreadContact not found: " + id);
        }
        threadContactRepository.deleteById(id);
    }
}
