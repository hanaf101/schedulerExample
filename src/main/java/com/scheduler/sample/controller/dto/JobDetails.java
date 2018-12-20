package com.scheduler.sample.controller.dto;


import java.sql.Timestamp;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.Setter;

/**
 * Created by jt on 1/10/17.
 */

@Getter
@Setter
public class JobDetails {
	@JsonProperty("jobId")
	private long jobId;
	
	@JsonProperty("jobName")
	private String jobName;
	
	@JsonProperty("state")
	private String state;	
	
	@JsonProperty("eventType")
	private String eventType;
	
	@JsonProperty("Priority")
	private int priority;
	
	@JsonProperty("timeOfExecution")
	private Timestamp timeOfExecution;
	
	@JsonProperty("recurring")
	private boolean recurring;
	
	@JsonProperty("createdBy")
	private long createdBy;
	
	@JsonProperty("createdAt")
	private Timestamp createdAt;
	
	@JsonProperty("lastExecutedAt")
	private Timestamp lastExecutedAt;
	
	@JsonProperty("lastExecutionStatus")
	private String lastExecutionStatus;
	
	@JsonProperty("numberOfRetries")
	private int numberOfRetries;
	
	@JsonProperty("jobType")
	private String jobType;
	
	@JsonProperty
	private long duration;
}
