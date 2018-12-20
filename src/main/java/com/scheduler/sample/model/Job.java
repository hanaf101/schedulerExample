package com.scheduler.sample.model;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToOne;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;

@Getter
@Setter
@Entity
public class Job {

	@Id
	@Column(name = "JOB_ID", nullable = false, columnDefinition = "BIGINT")
	@JsonProperty("jobId")
	private long jobId;

	@Column(name = "JOB_NAME", nullable = false, columnDefinition = "varchar(50)")
	@JsonProperty("name")
	private String name;

	@Column(name = "STATE", nullable = false, columnDefinition = "varchar(50)")
	@JsonProperty("state")
	private String state;

	@Column(name = "PRIORITY", nullable = false, columnDefinition = "INT")
	@JsonProperty("priority")
	private int priority;

	@Column(name = "TIME_OF_EXECUTION", nullable = true, columnDefinition = "timestamp")
	@JsonProperty("timeOfExecution")
	private Timestamp timeOfExecution;

	@Column(name = "DURATION", nullable = true, columnDefinition = "INT")
	@JsonProperty("duration")
	private int duration;

	@Column(name = "RECURRING", nullable = false, columnDefinition = "boolean")
	@JsonProperty("recurring")
	private boolean recurring;

	@Column(name = "CREATED_AT", nullable = true, columnDefinition = "timestamp")
	@JsonProperty("createdat")
	private Timestamp createdAt;

	@Column(name = "LAST_EXECUTED_AT", nullable = true, columnDefinition = "timestamp")
	@JsonProperty("lastExecutedAt")
	private Timestamp lastExecutedAt;

	@Column(name = "LAST_EXECUTION_STATUS", nullable = true, columnDefinition = "varchar(50)")
	@JsonProperty("lastExecutionStatus")
	private String lastExecutionStatus;

	@Column(name = "NUMBER_OF_RETRIES", nullable = true, columnDefinition = "INT")
	private int numberOfRetries;

	@Column(name = "JOB_TYPE", nullable = true, columnDefinition = "varchar(20)")
	private String jobType;

	@ManyToOne(cascade = CascadeType.ALL)
	@JoinTable(name = "CREATED_BY_ROLE", joinColumns = @JoinColumn(name = "CREATED_BY"), inverseJoinColumns = @JoinColumn(name = "USER_ID"))
	private User user;
	
	@ManyToOne(cascade = CascadeType.ALL)
	@JoinTable(name = "JOB_EVENT_TYPE", joinColumns = @JoinColumn(name = "EVENT"), inverseJoinColumns = @JoinColumn(name = "EVENT_ID"))
	private Event event;
}
