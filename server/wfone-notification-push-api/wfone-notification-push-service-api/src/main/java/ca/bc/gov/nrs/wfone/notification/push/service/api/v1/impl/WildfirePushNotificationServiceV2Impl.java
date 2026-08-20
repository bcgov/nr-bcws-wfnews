package ca.bc.gov.nrs.wfone.notification.push.service.api.v1.impl;

import ca.bc.gov.nrs.wfone.common.persistence.dao.DaoException;
import ca.bc.gov.nrs.wfone.common.service.api.ServiceException;
import ca.bc.gov.nrs.wfone.common.service.api.model.factory.FactoryContext;
import ca.bc.gov.nrs.wfone.notification.push.model.v1.PushNotification;
import ca.bc.gov.nrs.wfone.notification.push.model.v1.PushNotificationList;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dao.NotificationPushItemDao;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dao.NotificationSettingsDao;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dto.NotificationDto;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.type.NotificationTopics;
import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.WildfirePushNotificationServiceV2;
import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.exception.InvalidNotificationTokenException;
import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.metrics.EmfMetrics;
import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.model.MessageInformation;
import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.model.TwitterInformation;
import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.model.factory.PushNotificationFactory;
import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.monitor.handler.MonitorHandler;
import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.Geometry;
import com.amazonaws.services.sqs.model.Message;
import com.amazonaws.services.sqs.model.MessageAttributeValue;
import com.google.common.annotations.VisibleForTesting;
import com.google.common.util.concurrent.RateLimiter;
import com.google.firebase.messaging.BatchResponse;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.MessagingErrorCode;
import com.google.firebase.messaging.Notification;
import com.google.firebase.messaging.SendResponse;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.text.SimpleDateFormat;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

public class WildfirePushNotificationServiceV2Impl implements WildfirePushNotificationServiceV2 {

	private static final Logger logger = LoggerFactory.getLogger(WildfirePushNotificationServiceV2Impl.class);
	private static final String MONITOR_ATTRIBUTE = "monitorType";
	private static final String NO_SUCH_INFORMATION_FROM_SQS_MESSAGE = "no such information from sqs message";

	private static final String SQS_SENT_TIMESTAMP_ATTRIBUTE = "SentTimestamp";

	/** Bounds one run of the delete job. The next run continues where this one stopped. */
	private static final int MAX_DELETE_PASSES = 1000;

	/** FCM accepts at most 500 messages in one sendEach call. */
	private static final int FCM_BATCH_SIZE = 500;

	/** Attempts for one batch, when FCM reports an error that can pass. */
	private static final int MAX_SEND_ATTEMPTS = 3;

	/** Capped: one entry for each recipient is an out of memory error at a large audience. */
	private static final int MAX_RESULT_ENTRIES = 1000;

	/** FCM error codes that mean the device token is dead. Do not try these again. */
	private static final Set<MessagingErrorCode> DEAD_TOKEN_ERRORS = Collections.unmodifiableSet(
			EnumSet.of(MessagingErrorCode.UNREGISTERED, MessagingErrorCode.INVALID_ARGUMENT,
					MessagingErrorCode.SENDER_ID_MISMATCH));

	private Map<String, Integer> expirations = new HashMap<>();

	private String pushNotificationPrefix;

	private MonitorHandler spatialMonitorHandler;
	private NotificationSettingsDao notificationSettingsDao;
	private NotificationPushItemDao notificationPushItemDao;
	private PushNotificationFactory pushNotificationFactory;

	private PlatformTransactionManager transactionManager;
	private FirebaseMessaging firebaseMessaging;

	/** Rows read from the spatial query in one page. */
	private int audiencePageSize = 1000;

	/** Pages sent at the same time. */
	private int sendThreadCount = 4;

	/** Messages given to FCM in one second. Zero or less removes the limit. */
	private double fcmPermitsPerSecond = 0;

	/** One FCM message for one subscriber, and every push item that the message covers. */
	static class SubscriberSend {
		NotificationDto nearest;
		final List<String> pushItemGuids = new ArrayList<>(1);
		String body;
		com.google.firebase.messaging.Message message;

		SubscriberSend(NotificationDto nearest) {
			this.nearest = nearest;
		}
	}

	private static class ProcessingCount {
		final AtomicLong toProcess = new AtomicLong();
		final AtomicLong processed = new AtomicLong();
		/** Rows written by materialiseAudience. */
		final AtomicLong materialised = new AtomicLong();
		final AtomicLong ignored = new AtomicLong();
		final AtomicLong failed = new AtomicLong();
		/** FCM messages sent. One message can cover more than one saved location. */
		final AtomicLong messages = new AtomicLong();
	}

	private static final Map<String, Integer> TOPIC_EXPIRATION_DEFAULTS;

