package com.jat.jat.thread.api;

import com.jat.jat.thread.application.JobThreadService;
import com.jat.jat.thread.domain.JobThread;
import com.jat.jat.thread.domain.ThreadStatus;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/threads")
@RequiredArgsConstructor
public class JobThreadController {

    private final JobThreadService jobThreadService;

    @GetMapping
    public List<JobThread> findAll(@RequestParam(required = false) ThreadStatus status) {
        if (status != null) {
            return jobThreadService.findByStatus(status);
        }
        return jobThreadService.findAll();
    }

    @GetMapping("/{id}")
    public JobThread findById(@PathVariable UUID id) {
        return jobThreadService.findById(id);
    }

    @GetMapping("/by-job/{jobId}")
    public JobThread findByJobId(@PathVariable UUID jobId) {
        return jobThreadService.findByJobId(jobId);
    }

    @PutMapping("/{id}")
    public JobThread update(@PathVariable UUID id, @RequestBody JobThread thread) {
        return jobThreadService.update(id, thread);
    }
}
