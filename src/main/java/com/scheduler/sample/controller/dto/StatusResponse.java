package com.scheduler.sample.controller.dto;


import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import lombok.Getter;
import lombok.Setter;

@JsonPropertyOrder({
"status",
"description",

})
@Getter @Setter
public class StatusResponse {
	
	@JsonProperty("status")
    String status;

    @JsonProperty("description")
    String description;
    
	
    
}

