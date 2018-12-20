package com.scheduler.sample.repository;

import org.springframework.data.repository.CrudRepository;

import com.scheduler.sample.model.EventType;

public interface EventTypeRepository extends CrudRepository<EventType, String>{

}
