
package com.scheduler.sample.controller.dto;

import java.sql.Timestamp;

import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class ScheduleRequest {

	
	private String jobName;
	
	private long jobId;

	private String name;

	private String state;
	
	private String jobType;

	private long eventId;

	private int priority;

	private int timeOfExecution;

	private boolean recurring;

	private int createdBy;

	private Timestamp createdAt;

	private int numberOfRetries;
	
	private String action;
	
	private int duration;

}