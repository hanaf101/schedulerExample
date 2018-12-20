package com.scheduler.sample.service;

import java.util.List;

import com.scheduler.sample.controller.dto.JobDetails;
import com.scheduler.sample.controller.dto.ScheduleRequest;
import com.scheduler.sample.controller.dto.StatusResponse;
import com.scheduler.sample.model.Job;


public interface JobsService {

    List<Job> listAll();

    Job getById(Long id);

    Job saveOrUpdate(Job job);

    void delete(Long id);
    
    StatusResponse addJob(ScheduleRequest scheduleRequest) throws Exception;
    
    public StatusResponse  pauseJob(long jobId, String jobName, long userId);
    
    public void  disableJobExecution(long jobId, String jobName);
    
    public StatusResponse  resumeJob(long jobId, String jobName, long userId);
     
    public StatusResponse deleteJob(long jobId, String jobName, long userId);
    
    public List<JobDetails> getJobDetailsList(List<Job> jobs);
    
    public StatusResponse executeJob(long jobId, String jobName);

	StatusResponse rescheduleJob(long jobId, String jobName, int duration, long userId);

}
