package com.scheduler.sample.repositories;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.scheduler.sample.model.Event;
import com.scheduler.sample.model.EventType;
import com.scheduler.sample.model.Job;
import com.scheduler.sample.model.User;
import com.scheduler.sample.repository.EventRepository;
import com.scheduler.sample.repository.EventTypeRepository;
import com.scheduler.sample.repository.JobsRepository;
import com.scheduler.sample.repository.UserRepository;

@RunWith(SpringJUnit4ClassRunner.class)
@SpringBootTest
public class RepositoryTests {

	@Autowired
	private JobsRepository jobRepository;

	@Autowired
	private EventRepository eventRepository;

	@Autowired
	private EventTypeRepository eventTypeRepository;

	@Autowired
	UserRepository userRepository;

	@Before
	public void setUp() throws Exception {

	}

	@Test
	public void testPersistence() {

		EventType eventType = new EventType();
		eventType.setEventName("DUMMY");
		eventType.setEventType("DUMMY");
		eventTypeRepository.save(eventType);

		Event event = new Event();
		event.setEventId(200);
		// event.setEventName("DUMMY");
		event.setEventType(eventType);
		eventRepository.save(event);

		User user = new User();
		user.setId(1010);
		user.setEmail("email@abe.com");
		userRepository.save(user);

		// given
		Job job = new Job();
		job.setJobId(1000);
		job.setUser(user);
		job.setDuration(10000);
		job.setEvent(event);

		// when
		jobRepository.save(job);

		// then
		EventType newEventType = eventTypeRepository.findById(eventType.getEventName()).get();
		Assert.assertEquals(eventType.getEventName(), newEventType.getEventName());

		User newUser = userRepository.findByEmail(user.getEmail());
		Assert.assertEquals(user.getId(), newUser.getId());
		Assert.assertEquals(user.getEmail(), newUser.getEmail());

		Assert.assertNotNull(job.getJobId());
		Job newJob = jobRepository.findById(job.getJobId()).orElse(null);
		Assert.assertEquals(job.getJobId(), newJob.getJobId());
		Assert.assertEquals(job.getDuration(), newJob.getDuration());

		jobRepository.delete(newJob);
		userRepository.delete(newUser);
		eventRepository.delete(event);
		eventTypeRepository.delete(eventType);

	}
}