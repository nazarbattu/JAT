package com.jat.jat.followup.application;

import com.jat.jat.contact.domain.ContactRepository;
import com.jat.jat.followup.domain.FollowUp;
import com.jat.jat.followup.domain.FollowUpRepository;
import com.jat.jat.followup.domain.FollowUpStatus;
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
public class FollowUpService {

    private final FollowUpRepository followUpRepository;
    private final JobThreadRepository jobThreadRepository;
    private final ContactRepository contactRepository;
    private final ThreadContactRepository threadContactRepository;

    @Transactional(readOnly = true)
    public List<FollowUp> findByThreadId(UUID threadId) {
        return followUpRepository.findByThreadId(threadId);
    }

    @Transactional(readOnly = true)
    public List<FollowUp> findByStatus(FollowUpStatus status) {
        return followUpRepository.findByStatusOrderByDueAtAsc(status);
    }

    @Transactional(readOnly = true)
    public FollowUp findById(UUID id) {
        return followUpRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FollowUp not found: " + id));
    }

    public FollowUp create(FollowUp followUp) {
        if (!jobThreadRepository.existsById(followUp.getThreadId())) {
            throw new ResourceNotFoundException("Thread not found: " + followUp.getThreadId());
        }
        if (followUp.getContactId() != null) {
            ensureContactExists(followUp.getContactId());
        }
        followUp.setId(null);
        FollowUp saved = followUpRepository.save(followUp);
        if (saved.getContactId() != null) {
            ensureThreadContact(saved.getThreadId(), saved.getContactId());
        }
        return saved;
    }

    public FollowUp update(UUID id, FollowUp updates) {
        FollowUp existing = findById(id);
        if (updates.getDueAt() != null) {
            existing.setDueAt(updates.getDueAt());
        }
        if (updates.getSource() != null) {
            existing.setSource(updates.getSource());
        }
        existing.setIntervalDays(updates.getIntervalDays());
        existing.setSuggestedNote(updates.getSuggestedNote());
        existing.setChannelHint(updates.getChannelHint());
        if (updates.getContactId() != null) {
            ensureContactExists(updates.getContactId());
            existing.setContactId(updates.getContactId());
        }
        if (updates.getStatus() != null) {
            existing.setStatus(updates.getStatus());
        }
        existing.setCompletedAt(updates.getCompletedAt());
        existing.setCompletedInteractionId(updates.getCompletedInteractionId());
        FollowUp saved = followUpRepository.save(existing);
        if (saved.getContactId() != null) {
            ensureThreadContact(saved.getThreadId(), saved.getContactId());
        }
        return saved;
    }

    public void delete(UUID id) {
        if (!followUpRepository.existsById(id)) {
            throw new ResourceNotFoundException("FollowUp not found: " + id);
        }
        followUpRepository.deleteById(id);
    }

    private void ensureContactExists(UUID contactId) {
        if (!contactRepository.existsById(contactId)) {
            throw new ResourceNotFoundException("Contact not found: " + contactId);
        }
    }

    private void ensureThreadContact(UUID threadId, UUID contactId) {
        threadContactRepository
                .findByThreadIdAndContactId(threadId, contactId)
                .orElseGet(
                        () ->
                                threadContactRepository.save(
                                        ThreadContact.builder()
                                                .threadId(threadId)
                                                .contactId(contactId)
                                                .build()));
    }
}
