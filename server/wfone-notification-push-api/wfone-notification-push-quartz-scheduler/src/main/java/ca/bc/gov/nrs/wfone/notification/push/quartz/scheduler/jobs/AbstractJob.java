package ca.bc.gov.nrs.wfone.notification.push.quartz.scheduler.jobs;

import org.quartz.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


public abstract class AbstractJob implements Job {

	private static final Logger logger = LoggerFactory.getLogger(AbstractJob.class);

	/**
	 * Get an entry from the scheduler context.
	 * @throws JobExecutionException if there is a problem doing so.
	 */
	protected <T> T getFromSchedulerContext(JobExecutionContext context, String key, Class<T> clazz)
			throws JobExecutionException {
		logger.debug("<getFromSchedulerContext " + key);
		T result;

		try {
			Scheduler scheduler = context.getScheduler();
			if (scheduler == null) {
				throw new IllegalStateException("scheduler cannot be null");
			}

			SchedulerContext schedulerContext = scheduler.getContext();
			if (schedulerContext == null) {
				throw new IllegalStateException("schedulerContext cannot be null");
			}

			Object object = schedulerContext.get(key);
			if (object == null) {
				throw new IllegalStateException(key + " in schedulerContext cannot be null");
			}

			result = clazz.cast(object);

		} catch (SchedulerException e) {
			throw new JobExecutionException(e.getMessage(), e);
		}

		logger.debug(">getFromSchedulerContext " + result);
		return result;
	}

}
