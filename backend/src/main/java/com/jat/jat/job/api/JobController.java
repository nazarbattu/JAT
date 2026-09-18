package com.jat.jat.job.api;

import com.jat.jat.job.application.JobService;
import com.jat.jat.job.domain.Job;
import com.jat.jat.job.domain.JobStatus;
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
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    @GetMapping
    public List<Job> findAll(
            @RequestParam(required = false) UUID companyId,
            @RequestParam(required = false) JobStatus status) {
        if (companyId != null && status != null) {
            return jobService.findByCompanyIdAndStatus(companyId, status);
        }
        if (companyId != null) {
            return jobService.findByCompanyId(companyId);
        }
        if (status != null) {
            return jobService.findByStatus(status);
        }
        return jobService.findAll();
    }

    @GetMapping("/{id}")
    public Job findById(@PathVariable UUID id) {
        return jobService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Job create(@RequestBody Job job) {
        return jobService.create(job);
    }

    @PutMapping("/{id}")
    public Job update(@PathVariable UUID id, @RequestBody Job job) {
        return jobService.update(id, job);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        jobService.delete(id);
    }
}
