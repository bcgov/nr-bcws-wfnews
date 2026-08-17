package ca.bc.gov.nrs.wfone.notification.push.quartz.scheduler.jobs;

import ca.bc.gov.nrs.wfone.notification.push.quartz.scheduler.SchedulerConstants;
import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.WildfirePushNotificationServiceV2;
import org.quartz.DisallowConcurrentExecution;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** All four push workers run this. SKIP LOCKED in the delete keeps them out of each other's way. */
@DisallowConcurrentExecution
public class ExpiredPushItemDeleteJob extends AbstractJob {

	private static final Logger logger = LoggerFactory.getLogger(ExpiredPushItemDeleteJob.class);

	/** Rows deleted in one statement. Keeps the lock short. */
	static final int DELETE_ROWS_PER_PASS = 10000;

	@Override
	public void execute(JobExecutionContext context) throws JobExecutionException {
		logger.debug("<execute");

		try {
			WildfirePushNotificationServiceV2 pushNotificationServiceV2 = getPushService(context);

			int deleted = pushNotificationServiceV2.deleteExpiredPushItems(DELETE_ROWS_PER_PASS);

			logger.info("Deleted {} expired notification push items", deleted);
		} catch (Throwable e) {
			logger.error("Failed to execute the expired notification push item delete job", e);
			throw new JobExecutionException(e.getMessage(), e);
		}

		logger.debug(">execute");
	}

	private WildfirePushNotificationServiceV2 getPushService(JobExecutionContext context) throws JobExecutionException {
		return this.getFromSchedulerContext(context, SchedulerConstants.SERVICE_API_V2_CONTEXT_KEY,
				WildfirePushNotificationServiceV2.class);
	}

}