	static {
		Map<String, Integer> result = new HashMap<>();
		result.put(NotificationTopics.BRITISH_COLUMBIA_BANS_AND_PROHIBITION_AREAS, 720);
		result.put(NotificationTopics.EVACUATION_ORDERS_AND_ALERTS, 24);
		result.put(NotificationTopics.BRITISH_COLUMBIA_AREA_RESTRICTIONS, 72);
		result.put(NotificationTopics.BCWF_ACTIVEFIRES_PUBLIVIEW, 48);
		TOPIC_EXPIRATION_DEFAULTS = Collections.unmodifiableMap(result);
	}

	private static final Map<String, String> TOPIC_MESSAGE_BODIES;

	static {
		Map<String, String> result = new HashMap<>();
		result.put(NotificationTopics.BRITISH_COLUMBIA_BANS_AND_PROHIBITION_AREAS,
				"There is a new fire prohibition in %s Fire Centre near your saved location %s. Tap for more info.");
		result.put(NotificationTopics.EVACUATION_ORDERS_AND_ALERTS,
				"There is a new evacuation order or alert issued by %s near your saved location %s. Tap for more info.");
		result.put(NotificationTopics.BRITISH_COLUMBIA_AREA_RESTRICTIONS,
				"There is a new area restriction for %s near your saved location %s. Tap for more info.");
		result.put(NotificationTopics.BCWF_ACTIVEFIRES_PUBLIVIEW,
				"There is a new wildfire (incident #%s) near your saved location %s. Tap for more info.");
		TOPIC_MESSAGE_BODIES = Collections.unmodifiableMap(result);
	}

	@VisibleForTesting
	Calendar now() {
		return Calendar.getInstance();
	}

	@VisibleForTesting
	BatchResponse sendEach(List<com.google.firebase.messaging.Message> messages) throws FirebaseMessagingException {
		return firebaseMessaging.sendEach(messages);
	}

	private Map<String, Date> getExpirations() {
		Map<String, Date> result = new HashMap<>();

		TOPIC_EXPIRATION_DEFAULTS.forEach((topic, defaultOffset) -> {
			int offset = expirations.getOrDefault(topic, defaultOffset);
			Calendar calendar = now();
			calendar.add(Calendar.HOUR, offset);

			result.put(topic, calendar.getTime());
		});

		return result;
	}

	@Override
	public PushNotificationList<? extends PushNotification> pushNearMeNotifications(Message messageFromSqs,
			boolean isTest, FactoryContext context) throws ServiceException {
		logger.info("<pushNearMeNotifications");
		logger.info("###############################################");
		logger.info("Starting Push Notification Processing for Message: " + messageFromSqs.getMessageId());
		Date jobStartedDate = new Date();
		PushNotificationList<? extends PushNotification> result;
		ProcessingCount pushRecordsCount = new ProcessingCount();
		Optional<String> eventLogging = Optional.empty();
		List<PushNotification> pushNotifications = Collections.synchronizedList(new ArrayList<PushNotification>());
		String monitorType;

		try {
			Map<String, Date> expirations = getExpirations();
			Date currentTimeStamp = new Date();

			// Extract message information
			monitorType = getMonitorType(messageFromSqs);

			MessageInformation messageInformation = spatialMonitorHandler.handleMessage(messageFromSqs);
			validate(messageInformation, monitorType, messageFromSqs.getMessageId());

			Map<String, String> eventInformation = messageInformation.getEventInformation();

			logger.info("Event Indicator: " + messageInformation.getMessageId());
			logger.info("Event Date: " + messageInformation.getMessageDate().toString());
			logger.info("Monitor Type: " + monitorType);
			logger.info("Monitor Topic: " + messageInformation.getTopic());
			logger.info("All Event Information: " + eventInformation.toString());
			logger.info("###############################################");
			eventLogging = getEventLogging(monitorType, eventInformation);

			pushMessages(isTest, context, pushRecordsCount, pushNotifications, expirations, currentTimeStamp,
					messageInformation);
		} catch (DaoException e) {
			throw new ServiceException("DAO threw an exception", e);
		}

		result = this.pushNotificationFactory.getPushNotificationList(pushNotifications, context);

		eventLogging.ifPresent(logger::info);

		logger.info(" Push near me completed :  pushRecordsToProcess = " + pushRecordsCount.toProcess.get()
				+ ". pushRecordsProcessed = " + pushRecordsCount.processed.get());

		SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		Date jobFinishedDate = new Date();
		String jobFinishedDateString = formatter.format(jobFinishedDate);
		String jobStartedDateString = formatter.format(jobStartedDate);

		long millsDiff = jobFinishedDate.getTime() - jobStartedDate.getTime();
		Duration duration = Duration.ofMillis(millsDiff);
		String formattedElapsedTime = "%d:%02d:%02d:%02d".formatted(duration.toDays(), duration.toHours() % 24,
				duration.toMinutes() % 60, (duration.toMillis() / 1000) % 60);
		logger.info(" Push near me Started " + jobStartedDateString + ".   Finished " + jobFinishedDateString
				+ ".  Duration (days:hours:min:seconds): " + formattedElapsedTime);

		reportEvent(monitorType, pushRecordsCount, millsDiff, getQueuedAtMillis(messageFromSqs));

		logger.info(">pushNearMeNotifications " + result);

		return result;
	}

