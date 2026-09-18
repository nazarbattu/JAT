package com.jat.jat.followup.api;

import com.jat.jat.followup.application.FollowUpService;
import com.jat.jat.followup.domain.FollowUp;
import com.jat.jat.followup.domain.FollowUpStatus;
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
@RequestMapping("/api/follow-ups")
@RequiredArgsConstructor
public class FollowUpController {

    private final FollowUpService followUpService;

    @GetMapping
    public List<FollowUp> find(
            @RequestParam(required = false) UUID threadId,
            @RequestParam(required = false) FollowUpStatus status) {
        if (threadId != null) {
            return followUpService.findByThreadId(threadId);
        }
        if (status != null) {
            return followUpService.findByStatus(status);
        }
        return followUpService.findByStatus(FollowUpStatus.pending);
    }

    @GetMapping("/{id}")
    public FollowUp findById(@PathVariable UUID id) {
        return followUpService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FollowUp create(@RequestBody FollowUp followUp) {
        return followUpService.create(followUp);
    }

    @PutMapping("/{id}")
    public FollowUp update(@PathVariable UUID id, @RequestBody FollowUp followUp) {
        return followUpService.update(id, followUp);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        followUpService.delete(id);
    }
}
