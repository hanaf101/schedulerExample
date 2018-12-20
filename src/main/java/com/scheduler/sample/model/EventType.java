package com.scheduler.sample.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class EventType {

	@Id
	@Column(name="EVENT_TYPE",nullable=false,columnDefinition="varchar(50)")
	private String eventType;
	
	@Column(name="EVENT_NAME",nullable=false,columnDefinition="varchar(50)")
	private String eventName;
	
}
