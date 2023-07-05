package ca.bc.gov.nrs.wfone.notifications.quartz.scheduler.jobs;

import java.util.List;

import org.quartz.DisallowConcurrentExecution;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.quartz.Scheduler;
import org.quartz.SchedulerContext;
import org.quartz.SchedulerException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.nrs.wfim.api.rest.v1.resource.PublicReportOfFireResource;
import ca.bc.gov.nrs.wfone.common.service.api.model.factory.FactoryContext;
import ca.bc.gov.nrs.wfone.notifications.quartz.scheduler.SchedulerConstants;
import ca.bc.gov.nrs.wfone.service.api.v1.RecordRoFService;

import com.fasterxml.jackson.databind.ObjectMapper;

@DisallowConcurrentExecution
public class PushToIncidentManagerJob implements Job {
  private static final Logger logger = LoggerFactory.getLogger(PushToIncidentManagerJob.class);
  private static ObjectMapper mapper = new ObjectMapper();

  @Override
  public void execute(JobExecutionContext context) throws JobExecutionException {
    logger.debug("execute PushToIncidentManagerJob >>");

    try {
      RecordRoFService recordRoFService = getService(context);
			FactoryContext factoryContext = new FactoryContext() {
				// do nothing
			};

      List<PublicReportOfFireResource> results = recordRoFService.pushCachedRoFsToIncidentManager(factoryContext);
      String result = "";
      for(PublicReportOfFireResource rof : results) {
        result += "\n" + rof.getWildfireYear() + ":" + rof.getReportOfFireNumber();
      }

			context.setResult(result);

		} catch (Throwable e) {
			throw new JobExecutionException(e.getMessage(), e);
		}

    logger.debug("<< execute PushToIncidentManagerJob");
  }

  RecordRoFService getService(JobExecutionContext context) throws JobExecutionException {
		logger.debug("getService >>");
		RecordRoFService  result;

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
				throw new IllegalStateException(SchedulerConstants.SERVICE_API_CONTEXT_KEY + " in schedulerContext cannot be null");
			}

			result = (RecordRoFService)object;
		} catch (SchedulerException e) {
			throw new JobExecutionException(e.getMessage(), e);
		}

		logger.debug("<< getService " + result);
		return result;
	}
}