	/**
	 * The worker queue is bounded and uses CallerRunsPolicy on purpose: a full queue makes
	 * the reader do the work, so it cannot run ahead of the senders and fill memory.
	 */
	private void pushMessages(boolean isTest, FactoryContext context, ProcessingCount pushRecordsCount,
			List<PushNotification> pushNotifications, Map<String, Date> expirations, Date currentTimeStamp,
			MessageInformation messageInformation) throws DaoException, ServiceException {

		logger.debug("### Starting Processing Subscriber push events");

		String eventIdentifier = messageInformation.getItemIdentifier();

		pushRecordsCount.materialised.set(materialiseAudience(messageInformation, currentTimeStamp,
				expirations.get(messageInformation.getTopic())));

		ThreadPoolExecutor executor = new ThreadPoolExecutor(sendThreadCount, sendThreadCount, 0L, TimeUnit.MILLISECONDS,
				new ArrayBlockingQueue<Runnable>(sendThreadCount), new ThreadPoolExecutor.CallerRunsPolicy());
		RateLimiter rateLimiter = fcmPermitsPerSecond > 0 ? RateLimiter.create(fcmPermitsPerSecond) : null;
		List<Future<?>> futures = new ArrayList<>();
		long pageCount = 0;

		try {
			String afterSubscriberGuid = "";
			String afterPushItemGuid = "";
			// A subscriber split over two pages would get two pushes.
			List<NotificationDto> heldBack = new ArrayList<>();

			while (true) {
				List<NotificationDto> claimed = notificationPushItemDao.claimPushItems(eventIdentifier,
						afterSubscriberGuid, afterPushItemGuid, audiencePageSize);

				if (claimed.isEmpty()) {
					break;
				}

				pageCount++;
				NotificationDto last = claimed.get(claimed.size() - 1);
				afterSubscriberGuid = last.getSubscriberGuid();
				afterPushItemGuid = last.getNotificationPushItemGuid();

				heldBack.addAll(claimed);

				int end = heldBack.size();

				if (claimed.size() == audiencePageSize) {
					// A short page is the end of the index, so nothing needs holding back.
					end = endOfCompleteSubscribers(heldBack);

					if (end == 0) {
						// One subscriber is larger than a page. Send it, or the read never advances.
						logger.warn("Subscriber {} has at least {} matched saved locations. Sending it in one page.",
								heldBack.get(0).getSubscriberGuid(), heldBack.size());
						end = heldBack.size();
					}
				}

				final List<NotificationDto> pageToSend = new ArrayList<>(heldBack.subList(0, end));
				heldBack = new ArrayList<>(heldBack.subList(end, heldBack.size()));

				futures.add(executor.submit(() -> sendPage(pageToSend, isTest, context, pushRecordsCount,
						pushNotifications, messageInformation, rateLimiter)));
			}

			if (!heldBack.isEmpty()) {
				final List<NotificationDto> lastPage = heldBack;
				futures.add(executor.submit(() -> sendPage(lastPage, isTest, context, pushRecordsCount,
						pushNotifications, messageInformation, rateLimiter)));
			}

			// A page that threw must fail the event, so it stays on the queue.
			for (Future<?> future : futures) {
				try {
					future.get();
				} catch (InterruptedException e) {
					Thread.currentThread().interrupt();
					throw new ServiceException("Interrupted while sending push notifications", e);
				} catch (ExecutionException e) {
					throw new ServiceException("A page of push notifications failed", e.getCause());
				}
			}
		} finally {
			executor.shutdown();
		}

		logger.info("Push Notification process complete.");
		logger.info("Work list rows added: " + pushRecordsCount.materialised.get());
		logger.info("Pages: " + pageCount);
		logger.info("Claimed: " + pushRecordsCount.toProcess.get());
		logger.info("Messages: " + pushRecordsCount.messages.get());
		logger.info("Succeeded: " + pushRecordsCount.processed.get());
		logger.info("Ignored: " + pushRecordsCount.ignored.get());
		logger.info("Failed: " + pushRecordsCount.failed.get());
	}

	/** Where the run of the last subscriber begins. The rows before it are whole subscribers. */
	@VisibleForTesting
	static int endOfCompleteSubscribers(List<NotificationDto> rows) {
		String lastSubscriberGuid = rows.get(rows.size() - 1).getSubscriberGuid();

		int end = rows.size();
		while (end > 0 && Objects.equals(lastSubscriberGuid, rows.get(end - 1).getSubscriberGuid())) {
			end--;
		}

		return end;
	}

