package ca.bc.gov.nrs.wfone.notification.push.quartz.scheduler.jobs;

import ca.bc.gov.nrs.wfone.common.service.api.model.factory.FactoryContext;
import ca.bc.gov.nrs.wfone.notification.push.aws.client.QueueService;
import ca.bc.gov.nrs.wfone.notification.push.model.v1.PushEventType;
import ca.bc.gov.nrs.wfone.notification.push.model.v1.PushNotification;
import ca.bc.gov.nrs.wfone.notification.push.model.v1.PushNotificationList;
import ca.bc.gov.nrs.wfone.notification.push.quartz.scheduler.SchedulerConstants;
import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.WildfirePushNotificationServiceV2;
import com.amazonaws.services.sqs.model.Message;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.quartz.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@DisallowConcurrentExecution
public class PushNotificationEventConsumerJob extends AbstractJob {

	private static final Logger logger = LoggerFactory.getLogger(PushNotificationEventConsumerJob.class);

	private static ObjectMapper mapper = new ObjectMapper();

	@Override
	public void execute(JobExecutionContext context) throws JobExecutionException {
		logger.debug("<execute");

		try {
			QueueService queueService = getQueueService(context);
			WildfirePushNotificationServiceV2 pushNotificationServiceV2 = getPushService(context);

			FactoryContext factoryContext = new FactoryContext() {
				// do nothing
			};

			while (true) {
				AtomicInteger successfullyProcessedCount = new AtomicInteger(0);
				List<Message> processedMessages = queueService.readMessages();

				if (processedMessages.isEmpty()) {
					break;
				}

				for (Message message : processedMessages) {
					try {
						// handle messages
						PushNotificationList<? extends PushNotification> pushNotificationList = pushNotificationServiceV2
								.pushNearMeNotifications(message, false, factoryContext);

						// Detect a failure
						boolean failureInd = pushNotificationsForMessage(pushNotificationList);

						String result = mapper.writeValueAsString(pushNotificationList);

						context.setResult(result);

						// delete message once handle successfully
						queueService.deleteMessageFromQueue(message);

						if (failureInd) {
							throw new JobExecutionException("Failure detected in result.");
						}

						successfullyProcessedCount.getAndIncrement();
					} catch (Throwable e) {
						logger.error("Message " + message.getMessageId() + " encountered an error while processing");
						logger.error("Error: " + e.getLocalizedMessage());
						logger.error("Stacktrace: " + e.getStackTrace());
					}
				}

				if (processedMessages.size() == 0) {
					logger.debug("No messages to process");
				} else if (successfullyProcessedCount.get() == 0 && processedMessages.size() > 0) {
					logger.info("All {} messages failed to process");
				} else {
					logger.info("Successfully processed {} of {} messages", successfullyProcessedCount.get(),
							processedMessages.size());
				}
			}

		} catch (Throwable e) {
			throw new JobExecutionException(e.getMessage(), e);
		}

		logger.debug(">execute");
	}

	private boolean pushNotificationsForMessage(PushNotificationList<? extends PushNotification> pushNotificationList) {
		boolean failureInd = false;
		for (PushNotification pushNotification : pushNotificationList.getCollection()) {
			if (PushEventType.Failure.equals(pushNotification.getPushEventType())) {
				failureInd = true;
			}
		}
		return failureInd;
	}

	private QueueService getQueueService(JobExecutionContext context) throws JobExecutionException {
		return this.getFromSchedulerContext(context, SchedulerConstants.AMAZON_SQS_QUEUE_SERVICE_KEY,
				QueueService.class);
	}

	private WildfirePushNotificationServiceV2 getPushService(JobExecutionContext context) throws JobExecutionException {
		return this.getFromSchedulerContext(context, SchedulerConstants.SERVICE_API_V2_CONTEXT_KEY,
				WildfirePushNotificationServiceV2.class);
	}

}
