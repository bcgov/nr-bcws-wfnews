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
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

@DisallowConcurrentExecution
public class PushNotificationEventConsumerJob extends AbstractJob {

	private static final Logger logger = LoggerFactory.getLogger(PushNotificationEventConsumerJob.class);

	private static ObjectMapper mapper = new ObjectMapper();

	/** Heartbeats inside one visibility timeout. Three gives margin for a failed call. */
	static final int HEARTBEATS_FOR_EACH_TIMEOUT = 3;

	/** Floor on the period, so a small timeout cannot flood SQS. */
	static final int MINIMUM_HEARTBEAT_PERIOD_SECONDS = 30;

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
					ScheduledExecutorService heartbeat = startVisibilityHeartbeat(queueService, message);

					try {
						// handle messages
						PushNotificationList<? extends PushNotification> pushNotificationList = pushNotificationServiceV2
								.pushNearMeNotifications(message, false, factoryContext);

						// Detect a failure
						boolean failureInd = pushNotificationsForMessage(pushNotificationList);

						String result = mapper.writeValueAsString(pushNotificationList);

						context.setResult(result);

						if (failureInd) {
							throw new JobExecutionException("Failure detected in result.");
						}

						// Delete only after full success, or a partial failure gets an ACK and the
						// event is lost. A redelivery is safe: the push item insert is the gate.
						queueService.deleteMessageFromQueue(message);

						successfullyProcessedCount.getAndIncrement();
					} catch (Throwable e) {
						logger.error("Message " + message.getMessageId() + " encountered an error while processing");
						logger.error("Message stays on the queue for another attempt");
						logger.error("Error: " + e.getLocalizedMessage());
						logger.error("Stacktrace: ", e);
					} finally {
						heartbeat.shutdownNow();
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

	/** Without this, a large audience outlives the timeout and SQS redelivers mid-work. */
	private ScheduledExecutorService startVisibilityHeartbeat(QueueService queueService, Message message) {
		ScheduledExecutorService heartbeat = Executors.newSingleThreadScheduledExecutor();

		// The same value the receive call used, asked for again from now.
		int visibilityTimeoutSeconds = queueService.getVisibilityTimeoutSeconds();
		int periodSeconds = Math.max(MINIMUM_HEARTBEAT_PERIOD_SECONDS,
				visibilityTimeoutSeconds / HEARTBEATS_FOR_EACH_TIMEOUT);

		logger.debug("Visibility heartbeat every {} s, extending by {} s", periodSeconds, visibilityTimeoutSeconds);

		heartbeat.scheduleAtFixedRate(() -> {
			try {
				queueService.changeMessageVisibility(message, visibilityTimeoutSeconds);
			} catch (Throwable e) {
				logger.error("Failed to extend the visibility of message " + message.getMessageId(), e);
			}
		}, periodSeconds, periodSeconds, TimeUnit.SECONDS);

		return heartbeat;
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
