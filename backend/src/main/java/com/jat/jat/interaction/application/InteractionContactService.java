package com.jat.jat.interaction.application;

import com.jat.jat.contact.domain.ContactRepository;
import com.jat.jat.interaction.domain.Interaction;
import com.jat.jat.interaction.domain.InteractionContact;
import com.jat.jat.interaction.domain.InteractionContactRepository;
import com.jat.jat.interaction.domain.InteractionRepository;
import com.jat.jat.shared.exception.ResourceNotFoundException;
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
public class InteractionContactService {

    private final InteractionContactRepository interactionContactRepository;
    private final InteractionRepository interactionRepository;
    private final ContactRepository contactRepository;
    private final ThreadContactRepository threadContactRepository;

    @Transactional(readOnly = true)
    public List<InteractionContact> findByInteractionId(UUID interactionId) {
        return interactionContactRepository.findByInteractionId(interactionId);
    }

    @Transactional(readOnly = true)
    public List<InteractionContact> findByThreadId(UUID threadId) {
        return interactionContactRepository.findByThreadId(threadId);
    }

    @Transactional(readOnly = true)
    public InteractionContact findById(UUID id) {
        return interactionContactRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InteractionContact not found: " + id));
    }

    public InteractionContact create(InteractionContact interactionContact) {
        Interaction interaction = interactionRepository
                .findById(interactionContact.getInteractionId())
                .orElseThrow(
                        () ->
                                new ResourceNotFoundException(
                                        "Interaction not found: " + interactionContact.getInteractionId()));
        if (!contactRepository.existsById(interactionContact.getContactId())) {
            throw new ResourceNotFoundException("Contact not found: " + interactionContact.getContactId());
        }
        interactionContact.setId(null);
        InteractionContact saved = interactionContactRepository.save(interactionContact);
        ensureThreadContact(interaction.getThreadId(), interactionContact.getContactId());
        return saved;
    }

    public void delete(UUID id) {
        if (!interactionContactRepository.existsById(id)) {
            throw new ResourceNotFoundException("InteractionContact not found: " + id);
        }
        interactionContactRepository.deleteById(id);
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
