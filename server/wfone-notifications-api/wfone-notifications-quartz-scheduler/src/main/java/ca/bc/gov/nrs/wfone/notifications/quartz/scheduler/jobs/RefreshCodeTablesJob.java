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
import ca.bc.gov.nrs.wfone.service.api.v1.validation.ModelValidator;

@DisallowConcurrentExecution
public class RefreshCodeTablesJob implements Job {
    private static final Logger logger = LoggerFactory.getLogger(RefreshCodeTablesJob.class);

    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        logger.debug("execute RefreshCodeTablesJob >>");

        try {
            ModelValidator modelValidator = getService(context);
            if (modelValidator != null) {
                modelValidator.refreshCodeTables();
                context.setResult("Refreshed Code Tables Successfully");
            } else {
                logger.warn("ModelValidator not found in scheduler context");
            }

        } catch (Throwable e) {
            logger.error("Error executing RefreshCodeTablesJob", e);
            throw new JobExecutionException(e.getMessage(), e);
        }

        logger.debug("<< execute RefreshCodeTablesJob");
    }

    ModelValidator getService(JobExecutionContext context) throws JobExecutionException {
        logger.debug("getService ModelValidator >>");
        ModelValidator result;

        try {
            Scheduler scheduler = context.getScheduler();
            if (scheduler == null) {
                throw new IllegalStateException("scheduler cannot be null");
            }

            SchedulerContext schedulerContext = scheduler.getContext();
            if (schedulerContext == null) {
                throw new IllegalStateException("schedulerContext cannot be null");
            }

            Object object = schedulerContext.get(SchedulerConstants.MODEL_VALIDATOR_CONTEXT_KEY);
            if (object == null) {
                throw new IllegalStateException(SchedulerConstants.MODEL_VALIDATOR_CONTEXT_KEY + " in schedulerContext cannot be null");
            }

            result = (ModelValidator) object;
        } catch (SchedulerException e) {
            throw new JobExecutionException(e.getMessage(), e);
        }

        logger.debug("<< getService ModelValidator " + result);
        return result;
    }
}