	/** The rows are already marked sent. One that cannot make a message stays marked. */
	private void sendPage(List<NotificationDto> page, boolean isTest, FactoryContext context,
			ProcessingCount pushRecordsCount, List<PushNotification> pushNotifications,
			MessageInformation messageInformation, RateLimiter rateLimiter) {

		String topicKey = messageInformation.getTopic();
		String eventIdentifier = messageInformation.getItemIdentifier();

		pushRecordsCount.toProcess.addAndGet(page.size());

		List<NotificationDto> recipients = new ArrayList<>(page.size());
		for (NotificationDto notificationDto : page) {
			// The token comes from the work list row, not from a fetch for each recipient.
			if (StringUtils.isBlank(notificationDto.getNotificationToken())) {
				pushRecordsCount.ignored.incrementAndGet();
				continue;
			}

			if (notificationDto.getLatitude() == null || notificationDto.getLongitude() == null
					|| notificationDto.getRadius() == null) {
				logger.warn("Skipping Notification '{}'. Missing latitude, longitude or radius.",
						notificationDto.getNotificationGuid());
				pushRecordsCount.ignored.incrementAndGet();
				continue;
			}

			recipients.add(notificationDto);
		}

		if (recipients.isEmpty()) {
			return;
		}

		List<SubscriberSend> sends = groupBySubscriber(recipients, rankingOrigin(messageInformation.getGeometry()));

		for (SubscriberSend send : sends) {
			try {
				send.body = buildBody(isTest, topicKey, messageInformation.getMessageId(),
						send.nearest.getNotificationName());
				send.message = prepareNearMePushNotification(buildTitle(messageInformation), send.body,
						send.nearest.getNotificationToken(), buildDataMap(topicKey, messageInformation, send.nearest));
			} catch (InvalidNotificationTokenException e) {
				// The token cannot make a message. It is dead in the same way as UNREGISTERED.
				logger.warn("Invalid notification token for subscriber {}", send.nearest.getSubscriberGuid());
				pushRecordsCount.failed.addAndGet(send.pushItemGuids.size());
			}
		}

		sends.removeIf(send -> send.message == null);
		pushRecordsCount.messages.addAndGet(sends.size());

		for (int start = 0; start < sends.size(); start += FCM_BATCH_SIZE) {
			int end = Math.min(start + FCM_BATCH_SIZE, sends.size());

			sendBatch(sends.subList(start, end), messageInformation, context, pushRecordsCount, pushNotifications,
					rateLimiter);
		}
	}

	/**
	 * Collapses the saved locations of one subscriber into one push. The page is ordered by
	 * subscriber, so a run of rows is one subscriber. The nearest one of the run names the push.
	 */
	@VisibleForTesting
	static List<SubscriberSend> groupBySubscriber(List<NotificationDto> recipients, Coordinate origin) {
		List<SubscriberSend> result = new ArrayList<>();
		SubscriberSend current = null;
		double nearestDistance = 0;

		for (NotificationDto recipient : recipients) {
			double distance = rankingDistance(origin, recipient);

			if (current == null
					|| !Objects.equals(current.nearest.getSubscriberGuid(), recipient.getSubscriberGuid())) {
				current = new SubscriberSend(recipient);
				nearestDistance = distance;
				result.add(current);
			} else if (distance < nearestDistance) {
				current.nearest = recipient;
				nearestDistance = distance;
			}

			current.pushItemGuids.add(recipient.getNotificationPushItemGuid());
		}

		return result;
	}

	/**
	 * The point that the ranking measures from. A polygon returns the same distance, zero, to
	 * every saved location inside it, so the boundary cannot rank them. The centroid can.
	 */
	@VisibleForTesting
	static Coordinate rankingOrigin(Geometry eventGeometry) {
		return eventGeometry.getCentroid().getCoordinate();
	}

	/**
	 * Squared distance in degrees, with the longitude scaled for the latitude. It ranks the
	 * saved locations of one subscriber, which are near each other, so a local plane is
	 * accurate enough. It is not a distance to report.
	 */
	private static double rankingDistance(Coordinate origin, NotificationDto recipient) {
		double dx = (recipient.getLongitude() - origin.x) * Math.cos(Math.toRadians(origin.y));
		double dy = recipient.getLatitude() - origin.y;

		return dx * dx + dy * dy;
	}

