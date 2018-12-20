package com.scheduler.sample.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.scheduler.sample.controller.dto.EventRequest;
import com.scheduler.sample.controller.dto.StatusResponse;
import com.scheduler.sample.model.Event;
import com.scheduler.sample.model.EventType;
import com.scheduler.sample.repository.EventRepository;
import com.scheduler.sample.repository.EventTypeRepository;

@Service
public class EventServiceImpl implements EventService{

	@Autowired
	EventRepository eventRepository;
	
	@Autowired
	EventTypeRepository eventTypeRespository;
	
	@Override
	public List<Event> listAll() {
		
		List<Event> events = new ArrayList<>();
		eventRepository.findAll().forEach(events::add); 
		return events;
	}

	@Override
	public StatusResponse addEvent(EventRequest eventRequest) {
		Event event = new Event();
		StatusResponse statusResponse = new StatusResponse();
		event.setEventId(eventRequest.getEventId());
		event.setAdditionalProperty(eventRequest.getAdditionalProperty());
		event.setDescription(eventRequest.getDescription());
		
		EventType eventType = eventTypeRespository.findById(eventRequest.getEventName()).get();
		event.setEventType(eventType);
//		(eventRequest.getEventName());
		event.setExecutionString(eventRequest.getExecutionString());
		eventRepository.save(event);
		statusResponse.setStatus("SUCCESS");
		statusResponse.setDescription("Event Added Successfully");
		return statusResponse;
	}

}
