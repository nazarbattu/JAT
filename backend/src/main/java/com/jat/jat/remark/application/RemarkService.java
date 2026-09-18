package com.jat.jat.remark.application;

import com.jat.jat.followup.domain.FollowUpRepository;
import com.jat.jat.interaction.domain.InteractionRepository;
import com.jat.jat.remark.domain.Remark;
import com.jat.jat.remark.domain.RemarkRepository;
import com.jat.jat.shared.exception.ResourceNotFoundException;
import com.jat.jat.thread.domain.JobThreadRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class RemarkService {

    private final RemarkRepository remarkRepository;
    private final JobThreadRepository jobThreadRepository;
    private final InteractionRepository interactionRepository;
    private final FollowUpRepository followUpRepository;

    @Transactional(readOnly = true)
    public List<Remark> findByThreadId(UUID threadId) {
        return remarkRepository.findByThreadIdOrderByRecordedAtAsc(threadId);
    }

    @Transactional(readOnly = true)
    public List<Remark> findByInteractionId(UUID interactionId) {
        return remarkRepository.findByInteractionId(interactionId);
    }

    @Transactional(readOnly = true)
    public Optional<Remark> findFirstByInteractionId(UUID interactionId) {
        return remarkRepository.findFirstByInteractionIdOrderByRecordedAtAsc(interactionId);
    }

    @Transactional(readOnly = true)
    public List<Remark> findByFollowUpId(UUID followUpId) {
        return remarkRepository.findByFollowUpId(followUpId);
    }

    @Transactional(readOnly = true)
    public Optional<Remark> findFirstByFollowUpId(UUID followUpId) {
        return remarkRepository.findFirstByFollowUpIdOrderByRecordedAtAsc(followUpId);
    }

    @Transactional(readOnly = true)
    public Remark findById(UUID id) {
        return remarkRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Remark not found: " + id));
    }

    public Remark create(Remark remark) {
        if (!jobThreadRepository.existsById(remark.getThreadId())) {
            throw new ResourceNotFoundException("Thread not found: " + remark.getThreadId());
        }
        if (remark.getInteractionId() != null
                && !interactionRepository.existsById(remark.getInteractionId())) {
            throw new ResourceNotFoundException("Interaction not found: " + remark.getInteractionId());
        }
        if (remark.getFollowUpId() != null
                && !followUpRepository.existsById(remark.getFollowUpId())) {
            throw new ResourceNotFoundException("FollowUp not found: " + remark.getFollowUpId());
        }
        remark.setId(null);
        return remarkRepository.save(remark);
    }

    public Remark update(UUID id, Remark updates) {
        Remark existing = findById(id);
        existing.setBody(updates.getBody());
        if (updates.getRecordedAt() != null) {
            existing.setRecordedAt(updates.getRecordedAt());
        }
        if (updates.getInteractionId() != null) {
            if (!interactionRepository.existsById(updates.getInteractionId())) {
                throw new ResourceNotFoundException(
                        "Interaction not found: " + updates.getInteractionId());
            }
            existing.setInteractionId(updates.getInteractionId());
        }
        if (updates.getFollowUpId() != null) {
            if (!followUpRepository.existsById(updates.getFollowUpId())) {
                throw new ResourceNotFoundException("FollowUp not found: " + updates.getFollowUpId());
            }
            existing.setFollowUpId(updates.getFollowUpId());
        }
        return remarkRepository.save(existing);
    }

    public void delete(UUID id) {
        if (!remarkRepository.existsById(id)) {
            throw new ResourceNotFoundException("Remark not found: " + id);
        }
        remarkRepository.deleteById(id);
    }
}
