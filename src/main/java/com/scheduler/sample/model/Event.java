
package com.scheduler.sample.model;



import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Event {
	
	  	@Id
		@Column(name="EVENT_ID",nullable=false,columnDefinition="BIGINT")
		private long eventId;
	  	
		@Column(name="DESCRIPTION",nullable=true,columnDefinition="varchar(50)")
		private String description;
		
		@Column(name="EXECUTION_STRING",nullable=false,columnDefinition="varchar(500)")
		private String executionString;	
		
		@Column(name="ADDITIONAL_PROPERTY",nullable=true, columnDefinition="varchar(50)")
		private String additionalProperty;	
		

	    @ManyToOne(fetch = FetchType.LAZY, optional = false)
	    @JoinColumn(name = "EVENT_TYPE", referencedColumnName = "EVENT_TYPE",  nullable = false)
	    private EventType eventType;

}

