
package com.scheduler.sample.controller;

import java.util.List;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.scheduler.sample.controller.dto.JobDetails;
import com.scheduler.sample.controller.dto.ScheduleRequest;
import com.scheduler.sample.controller.dto.StatusResponse;
import com.scheduler.sample.job.BaseJob;
import com.scheduler.sample.model.Job;
import com.scheduler.sample.repository.UserRepository;
import com.scheduler.sample.service.JobsService;
import com.scheduler.sample.utils.ServiceUtils;

@RestController
@RequestMapping(value = "/api")
public class JobController {

	@Autowired 
	private JobsService jobsService;
	
	@Autowired
	private UserRepository userRepository;
	
/**
 * Create a new job, User should have administrator role
 * @param scheduleRequest
 * @return ResponseEntity
 * @throws Exception
 */
	@RequestMapping(value = "/job", produces = { "application/json" }, consumes = {
			"application/json" }, method = RequestMethod.POST)
	public ResponseEntity<StatusResponse> addNewJob(@RequestBody ScheduleRequest scheduleRequest) throws Exception {
		StatusResponse statusResponse = new StatusResponse();
		
		
		scheduleRequest.setCreatedBy(this.getUserId());
		statusResponse = jobsService.addJob(scheduleRequest);
		return new ResponseEntity<>(statusResponse,HttpStatus.OK);
	}

	/**
	 * Modify an existing job(start/stop/reschedule)
	 * @param scheduleRequest
	 * @return ResponseEntity
	 * @throws Exception
	 */
	
	@RequestMapping(value = "/job", produces = { "application/json" }, consumes = {
	"application/json" }, method = RequestMethod.PUT)
	public ResponseEntity<StatusResponse> modifyJob(@RequestBody ScheduleRequest scheduleRequest) throws Exception {
		StatusResponse statusResponse = new StatusResponse();
		switch(scheduleRequest.getAction()) {
		case "stop": 
			statusResponse = jobsService.pauseJob(scheduleRequest.getJobId(), scheduleRequest.getJobName(), this.getUserId());
			break;
		case "start": 
			statusResponse = jobsService.resumeJob(scheduleRequest.getJobId(), scheduleRequest.getJobName(), this.getUserId());
			break;	
		case "reschedule":
			statusResponse = jobsService.rescheduleJob(scheduleRequest.getJobId(), scheduleRequest.getJobName(), scheduleRequest.getDuration(), this.getUserId());
		}
		return new ResponseEntity<>(statusResponse,HttpStatus.OK);	
	}

	/**
	 * Delete an
	 * @param JobId
	 * @param jobName
	 * @return ResponseEntity
	 * @throws Exception
	 */
	@RequestMapping(value = "/job", produces = { "application/json" }, consumes = {
	"application/json" }, method = RequestMethod.DELETE)
	public ResponseEntity<StatusResponse> deletejob(@RequestParam(value = "jobId") long jobId,
			@RequestParam(value = "jobName") String jobName) throws Exception {
		StatusResponse statusResponse = jobsService.deleteJob(jobId, jobName, this.getUserId());
		return new ResponseEntity<>(statusResponse, HttpStatus.OK);
	}
	
	/**
	 * List down all jobs
	 * @return
	 */

	@GetMapping(value = "/job")
	public ResponseEntity<List<JobDetails>> queryjob() {
		StatusResponse statusResponse =  new StatusResponse();
		List <Job> jobList = jobsService.listAll();
		List<JobDetails> jobDetailsList = jobsService.getJobDetailsList(jobList);
		statusResponse.setStatus("SUCCESS");
		statusResponse.setDescription(ServiceUtils.getStringfromObject(jobList.toString()));
		return new ResponseEntity<>(jobDetailsList, HttpStatus.OK);
	}
	
	/**
	 * To trigger a job through API
	 * @param jobId
	 * @param jobName
	 * @return
	 */

	@GetMapping(value = "/triggerJob")
	public ResponseEntity<StatusResponse> triggerJob(@RequestParam(value = "jobId") long jobId,
			@RequestParam(value = "jobName") String jobName) {
		StatusResponse statusResponse =  new StatusResponse();
		statusResponse = jobsService.executeJob(jobId, jobName);
		return new ResponseEntity<>(statusResponse, HttpStatus.OK);
	}
	
	
	public static BaseJob getClass(String classname) throws Exception {
		Class<?> class1 = Class.forName(classname);
		return (BaseJob) class1.newInstance();
	}
	
	private int  getUserId() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		int userId = userRepository.findByEmail(auth.getName()).getId();
		return userId;
		
	}


}