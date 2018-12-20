package com.scheduler.sample.repository;

import org.springframework.data.repository.CrudRepository;

import com.scheduler.sample.model.Event;


public interface EventRepository extends CrudRepository<Event, Long> {
	Event findByEventId(long l);
}
