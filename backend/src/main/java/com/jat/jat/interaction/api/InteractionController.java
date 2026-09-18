package com.jat.jat.interaction.api;

import com.jat.jat.interaction.application.InteractionService;
import com.jat.jat.interaction.domain.Interaction;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/interactions")
@RequiredArgsConstructor
public class InteractionController {

    private final InteractionService interactionService;

    @GetMapping
    public List<Interaction> findByThreadId(@RequestParam UUID threadId) {
        return interactionService.findByThreadId(threadId);
    }

    @GetMapping("/{id}")
    public Interaction findById(@PathVariable UUID id) {
        return interactionService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Interaction create(@RequestBody Interaction interaction) {
        return interactionService.create(interaction);
    }

    @PutMapping("/{id}")
    public Interaction update(@PathVariable UUID id, @RequestBody Interaction interaction) {
        return interactionService.update(id, interaction);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        interactionService.delete(id);
    }
}
