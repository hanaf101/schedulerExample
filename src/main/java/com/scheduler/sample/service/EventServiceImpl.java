package com.scheduler.sample.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.scheduler.sample.model.Event;
import com.scheduler.sample.repository.EventRepository;

@Service
public class EventServiceImpl implements EventService{

	@Autowired
	EventRepository eventRepository;
	
	@Override
	public List<Event> listAll() {
		
		List<Event> events = new ArrayList<>();
		eventRepository.findAll().forEach(events::add); 
		return events;
	}

}
