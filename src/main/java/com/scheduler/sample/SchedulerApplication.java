package com.scheduler.sample;

import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.scheduler.sample.model.Event;
import com.scheduler.sample.model.EventType;
import com.scheduler.sample.model.Role;
import com.scheduler.sample.repository.EventRepository;
import com.scheduler.sample.repository.EventTypeRepository;
import com.scheduler.sample.repository.RoleRepository;

@SpringBootApplication
@EnableAutoConfiguration
public class SchedulerApplication {

	public static void main(String[] args) {
		SpringApplication.run(SchedulerApplication.class, args);
	}

	@Autowired
	RoleRepository roleRepository;

	@Autowired
	EventTypeRepository eventTypeRepository;
	
	@Autowired
	EventRepository eventRepository;

	@Bean
	InitializingBean sendDatabase() {
		return () -> {
			Role adminRole = new Role();
			adminRole.setId(1);
			adminRole.setRole("ADMIN");
			roleRepository.save(adminRole);

			Role userRole = new Role();
			userRole = new Role();
			userRole.setId(2);
			userRole.setRole("TECH_USER");
			roleRepository.save(userRole);

			EventType downloadEventType = new EventType();

			downloadEventType.setEventType("FILE_DOWNLOAD");
			downloadEventType.setEventName("Download File from given url");

			eventTypeRepository.save(downloadEventType);
			
			Event downloadEvent = new Event();
			downloadEvent.setEventId(300);
			downloadEvent.setDescription("Download File");
			downloadEvent.setEventType(downloadEventType);
			downloadEvent.setExecutionString("http://mirror.filearena.net/pub/speed/SpeedTest_16MB.dat?_ga=2.128745996.1626063043.1545063591-2124372131.1545063591");
			eventRepository.save(downloadEvent);
			
			EventType executeEventType = new EventType();
			executeEventType.setEventType("EXECUTE_SCRIPT");
			executeEventType.setEventName("Execute script");
			eventTypeRepository.save(executeEventType);

			Event executeEvent = new Event();
			executeEvent.setEventId(301);
			executeEvent.setDescription("Execute Script");
			executeEvent.setEventType(executeEventType);
			executeEvent.setExecutionString("IyEvYmluL2Jhc2gKdmFsaWQ9dHJ1ZQpjb3VudD0xCndoaWxlIFsgJHZhbGlkIF0KZG8KZWNobyAkY291bnQKaWYgWyAkY291bnQgLWVxIDUgXTsKdGhlbgpicmVhawpmaQooKGNvdW50KyspKQpkb25l");
			
			eventRepository.save(executeEvent);
		};
	}

}
