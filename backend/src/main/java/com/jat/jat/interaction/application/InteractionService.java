package com.jat.jat.interaction.application;

import com.jat.jat.interaction.domain.Interaction;
import com.jat.jat.interaction.domain.InteractionRepository;
import com.jat.jat.shared.exception.ResourceNotFoundException;
import com.jat.jat.thread.domain.JobThreadRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class InteractionService {

    private final InteractionRepository interactionRepository;
    private final JobThreadRepository jobThreadRepository;

    @Transactional(readOnly = true)
    public List<Interaction> findByThreadId(UUID threadId) {
        return interactionRepository.findByThreadIdOrderByOccurredAtAsc(threadId);
    }

    @Transactional(readOnly = true)
    public Interaction findById(UUID id) {
        return interactionRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interaction not found: " + id));
    }

    public Interaction create(Interaction interaction) {
        if (!jobThreadRepository.existsById(interaction.getThreadId())) {
            throw new ResourceNotFoundException("Thread not found: " + interaction.getThreadId());
        }
        interaction.setId(null);
        return interactionRepository.save(interaction);
    }

    public Interaction update(UUID id, Interaction updates) {
        Interaction existing = findById(id);
        if (updates.getDirection() != null) {
            existing.setDirection(updates.getDirection());
        }
        if (updates.getChannel() != null) {
            existing.setChannel(updates.getChannel());
        }
        if (updates.getOccurredAt() != null) {
            existing.setOccurredAt(updates.getOccurredAt());
        }
        existing.setSubject(updates.getSubject());
        existing.setSummary(updates.getSummary());
        existing.setExternalRef(updates.getExternalRef());
        return interactionRepository.save(existing);
    }

    public void delete(UUID id) {
        if (!interactionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Interaction not found: " + id);
        }
        interactionRepository.deleteById(id);
    }
}
