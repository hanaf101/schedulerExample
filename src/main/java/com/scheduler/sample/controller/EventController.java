package com.scheduler.sample.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.scheduler.sample.controller.dto.EventDetail;
import com.scheduler.sample.controller.dto.StatusResponse;
import com.scheduler.sample.model.Event;
import com.scheduler.sample.service.EventService;
import com.scheduler.sample.utils.ServiceUtils;

@RestController
@RequestMapping(value = "/api")
public class EventController {
	
	@Autowired
	EventService eventService;
	
	
	@GetMapping(value = "/event")
	public ResponseEntity<StatusResponse> queryjob() {
		StatusResponse statusResponse =  new StatusResponse();
		List <Event> eventList = eventService.listAll();
		List <EventDetail> eventDetailList = new ArrayList<EventDetail>();
		
		for(Event event: eventList) {
			EventDetail eventDetail = new EventDetail();
			eventDetail.setEventId(event.getEventId());
			eventDetail.setEventName(event.getEventName());
			eventDetailList.add(eventDetail);
		}
		
		
		statusResponse.setStatus("SUCCESS");
		statusResponse.setDescription(ServiceUtils.getStringfromObject(eventDetailList));
		return new ResponseEntity<>(statusResponse, HttpStatus.OK);
	}

}
