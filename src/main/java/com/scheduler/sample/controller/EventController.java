
package com.scheduler.sample.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.scheduler.sample.controller.dto.EventDetail;
import com.scheduler.sample.controller.dto.EventRequest;
import com.scheduler.sample.controller.dto.StatusResponse;
import com.scheduler.sample.model.Event;
import com.scheduler.sample.service.EventService;
import com.scheduler.sample.utils.ServiceUtils;

@RestController
@RequestMapping(value = "/api")
public class EventController {

	@Autowired
	EventService eventService;
	
	/**
	 * List down all events
	 * @return
	 */

	
	@GetMapping(value = "/event")
	public ResponseEntity<StatusResponse> queryjob() {
		StatusResponse statusResponse = new StatusResponse();
		List<Event> eventList = eventService.listAll();
		List<EventDetail> eventDetailList = new ArrayList<EventDetail>();

		for (Event event : eventList) {
			EventDetail eventDetail = new EventDetail();
			eventDetail.setEventId(event.getEventId());
			eventDetail.setEventName(event.getEventType().getEventName());
			eventDetailList.add(eventDetail);
		}

		statusResponse.setStatus("SUCCESS");
		statusResponse.setDescription(ServiceUtils.getStringfromObject(eventDetailList));
		return new ResponseEntity<>(statusResponse, HttpStatus.OK);
	}
	
	/**
	 * Create a new Event. Two type of events are currently configured.  Properties required to be set in execution string and Additional property field
	 * @param eventRequest
	 * @return
	 * @throws Exception
	 */

	@RequestMapping(value = "/event", produces = { "application/json" }, consumes = {
			"application/json" }, method = RequestMethod.POST)
	public ResponseEntity<StatusResponse> addNewEvent(@RequestBody EventRequest eventRequest) throws Exception {
		StatusResponse statusResponse = new StatusResponse();
		statusResponse = eventService.addEvent(eventRequest);
		return new ResponseEntity<>(statusResponse, HttpStatus.OK);
	}

}

