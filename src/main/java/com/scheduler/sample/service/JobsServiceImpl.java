
package com.scheduler.sample.service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.quartz.JobKey;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.SimpleScheduleBuilder;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.quartz.TriggerKey;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.scheduler.sample.controller.dto.JobDetails;
import com.scheduler.sample.controller.dto.ScheduleRequest;
import com.scheduler.sample.controller.dto.StatusResponse;
import com.scheduler.sample.job.DownloadJob;
import com.scheduler.sample.model.Event;
import com.scheduler.sample.model.Job;
import com.scheduler.sample.model.User;
import com.scheduler.sample.repository.EventRepository;
import com.scheduler.sample.repository.JobsRepository;
import com.scheduler.sample.repository.UserRepository;

@Service
public class JobsServiceImpl implements JobsService {

	@Autowired
	private JobsRepository jobsRepository;

	@Autowired
	private Scheduler scheduler;
	
	@Autowired 
	private EventRepository eventRepository;
	
	@Autowired
	private UserRepository userRepository;

	@Autowired
	public JobsServiceImpl(JobsRepository jobsRepository) {
		this.jobsRepository = jobsRepository;
	}

	@Override
	public List<Job> listAll() {
		List<Job> jobs = new ArrayList<>();
		jobsRepository.findAll().forEach(jobs::add); 
		return jobs;
	}

	@Override
	public Job getById(Long id) {
		return jobsRepository.findById(id).orElse(null);
	}

	@Override
	public Job saveOrUpdate(Job job) {
		jobsRepository.save(job);
		return job;
	}

	@Override
	public void delete(Long id) {
		jobsRepository.deleteById(id);

	}

	@Override
	public StatusResponse addJob(ScheduleRequest scheduleRequest) throws Exception {

		StatusResponse statusResponse = new StatusResponse();
		Job job = new Job();
		job.setJobId(scheduleRequest.getJobId());
		job.setName(scheduleRequest.getJobName());
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		job.setCreatedAt(timestamp);
		
		User user = userRepository.getOne(scheduleRequest.getCreatedBy());
		job.setUser(user);
		Event event = eventRepository.findByEventId(scheduleRequest.getEventId());
		job.setEvent(event);
		job.setPriority(scheduleRequest.getPriority());
		job.setJobType(scheduleRequest.getJobType());
		job.setRecurring(scheduleRequest.isRecurring());
		job.setDuration(scheduleRequest.getDuration());
		/*	String jobId = scheduleRequest.getJobId() + "";
		Event event = eventRepository.getOne(Long.parseLong(String.valueOf(scheduleRequest.getEventId())));
		if (event.getEventName().equals("FILE_DOWNLOAD")) {
			jobDetail = JobBuilder.newJob(DownloadJob.class).storeDurably(false)
					.withIdentity(jobId, scheduleRequest.getJobName()).build();
		} else {
			jobDetail = JobBuilder.newJob(DownloadJob.class).storeDurably(false)
					.withIdentity(jobId, scheduleRequest.getJobName()).build();
		}
		Trigger trigger;
		trigger = TriggerBuilder.newTrigger().withIdentity(jobId).startNow()
				.withSchedule(SimpleScheduleBuilder.simpleSchedule().withIntervalInSeconds(scheduleRequest.getDuration()).repeatForever()
						.withMisfireHandlingInstructionFireNow())
				.build();
		try {
			scheduler.scheduleJob(jobDetail, trigger);
			if(scheduleRequest.getJobType().equals("EVENT_JOB") || !scheduleRequest.isRecurring()) {
				// Pausing execution if the job is event based 
				scheduler.pauseJob(JobKey.jobKey(String.valueOf(scheduleRequest.getJobId()), scheduleRequest.getJobName()));
			}
			
		} catch (SchedulerException e) {
			job.setState("ERROR");
			this.saveOrUpdate(job);
			statusResponse.setStatus("ERROR");
			statusResponse.setDescription("Failed to start Job");
			return statusResponse;

		}*/
		job.setState("OFF");
		this.saveOrUpdate(job);
		statusResponse.setStatus("SUCCESS");
		statusResponse.setDescription("Job Added Successfully");
		
		return statusResponse;
	}

