package com.scheduler.sample.controller.dto;


import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class EventDetail {
		@JsonProperty("eventId")
		private long eventId;
		
		@JsonProperty("eventName")
		private String eventName;
		
	
}
