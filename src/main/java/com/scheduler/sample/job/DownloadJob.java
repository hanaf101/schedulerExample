package com.scheduler.sample.job;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.sql.Timestamp;
import java.util.Optional;

import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.beans.factory.annotation.Autowired;

import com.scheduler.sample.model.Event;
import com.scheduler.sample.model.Job;
import com.scheduler.sample.repository.EventRepository;
import com.scheduler.sample.repository.JobsRepository;
import com.scheduler.sample.service.JobsService;

/**
 * 
 * @author Mohammed Hanaf
 * Executes download job. URL of the file to be downloaded is stored in field, execution String
 *
 */
public class DownloadJob implements BaseJob {

	@Autowired
	JobsRepository jobsRepository;
	
	@Autowired
	JobsService jobsService;

	@Autowired
	EventRepository eventRepository;

	@Override
	public void execute(JobExecutionContext context) throws JobExecutionException { 
		System.out.println(context.getJobDetail().getKey().getName() + "\ngetting executed\n");
		Optional<Job> opJob = null;
		Job currentJob = null;
		Event event = null;
		System.out.println(context.getJobDetail().getKey().getName() +  ":  job entry");
		opJob = jobsRepository.findById(Long.parseLong(context.getJobDetail().getKey().getName().toString()));
		
		if (!opJob.isPresent()) {

		} else {
			currentJob = opJob.get();
			currentJob.setLastExecutedAt(new Timestamp(System.currentTimeMillis()));
			event = eventRepository.findByEventId(Long.parseLong(String.valueOf(opJob.get().getEvent().getEventId())));
			String fileURL = event.getExecutionString();
			String fileName = event.getAdditionalProperty();
			InputStream in;
			try {
				in = new URL(fileURL).openStream();
				Files.copy(in, Paths.get(fileName), StandardCopyOption.REPLACE_EXISTING);
				currentJob.setLastExecutionStatus("SUCCESS");
			} catch (IOException e) {
				currentJob.setLastExecutionStatus("FAILS");	
				e.printStackTrace();
				System.out.println("exception :  " + e.getMessage());
			} finally {
				if(!currentJob.isRecurring()) {
					//Disables the job  if the job has to be executed just once (non- recurring)
					jobsService.disableJobExecution(currentJob.getJobId(), currentJob.getName());
					currentJob.setState("OFF");
				}
				jobsRepository.save(currentJob);	
			}
		}
	}

}