	private void sendBatch(List<SubscriberSend> sends, MessageInformation messageInformation, FactoryContext context,
			ProcessingCount pushRecordsCount, List<PushNotification> pushNotifications, RateLimiter rateLimiter) {

		String topicKey = messageInformation.getTopic();
		String eventIdentifier = messageInformation.getItemIdentifier();
		String monitorType = messageInformation.getMonitorType();

		List<SubscriberSend> attempts = new ArrayList<>(sends);
		List<String> deadTokenSubscriberGuids = new ArrayList<>();

		for (int attempt = 1; attempt <= MAX_SEND_ATTEMPTS && !attempts.isEmpty(); attempt++) {
			if (rateLimiter != null) {
				rateLimiter.acquire(attempts.size());
			}

			List<com.google.firebase.messaging.Message> attemptMessages = new ArrayList<>(attempts.size());
			for (SubscriberSend send : attempts) {
				attemptMessages.add(send.message);
			}

			BatchResponse batchResponse;
			long sendStartedAt = System.currentTimeMillis();
			try {
				batchResponse = sendEach(attemptMessages);
			} catch (FirebaseMessagingException e) {
				// The whole call failed. Every message in the batch can be tried again.
				logger.error("FCM refused a batch of " + attemptMessages.size() + " messages", e);
				reportFcmBatchRefused(monitorType, attemptMessages.size(), System.currentTimeMillis() - sendStartedAt);
				sleepBeforeRetry(attempt);
				continue;
			}

			reportFcmBatchSent(monitorType, attemptMessages.size(), System.currentTimeMillis() - sendStartedAt);

			List<SubscriberSend> retries = new ArrayList<>();
			Map<MessagingErrorCode, Integer> errorCounts = new EnumMap<>(MessagingErrorCode.class);

			List<SendResponse> responses = batchResponse.getResponses();
			for (int i = 0; i < responses.size(); i++) {
				SendResponse sendResponse = responses.get(i);
				SubscriberSend send = attempts.get(i);

				if (sendResponse.isSuccessful()) {
					// One push covers every matched saved location of this subscriber.
					pushRecordsCount.processed.addAndGet(send.pushItemGuids.size());
					addResultEntry(pushNotifications, context, send.nearest, topicKey, send.body);
					continue;
				}

				MessagingErrorCode errorCode = sendResponse.getException() == null ? null
						: sendResponse.getException().getMessagingErrorCode();

				if (errorCode != null) {
					errorCounts.merge(errorCode, 1, Integer::sum);
				}

				if (errorCode != null && DEAD_TOKEN_ERRORS.contains(errorCode)) {
					// The token is gone. Leave the rows marked sent: there is nothing to try again.
					deadTokenSubscriberGuids.add(send.nearest.getSubscriberGuid());
					pushRecordsCount.failed.addAndGet(send.pushItemGuids.size());
					logger.warn("Dead device token for subscriber {}. Error code {}.", send.nearest.getSubscriberGuid(),
							errorCode);
					continue;
				}

				// UNAVAILABLE, QUOTA_EXCEEDED, INTERNAL and 429 are not dead tokens.
				retries.add(send);
			}

			reportFcmErrors(monitorType, errorCounts);

			attempts = retries;

			if (!attempts.isEmpty() && attempt < MAX_SEND_ATTEMPTS) {
				logger.info("Trying {} messages again. Attempt {} of {}.", attempts.size(), attempt + 1,
						MAX_SEND_ATTEMPTS);
				sleepBeforeRetry(attempt);
			}
		}

		clearDeviceTokens(deadTokenSubscriberGuids);

		if (!attempts.isEmpty()) {
			// Every row of the group, and not the nearest one only: one left marked sent blocks
			// the retry, and that subscriber never gets the push.
			List<String> failedGuids = new ArrayList<>();
			for (SubscriberSend send : attempts) {
				failedGuids.addAll(send.pushItemGuids);
			}

			pushRecordsCount.failed.addAndGet(failedGuids.size());
			releasePushItems(failedGuids, eventIdentifier);

			throw new IllegalStateException(
					"FCM did not accept " + attempts.size() + " messages after " + MAX_SEND_ATTEMPTS + " attempts");
		}
	}

	/** The latency is FCM's, and it is the largest part of the send. */
	private static void reportFcmBatchSent(String monitorType, int messages, long elapsedMillis) {
		EmfMetrics.forMonitorType(monitorType)
				.metric("FcmBatchMessages", EmfMetrics.COUNT, messages)
				.metric("FcmSendLatency", EmfMetrics.MILLISECONDS, elapsedMillis)
				.emit();
	}

	/** A refused call is not the same as a failed message: no message in it was even tried. */
	private static void reportFcmBatchRefused(String monitorType, int messages, long elapsedMillis) {
		EmfMetrics.forMonitorType(monitorType)
				.metric("FcmBatchRefused", EmfMetrics.COUNT, 1)
				.metric("FcmBatchRefusedMessages", EmfMetrics.COUNT, messages)
				.metric("FcmSendLatency", EmfMetrics.MILLISECONDS, elapsedMillis)
				.emit();
	}

	/** One line for each error code, so the alarm can tell a dead token from a quota. */
	private static void reportFcmErrors(String monitorType, Map<MessagingErrorCode, Integer> errorCounts) {
		errorCounts.forEach((errorCode, count) -> EmfMetrics.forMonitorType(monitorType)
				.dimension("ErrorCode", errorCode.name())
				.metric("FcmSendErrors", EmfMetrics.COUNT, count)
				.emit());
	}