	@Override
	public StatusResponse pauseJob(long jobId, String jobName,  long userId) {
		StatusResponse statusResponse = new StatusResponse();
		Job currentStatus = this.getJobDetails(jobId);
		String sJobId = "" + jobId;
		currentStatus.setTimeOfExecution(new Timestamp(System.currentTimeMillis()));
		
		try {
			JobKey jobKey = new JobKey(sJobId, jobName);
			TriggerKey triggerKey = new TriggerKey(sJobId, jobName);
			scheduler.pauseJob(jobKey);
			scheduler.interrupt(jobKey);
		    scheduler.unscheduleJob(triggerKey);
		    scheduler.deleteJob(jobKey);
		} catch (SchedulerException e) {
			statusResponse.setStatus("FAILED");
			statusResponse.setDescription("Failed to pause Job");
			System.out.println("deleted :  " + e.getMessage());
			currentStatus.setState("ERROR");
			this.saveOrUpdate(currentStatus);
			return statusResponse;
		}
		statusResponse.setStatus("SUCCESS");
		statusResponse.setDescription("Job paused successfully");
		currentStatus.setState("OFF");
		this.saveOrUpdate(currentStatus);
		return statusResponse;
	}

	@Override
	public StatusResponse resumeJob(long jobId, String jobName, long userId) {
		StatusResponse statusResponse = new StatusResponse();	
		Job currentStatus = this.getJobDetails(jobId);
		JobDetail jobDetail = null;
		currentStatus.setTimeOfExecution(new Timestamp(System.currentTimeMillis()));
		String sJobId = "" + jobId;
		JobKey jobKey = new JobKey(sJobId, jobName);
		TriggerKey triggerKey = new TriggerKey(sJobId, jobName);
		
		try {
			if (scheduler.checkExists(jobKey)){
				scheduler.pauseJob(jobKey);
				scheduler.interrupt(jobKey);
			    scheduler.unscheduleJob(triggerKey);
			    scheduler.deleteJob(jobKey);
			}
			
			/*
			 * dynamically determining which job to execute based on event type
			 */
			Event event = eventRepository.findByEventId(Long.parseLong(String.valueOf(currentStatus.getEvent().getEventId())));
			if (event.getEventType().getEventName().equals("FILE_DOWNLOAD")) {
				jobDetail = JobBuilder.newJob(DownloadJob.class).storeDurably(false)
						.withIdentity(sJobId, jobName).build();
			} else {
				jobDetail = JobBuilder.newJob(DownloadJob.class).storeDurably(false)
						.withIdentity(sJobId, jobName).build();
			}

			Trigger trigger;
			trigger = TriggerBuilder.newTrigger().withIdentity(sJobId).startNow()
					.withSchedule(SimpleScheduleBuilder.simpleSchedule().withIntervalInSeconds(currentStatus.getDuration()).repeatForever()
							.withMisfireHandlingInstructionFireNow())
					.build();
			System.out.println("Started job Successfully");
			scheduler.scheduleJob(jobDetail, trigger);
			statusResponse.setStatus("SUCCESS");
			statusResponse.setDescription("Job started successfully");
			currentStatus.setState("ON");
			jobsRepository.save(currentStatus);
		} catch (SchedulerException e) {
			System.out.println(e.getMessage() + ":   error message\n");
			statusResponse.setStatus("FAILED");
			statusResponse.setDescription("Failed to resume Job");
			currentStatus.setState("ERROR");
			this.saveOrUpdate(currentStatus);
		}

		return statusResponse;
	}

