package com.scheduler.sample.service;

import java.util.List;

import com.scheduler.sample.controller.dto.EventRequest;
import com.scheduler.sample.controller.dto.StatusResponse;
import com.scheduler.sample.model.Event;

public interface EventService {
	   List<Event> listAll();
	   StatusResponse addEvent(EventRequest eventRequest);
}