	/** Latency measures from the SQS sent timestamp: an ignition date can be days earlier. */
	private static void reportEvent(String monitorType, ProcessingCount counts, long elapsedMillis,
			Long queuedAtMillis) {
		EmfMetrics metrics = EmfMetrics.forMonitorType(monitorType)
				.metric("AudienceSize", EmfMetrics.COUNT, counts.toProcess.get())
				.metric("WorkListRowsAdded", EmfMetrics.COUNT, counts.materialised.get())
				.metric("MessagesSent", EmfMetrics.COUNT, counts.messages.get())
				.metric("RecipientsSucceeded", EmfMetrics.COUNT, counts.processed.get())
				.metric("RecipientsFailed", EmfMetrics.COUNT, counts.failed.get())
				.metric("EventProcessingTime", EmfMetrics.MILLISECONDS, elapsedMillis);

		if (elapsedMillis > 0) {
			metrics.metric("RecipientsPerSecond", EmfMetrics.COUNT_PER_SECOND,
					counts.processed.get() * 1000.0 / elapsedMillis);
		}

		if (queuedAtMillis != null) {
			metrics.metric("EndToEndLatency", EmfMetrics.MILLISECONDS, System.currentTimeMillis() - queuedAtMillis);
		}

		metrics.emit();
	}

	/** Null when SQS did not give the attribute. */
	private static Long getQueuedAtMillis(Message messageFromSqs) {
		Map<String, String> attributes = messageFromSqs.getAttributes();
		String sentTimestamp = attributes == null ? null : attributes.get(SQS_SENT_TIMESTAMP_ATTRIBUTE);

		if (StringUtils.isBlank(sentTimestamp)) {
			return null;
		}

		try {
			return Long.valueOf(sentTimestamp);
		} catch (NumberFormatException e) {
			logger.warn("SQS {} was '{}', which is not a number", SQS_SENT_TIMESTAMP_ATTRIBUTE, sentTimestamp);
			return null;
		}
	}

	private Optional<String> getEventLogging(String monitorType, Map<String, String> eventInformation) {
		switch (monitorType) {
			case "active-fires":
				String fireNumber = eventInformation.getOrDefault(MessageInformation.FIRE_NUMBER,
						NO_SUCH_INFORMATION_FROM_SQS_MESSAGE);
				String fireYear = eventInformation.getOrDefault(MessageInformation.FIRE_YEAR,
						NO_SUCH_INFORMATION_FROM_SQS_MESSAGE);
				return Optional.of("Push near me notifications for active fire with fire number [%s], fire year [%s]"
						.formatted(fireNumber, fireYear));
			case "area-restrictions":
				String fireCentreName = eventInformation.getOrDefault(MessageInformation.FIRE_CENTRE_NAME,
						NO_SUCH_INFORMATION_FROM_SQS_MESSAGE);
				String fireZoneName = eventInformation.getOrDefault(MessageInformation.FIRE_ZONE_NAME,
						NO_SUCH_INFORMATION_FROM_SQS_MESSAGE);
				String name = eventInformation.getOrDefault(MessageInformation.NAME, NO_SUCH_INFORMATION_FROM_SQS_MESSAGE);
				return Optional.of(
						"Push near me notifications for area restrictions with name [%s], fire centre name [%s], fire zone name [%s]"
								.formatted(name, fireCentreName, fireZoneName));
			case "bans-prohibitions":
				String bansFireCentreName = eventInformation.getOrDefault(MessageInformation.FIRE_CENTRE_NAME,
						NO_SUCH_INFORMATION_FROM_SQS_MESSAGE);
				String bansFireZoneName = eventInformation.getOrDefault(MessageInformation.FIRE_ZONE_NAME,
						NO_SUCH_INFORMATION_FROM_SQS_MESSAGE);
				String accessProhibitionDescription = eventInformation
						.getOrDefault(MessageInformation.ACCESS_PROHIBITION_DESCRIPTION, NO_SUCH_INFORMATION_FROM_SQS_MESSAGE);
				String type = eventInformation.getOrDefault(MessageInformation.TYPE, NO_SUCH_INFORMATION_FROM_SQS_MESSAGE);
				return Optional.of(
						"Push near me notifications for bans prohibitions with fire centre name [%s], fire zone name [%s], access prohibition description [%s], type [%s]"
								.formatted(bansFireCentreName, bansFireZoneName, accessProhibitionDescription, type));
			case "evacuation-orders-alerts":
				String eventName = eventInformation.getOrDefault(MessageInformation.EVENT_NAME,
						NO_SUCH_INFORMATION_FROM_SQS_MESSAGE);
				String issuingAgency = eventInformation.getOrDefault(MessageInformation.ISSUING_AGENCY,
						NO_SUCH_INFORMATION_FROM_SQS_MESSAGE);
				return Optional
						.of("Push near me notifications for evacuation orders alerts with event name [%s], issuing agency [%s]"
								.formatted(eventName, issuingAgency));
			default:
				return Optional.empty();
		}
	}

