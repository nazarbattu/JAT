package com.jat.jat.interaction.api;

import com.jat.jat.interaction.application.InteractionContactService;
import com.jat.jat.interaction.domain.InteractionContact;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/interaction-contacts")
@RequiredArgsConstructor
public class InteractionContactController {

    private final InteractionContactService interactionContactService;

    @GetMapping
    public List<InteractionContact> find(
            @RequestParam(required = false) UUID interactionId,
            @RequestParam(required = false) UUID threadId) {
        if (interactionId != null) {
            return interactionContactService.findByInteractionId(interactionId);
        }
        if (threadId != null) {
            return interactionContactService.findByThreadId(threadId);
        }
        throw new IllegalArgumentException("Provide interactionId or threadId");
    }

    @GetMapping("/{id}")
    public InteractionContact findById(@PathVariable UUID id) {
        return interactionContactService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InteractionContact create(@RequestBody InteractionContact interactionContact) {
        return interactionContactService.create(interactionContact);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        interactionContactService.delete(id);
    }
}
