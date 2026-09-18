package com.jat.jat.thread.api;

import com.jat.jat.thread.application.ThreadContactService;
import com.jat.jat.thread.domain.ThreadContact;
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
@RequestMapping("/api/thread-contacts")
@RequiredArgsConstructor
public class ThreadContactController {

    private final ThreadContactService threadContactService;

    @GetMapping
    public List<ThreadContact> findByThreadId(@RequestParam UUID threadId) {
        return threadContactService.findByThreadId(threadId);
    }

    @GetMapping("/{id}")
    public ThreadContact findById(@PathVariable UUID id) {
        return threadContactService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ThreadContact create(@RequestBody ThreadContact threadContact) {
        return threadContactService.create(threadContact);
    }

    @PutMapping("/{id}")
    public ThreadContact update(@PathVariable UUID id, @RequestBody ThreadContact threadContact) {
        return threadContactService.update(id, threadContact);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        threadContactService.delete(id);
    }
}
