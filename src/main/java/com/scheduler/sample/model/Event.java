package com.scheduler.sample.model;



import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Event {
	
	  	@Id
		@Column(name="EVENT_ID",nullable=false,columnDefinition="long")
		private long eventId;
	  	
	  	@Column(name="EVENT_TYPE",nullable=false,columnDefinition="varchar(50)")
		private String eventName;
		
		@Column(name="DESCRIPTION",nullable=true,columnDefinition="varchar(50)")
		private String description;
		
		@Column(name="EXECUTION_STRING",nullable=false,columnDefinition="varchar(500)")
		private String executionString;	
		
	    
	    @OneToOne(fetch = FetchType.LAZY, optional = false)
	    @JoinColumn(name = "EVENT_NAME", nullable = false)
	    private EventType eventType;

}