	private static com.google.firebase.messaging.Message prepareNearMePushNotification(String title, String body,
			String token, Map<String, String> keyValueMap) throws InvalidNotificationTokenException {
		Notification.Builder builder = Notification.builder();
		builder.setBody(body);
		builder.setTitle(title);

		com.google.firebase.messaging.Message message = null;
		try {
			if (keyValueMap.isEmpty()) {
				message = com.google.firebase.messaging.Message.builder().setNotification(builder.build())
						.setToken(token).build();
			} else {
				message = com.google.firebase.messaging.Message.builder().setNotification(builder.build())
						.setToken(token).putAllData(keyValueMap).build();
			}
		} catch (IllegalArgumentException e) {
			if (e.getMessage().equals("Exactly one of token, topic or condition must be specified")) {
				throw new InvalidNotificationTokenException(e.getMessage());
			} else {
				throw e;
			}
		}

		return message;
	}

	/** One statement. It can run for a long time. */
	private int materialiseAudience(MessageInformation messageInformation, Date currentTimeStamp,
			Date expireTimestamp) {
		TransactionTemplate transactionTemplate = new TransactionTemplate(transactionManager);

		return transactionTemplate.execute(status -> {
			try {
				return notificationPushItemDao.materialiseAudience(messageInformation.getGeometry(),
						messageInformation.getTopic(), messageInformation.getItemIdentifier(), currentTimeStamp,
						expireTimestamp, null);
			} catch (DaoException e) {
				throw new IllegalStateException("Failed to materialise the audience of event "
						+ messageInformation.getItemIdentifier(), e);
			}
		});
	}

	private void releasePushItems(List<String> pushItemGuids, String eventIdentifier) {
		try {
			notificationPushItemDao.releasePushItems(pushItemGuids, eventIdentifier);
		} catch (DaoException e) {
			logger.error("Failed to release " + pushItemGuids.size() + " push items. A later delivery of event "
					+ eventIdentifier + " will not try them again.", e);
		}
	}

	private void clearDeviceTokens(List<String> subscriberGuids) {
		if (subscriberGuids.isEmpty()) {
			return;
		}

		try {
			notificationSettingsDao.clearDeviceTokens(subscriberGuids, null);
			logger.info("Cleared {} dead device tokens", subscriberGuids.size());
		} catch (DaoException e) {
			logger.error("Failed to clear " + subscriberGuids.size() + " dead device tokens", e);
		}
	}

	private static void sleepBeforeRetry(int attempt) {
		// Exponential backoff with jitter.
		long backoffMillis = (long) (Math.pow(2, attempt - 1) * 1000);
		long jitterMillis = ThreadLocalRandom.current().nextLong(250);

		try {
			Thread.sleep(backoffMillis + jitterMillis);
		} catch (InterruptedException e) {
			Thread.currentThread().interrupt();
		}
	}

	private String buildTitle(MessageInformation messageInformation) {
		String title = "New " + getIncidentType(messageInformation);

		if (StringUtils.isNotBlank(pushNotificationPrefix)) {
			title = pushNotificationPrefix + title;
		}

		return title;
	}

	private static String buildBody(boolean isTest, String topicKey, String eventMessageId, String notificationName) {
		return ((isTest) ? "TEST: " : "") + TOPIC_MESSAGE_BODIES.get(topicKey).formatted(eventMessageId, notificationName);
	}

	private static Map<String, String> buildDataMap(String topicKey, MessageInformation messageInformation,
			NotificationDto notificationDto) {
		Map<String, String> keyValueMapForPN = new HashMap<>();

		keyValueMapForPN.put("coords", "[" + notificationDto.getLatitude() + "," + notificationDto.getLongitude() + "]");
		keyValueMapForPN.put("radius", String.valueOf(notificationDto.getRadius()));
		keyValueMapForPN.put("topicKey", topicKey);
		keyValueMapForPN.put("messageID", messageInformation.getMessageId());

		return keyValueMapForPN;
	}

	/** Stops adding at the cap. The counts in the log stay complete. */
	private void addResultEntry(List<PushNotification> pushNotifications, FactoryContext context,
			NotificationDto recipient, String topicKey, String body) {
		if (pushNotifications.size() >= MAX_RESULT_ENTRIES) {
			return;
		}

		Map<String, String> pushMap = new HashMap<>();
		pushMap.put("notificationToken", recipient.getNotificationToken());
		pushMap.put("notificationGuid", recipient.getNotificationGuid());
		pushMap.put("notificationTopic", topicKey);
		pushMap.put("message", body);

		pushNotifications
				.add(this.pushNotificationFactory.getPushNotification(pushMap, recipient.getNotificationToken(), context));
	}

