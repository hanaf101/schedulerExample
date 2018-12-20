package com.scheduler.sample.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.scheduler.sample.model.Event;


public interface EventRepository extends JpaRepository<Event, Long> {
	Event findByEventId(long l);
}
