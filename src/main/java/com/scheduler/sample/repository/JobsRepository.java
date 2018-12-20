package com.scheduler.sample.repository;

import org.springframework.data.repository.CrudRepository;

import com.scheduler.sample.model.Job;

/**
 * Created by jt on 1/10/17.
 */
public interface JobsRepository extends CrudRepository<Job, Long> {
}
