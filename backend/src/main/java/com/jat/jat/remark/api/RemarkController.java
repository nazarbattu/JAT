package com.jat.jat.remark.api;

import com.jat.jat.remark.application.RemarkService;
import com.jat.jat.remark.domain.Remark;
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
@RequestMapping("/api/remarks")
@RequiredArgsConstructor
public class RemarkController {

    private final RemarkService remarkService;

    @GetMapping
    public List<Remark> find(
            @RequestParam(required = false) UUID threadId,
            @RequestParam(required = false) UUID interactionId,
            @RequestParam(required = false) UUID followUpId) {
        if (interactionId != null) {
            return remarkService.findByInteractionId(interactionId);
        }
        if (followUpId != null) {
            return remarkService.findByFollowUpId(followUpId);
        }
        if (threadId != null) {
            return remarkService.findByThreadId(threadId);
        }
        throw new IllegalArgumentException("Provide threadId, interactionId, or followUpId");
    }

    @GetMapping("/{id}")
    public Remark findById(@PathVariable UUID id) {
        return remarkService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Remark create(@RequestBody Remark remark) {
        return remarkService.create(remark);
    }

    @PutMapping("/{id}")
    public Remark update(@PathVariable UUID id, @RequestBody Remark remark) {
        return remarkService.update(id, remark);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        remarkService.delete(id);
    }
}