	@Override
	public StatusResponse rescheduleJob(long jobId, String jobName, int duration, long userId) {

		StatusResponse statusResponse = new StatusResponse();
        String sJobId = "" + jobId;
		
		Job currentStatus = this.getJobDetails(jobId);
		currentStatus.setTimeOfExecution(new Timestamp(System.currentTimeMillis()));

		try {
			TriggerKey triggerKey = TriggerKey.triggerKey(sJobId, jobName);

			Trigger trigger;
			trigger = TriggerBuilder.newTrigger().withIdentity(sJobId).startNow()
					.withSchedule(SimpleScheduleBuilder.simpleSchedule().withIntervalInSeconds(duration).repeatForever()
							.withMisfireHandlingInstructionFireNow())
					.build();
			scheduler.rescheduleJob(triggerKey, trigger);
		} catch (SchedulerException e) {
			statusResponse.setStatus("ERROR");
			statusResponse.setDescription("Failed to reschedule Job");
			currentStatus.setState("ERROR");
			this.saveOrUpdate(currentStatus);
			return statusResponse;
		}
		statusResponse.setStatus("SUCCESS");
		statusResponse.setDescription("Job rescheduled successfully");
		System.out.println("new job : " + duration);
		currentStatus.setDuration(duration);
		currentStatus.setState("ON");
		this.saveOrUpdate(currentStatus);
		return statusResponse;
	}

	@Override
	public StatusResponse deleteJob(long jobId, String jobName, long userId) {
		String sJobId = ""+ jobId;
		StatusResponse statusResponse = new StatusResponse();
		Job currentStatus = this.getJobDetails(jobId);
		currentStatus.setTimeOfExecution(new Timestamp(System.currentTimeMillis()));
		JobKey jobKey = new JobKey(sJobId, jobName);
		TriggerKey triggerKey = new TriggerKey(sJobId, jobName);
		
		try {
			scheduler.pauseJob(jobKey);
			scheduler.interrupt(jobKey);
		    scheduler.unscheduleJob(triggerKey);
		    scheduler.deleteJob(jobKey);
		} catch (SchedulerException e) {
			statusResponse.setStatus("ERROR");
			statusResponse.setDescription("Couldnt delete Job");
			currentStatus.setState("ERROR");
			this.saveOrUpdate(currentStatus);
			e.printStackTrace();
		}
		statusResponse.setStatus("SUCCESS");
		statusResponse.setDescription("Job deleted successfully");
		currentStatus.setState("DELETE");
		this.delete(jobId);
		return statusResponse;
	}
	
	public List<JobDetails> getJobDetailsList(List<Job> jobs) {
		List<JobDetails> jobDetailsList  = new ArrayList<JobDetails>();
		for(Job job : jobs) {
			JobDetails jobDetail = new JobDetails();
			jobDetail.setJobId(job.getJobId());
			jobDetail.setJobName(job.getName());
			Event event = eventRepository.findByEventId(job.getEvent().getEventId());
			jobDetail.setEventType(event.getEventType().getEventType());
			jobDetail.setLastExecutedAt(job.getLastExecutedAt());
			jobDetail.setLastExecutionStatus(job.getLastExecutionStatus());
			jobDetail.setTimeOfExecution(job.getTimeOfExecution());
			jobDetail.setRecurring(job.isRecurring());
			jobDetail.setDuration(job.getDuration());
			jobDetail.setState(job.getState());
			jobDetail.setJobType(job.getJobType());
			jobDetailsList.add(jobDetail);
		}
		return jobDetailsList;
	}
	
	private Job getJobDetails(long jobClassName) {
		Optional<Job> opJob = null;
		Job currentJob = null;

		opJob = jobsRepository.findById(jobClassName);
		
		if(opJob.isPresent()) {
			currentJob = opJob.get();
		}
		return currentJob;
		
		
	}

	@Override
	public StatusResponse executeJob(long jobId, String jobName) {
		StatusResponse statusResponse =  new StatusResponse();
		String sJobId = ""+ jobId;
		
		JobKey jobKey = new JobKey(sJobId, jobName);
		try {
			scheduler.triggerJob(jobKey);
			statusResponse.setStatus("SUCCESS");
			statusResponse.setDescription("Job execution Initiated");
			
		} catch (SchedulerException e) {
			statusResponse.setStatus("ERROR");
			statusResponse.setDescription("Job execution Failed");
			e.printStackTrace();
		}
		
		return statusResponse;
	}

	@Override
	public void disableJobExecution(long jobId, String jobName) {
		
		String sJobId = ""+ jobId;
		try {
			scheduler.deleteJob(JobKey.jobKey(sJobId, jobName));
		} catch (SchedulerException e) {
			e.printStackTrace();
		}
	}

}

