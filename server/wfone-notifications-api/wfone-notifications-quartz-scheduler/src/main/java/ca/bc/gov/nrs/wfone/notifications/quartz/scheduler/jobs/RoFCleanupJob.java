package ca.bc.gov.nrs.wfone.notifications.quartz.scheduler.jobs;

import org.quartz.DisallowConcurrentExecution;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.quartz.Scheduler;
import org.quartz.SchedulerContext;
import org.quartz.SchedulerException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.nrs.wfone.notifications.quartz.scheduler.SchedulerConstants;
import ca.bc.gov.nrs.wfone.service.api.v1.RecordRoFService;

@DisallowConcurrentExecution
public class RoFCleanupJob implements Job {
  private static final Logger logger = LoggerFactory.getLogger(RoFCleanupJob.class);

  @Override
  public void execute(JobExecutionContext context) throws JobExecutionException {
    logger.debug("execute RoFCleanupJob >>");

    try {
      RecordRoFService recordRoFService = getService(context);
      recordRoFService.cleanupOldRoFs();
    } catch (Throwable e) {
      logger.error("Failed to execute cleanup job", e);
      throw new JobExecutionException(e.getMessage(), e);
    }

    logger.debug("<< execute RoFCleanupJob");
  }

  RecordRoFService getService(JobExecutionContext context) throws JobExecutionException {
    RecordRoFService result;

    try {
      Scheduler scheduler = context.getScheduler();
      if (scheduler == null) {
        throw new IllegalStateException("scheduler cannot be null");
      }

      SchedulerContext schedulerContext = scheduler.getContext();
      if (schedulerContext == null) {
        throw new IllegalStateException("schedulerContext cannot be null");
      }

      Object object = schedulerContext.get(SchedulerConstants.SERVICE_API_CONTEXT_KEY);
      if (object == null) {
        throw new IllegalStateException(
            SchedulerConstants.SERVICE_API_CONTEXT_KEY + " in schedulerContext cannot be null");
      }

      result = (RecordRoFService) object;
    } catch (SchedulerException e) {
      throw new JobExecutionException(e.getMessage(), e);
    }

    return result;
  }
}