	/** Fails with a readable message. A missing attribute used to be a null pointer. */
	private static String getMonitorType(Message messageFromSqs) throws ServiceException {
		Map<String, MessageAttributeValue> messageAttributes = messageFromSqs.getMessageAttributes();
		MessageAttributeValue monitorAttribute = messageAttributes == null ? null
				: messageAttributes.get(MONITOR_ATTRIBUTE);
		String monitorType = monitorAttribute == null ? null : monitorAttribute.getStringValue();

		if (StringUtils.isBlank(monitorType)) {
			throw new ServiceException("SQS message " + messageFromSqs.getMessageId() + " has no " + MONITOR_ATTRIBUTE
					+ " attribute. It cannot be processed.");
		}

		return monitorType;
	}

	/** Each of these used to be a null pointer in the middle of the send loop. */
	private void validate(MessageInformation messageInformation, String monitorType, String sqsMessageId)
			throws ServiceException {
		String topic = messageInformation.getTopic();

		if (topic == null) {
			throw new ServiceException("SQS message " + sqsMessageId + " has an unknown monitor type '" + monitorType
					+ "'. It has no topic, so it cannot be processed.");
		}

		if (!TOPIC_MESSAGE_BODIES.containsKey(topic)) {
			throw new ServiceException(
					"SQS message " + sqsMessageId + " has topic '" + topic + "'. There is no message body for it.");
		}

		if (messageInformation.getMessageDate() == null) {
			throw new ServiceException("SQS message " + sqsMessageId + " has no event date.");
		}

		if (messageInformation.getGeometry() == null) {
			throw new ServiceException("SQS message " + sqsMessageId + " has no geometry. There is nothing to search.");
		}

		if (getExpirations().get(topic) == null) {
			throw new ServiceException("There is no push item expiry configured for topic '" + topic + "'.");
		}
	}

	/** Limited, so the delete takes no long lock on a table that sits on the send path. */
	@Override
	public int deleteExpiredPushItems(int rowsPerPass) throws ServiceException {
		logger.info("<deleteExpiredPushItems rowsPerPass={}", rowsPerPass);
		int totalDeleted = 0;

		try {
			for (int pass = 0; pass < MAX_DELETE_PASSES; pass++) {
				int deleted = notificationPushItemDao.deleteExpired(rowsPerPass);
				totalDeleted += deleted;

				if (deleted < rowsPerPass) {
					break;
				}
			}
		} catch (DaoException e) {
			throw new ServiceException("DAO threw an exception purging expired push items", e);
		}

		logger.info(">deleteExpiredPushItems deleted={}", totalDeleted);
		return totalDeleted;
	}

	private String getIncidentType(MessageInformation messageInformation) {
		String topic = messageInformation.getTopic();

		switch (topic) {
			case "British_Columbia_Bans_and_Prohibition_Areas":
				return "ban or prohibition";
			case "Evacuation_Orders_and_Alerts":
				return "evacuation order or alert";
			case "British_Columbia_Area_Restrictions":
				return "area restriction";
			case "BCWS_ActiveFires_PublicView":
				return "wildfire";
			default:
				return "incident";
		}
	}

	/**
	 * One value for all four topics is correct: ecs.tf gives each push worker the expiry of
	 * its own monitor type, and a worker serves one monitor type.
	 */
	public void setWfonePushItemExpireHours(String wfonePushItemExpireHours) {
		int hours = Integer.parseInt(wfonePushItemExpireHours);

		for (String topic : TOPIC_EXPIRATION_DEFAULTS.keySet()) {
			this.expirations.put(topic, hours);
		}
	}

	public void setPushNotificationPrefix(String pushNotificationPrefix) {
		this.pushNotificationPrefix = pushNotificationPrefix;
	}

	public void setSpatialMonitorHandler(MonitorHandler spatialMonitorHandler) {
		this.spatialMonitorHandler = spatialMonitorHandler;
	}

	public void setNotificationSettingsDao(NotificationSettingsDao notificationSettingsDao) {
		this.notificationSettingsDao = notificationSettingsDao;
	}

	public void setNotificationPushItemDao(NotificationPushItemDao notificationPushItemDao) {
		this.notificationPushItemDao = notificationPushItemDao;
	}

	public void setPushNotificationFactory(PushNotificationFactory pushNotificationFactory) {
		this.pushNotificationFactory = pushNotificationFactory;
	}

	public void setTransactionManager(PlatformTransactionManager transactionManager) {
		this.transactionManager = transactionManager;
	}

	public void setFirebaseMessaging(FirebaseMessaging firebaseMessaging) {
		this.firebaseMessaging = firebaseMessaging;
	}

	public void setAudiencePageSize(int audiencePageSize) {
		this.audiencePageSize = audiencePageSize;
	}

	public void setSendThreadCount(int sendThreadCount) {
		this.sendThreadCount = sendThreadCount;
	}

	public void setFcmPermitsPerSecond(double fcmPermitsPerSecond) {
		this.fcmPermitsPerSecond = fcmPermitsPerSecond;
	}
}
