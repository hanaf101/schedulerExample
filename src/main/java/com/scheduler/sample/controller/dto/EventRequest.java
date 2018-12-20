package com.scheduler.sample.controller.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EventRequest {

	private long eventId;
  	
	private String eventName;
	
	private String description;
	
	private String executionString;	
	
	private String additionalProperty;	

}

