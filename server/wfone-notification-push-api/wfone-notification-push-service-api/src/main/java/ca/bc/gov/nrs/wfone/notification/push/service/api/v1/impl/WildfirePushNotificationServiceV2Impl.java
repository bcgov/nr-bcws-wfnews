package ca.bc.gov.nrs.wfone.notification.push.service.api.v1.impl;

import ca.bc.gov.nrs.wfone.common.persistence.dao.DaoException;
import ca.bc.gov.nrs.wfone.common.service.api.ServiceException;
import ca.bc.gov.nrs.wfone.common.service.api.model.factory.FactoryContext;
import ca.bc.gov.nrs.wfone.notification.push.model.v1.PushNotification;
import ca.bc.gov.nrs.wfone.notification.push.model.v1.PushNotificationList;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dao.NotificationPushItemDao;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dao.NotificationSettingsDao;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dto.NotificationDto;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dto.NotificationPushItemDto;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.postgresql.PostgreSqlAreaOfInterestQuery;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.type.NotificationTopics;
import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.WildfirePushNotificationServiceV2;
import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.exception.InvalidNotificationTokenException;
import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.model.MessageInformation;
import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.model.TwitterInformation;
import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.model.factory.PushNotificationFactory;
import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.monitor.handler.MonitorHandler;
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

import java.sql.SQLException;
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
	private PostgreSqlAreaOfInterestQuery spatialQuery;
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

	private static class ProcessingCount {
		final AtomicLong toProcess = new AtomicLong();
		final AtomicLong processed = new AtomicLong();
		final AtomicLong skipped = new AtomicLong();
		final AtomicLong ignored = new AtomicLong();
		final AtomicLong failed = new AtomicLong();
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

		try {
			Map<String, Date> expirations = getExpirations();
			Date currentTimeStamp = new Date();

			// Extract message information
			String monitorType = getMonitorType(messageFromSqs);

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
		} catch (SQLException e) {
			throw new ServiceException("PostgreSql threw an exception", e);
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
		logger.info(">pushNearMeNotifications " + result);

		return result;
	}

	/**
	 * The worker queue is bounded and uses CallerRunsPolicy on purpose: a full queue makes
	 * the reader do the work, so it cannot run ahead of the senders and fill memory.
	 */
	private void pushMessages(boolean isTest, FactoryContext context, ProcessingCount pushRecordsCount,
			List<PushNotification> pushNotifications, Map<String, Date> expirations, Date currentTimeStamp,
			MessageInformation messageInformation) throws DaoException, SQLException, ServiceException {

		logger.debug("### Starting Processing Subscriber push events");

		ThreadPoolExecutor executor = new ThreadPoolExecutor(sendThreadCount, sendThreadCount, 0L, TimeUnit.MILLISECONDS,
				new ArrayBlockingQueue<Runnable>(sendThreadCount), new ThreadPoolExecutor.CallerRunsPolicy());
		RateLimiter rateLimiter = fcmPermitsPerSecond > 0 ? RateLimiter.create(fcmPermitsPerSecond) : null;
		List<Future<?>> futures = new ArrayList<>();
		long pageCount = 0;

		try {
			String afterNotificationGuid = "";

			while (true) {
				List<NotificationDto> page = spatialQuery.select(messageInformation.getGeometry(),
						messageInformation.getTopic(), afterNotificationGuid, audiencePageSize);

				if (page.isEmpty()) {
					break;
				}

				pageCount++;
				afterNotificationGuid = page.get(page.size() - 1).getNotificationGuid();

				final List<NotificationDto> pageToSend = page;
				futures.add(executor.submit(() -> sendPage(pageToSend, isTest, context, pushRecordsCount,
						pushNotifications, expirations, currentTimeStamp, messageInformation, rateLimiter)));

				if (page.size() < audiencePageSize) {
					break;
				}
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
		logger.info("Pages: " + pageCount);
		logger.info("Subscribed: " + pushRecordsCount.toProcess.get());
		logger.info("Succeeded: " + pushRecordsCount.processed.get());
		logger.info("Skipped (Duplicate): " + pushRecordsCount.skipped.get());
		logger.info("Ignored: " + pushRecordsCount.ignored.get());
		logger.info("Failed: " + pushRecordsCount.failed.get());
	}

	private void sendPage(List<NotificationDto> page, boolean isTest, FactoryContext context,
			ProcessingCount pushRecordsCount, List<PushNotification> pushNotifications, Map<String, Date> expirations,
			Date currentTimeStamp, MessageInformation messageInformation, RateLimiter rateLimiter) {

		String topicKey = messageInformation.getTopic();
		String eventIdentifier = messageInformation.getItemIdentifier();
		Date expireTimestamp = expirations.get(topicKey);

		List<NotificationDto> recipients = new ArrayList<>(page.size());
		for (NotificationDto notificationDto : page) {
			// The token comes from the spatial query row, not from a fetch for each recipient.
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

		pushRecordsCount.toProcess.addAndGet(recipients.size());

		// The INSERT is the idempotency gate: only the guids that come back are ours to send
		// to. Another replica, or an earlier delivery, already holds the rest.
		List<NotificationPushItemDto> pushItems = new ArrayList<>(recipients.size());
		for (NotificationDto notificationDto : recipients) {
			pushItems.add(createNotificationPushItemDto(notificationDto.getNotificationGuid(), expireTimestamp,
					currentTimeStamp, eventIdentifier));
		}

		Set<String> insertedGuids = new HashSet<>(insertPushItems(pushItems));
		pushRecordsCount.skipped.addAndGet(recipients.size() - insertedGuids.size());

		if (insertedGuids.isEmpty()) {
			logger.debug("Every recipient in this page was already sent for event {}", eventIdentifier);
			return;
		}

		List<NotificationDto> messageRecipients = new ArrayList<>(insertedGuids.size());
		List<com.google.firebase.messaging.Message> messages = new ArrayList<>(insertedGuids.size());
		List<String> bodies = new ArrayList<>(insertedGuids.size());

		for (NotificationDto notificationDto : recipients) {
			if (!insertedGuids.contains(notificationDto.getNotificationGuid())) {
				continue;
			}

			try {
				String body = buildBody(isTest, topicKey, messageInformation.getMessageId(),
						notificationDto.getNotificationName());

				messageRecipients.add(notificationDto);
				bodies.add(body);
				messages.add(prepareNearMePushNotification(buildTitle(messageInformation), body,
						notificationDto.getNotificationToken(), buildDataMap(topicKey, messageInformation, notificationDto)));
			} catch (InvalidNotificationTokenException e) {
				// The token cannot make a message. It is dead in the same way as UNREGISTERED.
				logger.warn("Invalid notification token for subscriber {}", notificationDto.getSubscriberGuid());
				pushRecordsCount.failed.incrementAndGet();
			}
		}

		for (int start = 0; start < messages.size(); start += FCM_BATCH_SIZE) {
			int end = Math.min(start + FCM_BATCH_SIZE, messages.size());

			sendBatch(messages.subList(start, end), messageRecipients.subList(start, end), bodies.subList(start, end),
					topicKey, eventIdentifier, context, pushRecordsCount, pushNotifications, rateLimiter);
		}
	}

	private void sendBatch(List<com.google.firebase.messaging.Message> messages, List<NotificationDto> recipients,
			List<String> bodies, String topicKey, String eventIdentifier, FactoryContext context,
			ProcessingCount pushRecordsCount, List<PushNotification> pushNotifications, RateLimiter rateLimiter) {

		List<com.google.firebase.messaging.Message> attemptMessages = new ArrayList<>(messages);
		List<NotificationDto> attemptRecipients = new ArrayList<>(recipients);
		List<String> attemptBodies = new ArrayList<>(bodies);

		List<String> deadTokenSubscriberGuids = new ArrayList<>();

		for (int attempt = 1; attempt <= MAX_SEND_ATTEMPTS && !attemptMessages.isEmpty(); attempt++) {
			if (rateLimiter != null) {
				rateLimiter.acquire(attemptMessages.size());
			}

			BatchResponse batchResponse;
			try {
				batchResponse = sendEach(attemptMessages);
			} catch (FirebaseMessagingException e) {
				// The whole call failed. Every message in the batch can be tried again.
				logger.error("FCM refused a batch of " + attemptMessages.size() + " messages", e);
				sleepBeforeRetry(attempt);
				continue;
			}

			List<com.google.firebase.messaging.Message> retryMessages = new ArrayList<>();
			List<NotificationDto> retryRecipients = new ArrayList<>();
			List<String> retryBodies = new ArrayList<>();

			List<SendResponse> responses = batchResponse.getResponses();
			for (int i = 0; i < responses.size(); i++) {
				SendResponse sendResponse = responses.get(i);
				NotificationDto recipient = attemptRecipients.get(i);

				if (sendResponse.isSuccessful()) {
					pushRecordsCount.processed.incrementAndGet();
					addResultEntry(pushNotifications, context, recipient, topicKey, attemptBodies.get(i));
					continue;
				}

				MessagingErrorCode errorCode = sendResponse.getException() == null ? null
						: sendResponse.getException().getMessagingErrorCode();

				if (errorCode != null && DEAD_TOKEN_ERRORS.contains(errorCode)) {
					// The token is gone. Keep the push item: there is nothing to try again.
					deadTokenSubscriberGuids.add(recipient.getSubscriberGuid());
					pushRecordsCount.failed.incrementAndGet();
					logger.warn("Dead device token for subscriber {}. Error code {}.", recipient.getSubscriberGuid(), errorCode);
					continue;
				}

				// UNAVAILABLE, QUOTA_EXCEEDED, INTERNAL and 429 are not dead tokens.
				retryMessages.add(attemptMessages.get(i));
				retryRecipients.add(recipient);
				retryBodies.add(attemptBodies.get(i));
			}

			attemptMessages = retryMessages;
			attemptRecipients = retryRecipients;
			attemptBodies = retryBodies;

			if (!attemptMessages.isEmpty() && attempt < MAX_SEND_ATTEMPTS) {
				logger.info("Trying {} messages again. Attempt {} of {}.", attemptMessages.size(), attempt + 1,
						MAX_SEND_ATTEMPTS);
				sleepBeforeRetry(attempt);
			}
		}

		clearDeviceTokens(deadTokenSubscriberGuids);

		if (!attemptRecipients.isEmpty()) {
			// Remove the push items, or they block the retry and these recipients never get
			// the push.
			pushRecordsCount.failed.addAndGet(attemptRecipients.size());
			deletePushItems(attemptRecipients, eventIdentifier);

			throw new IllegalStateException(
					"FCM did not accept " + attemptRecipients.size() + " messages after " + MAX_SEND_ATTEMPTS + " attempts");
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

	private List<String> insertPushItems(List<NotificationPushItemDto> pushItems) {
		TransactionTemplate transactionTemplate = new TransactionTemplate(transactionManager);

		return transactionTemplate.execute(status -> {
			try {
				return notificationPushItemDao.insertPushItems(pushItems, null);
			} catch (DaoException e) {
				throw new IllegalStateException("Failed to insert a page of push items", e);
			}
		});
	}

	private void deletePushItems(List<NotificationDto> recipients, String eventIdentifier) {
		List<String> notificationGuids = new ArrayList<>(recipients.size());
		for (NotificationDto recipient : recipients) {
			notificationGuids.add(recipient.getNotificationGuid());
		}

		try {
			notificationPushItemDao.deletePushItems(notificationGuids, eventIdentifier);
		} catch (DaoException e) {
			logger.error("Failed to delete " + notificationGuids.size() + " push items. A later delivery of event "
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

	private static NotificationPushItemDto createNotificationPushItemDto(String notificationGuid, Date expireTimestamp,
			Date pushTimeStamp, String itemIdentifier) {
		NotificationPushItemDto notificationPushItemDto = new NotificationPushItemDto();
		notificationPushItemDto.setNotificationGuid(notificationGuid);
		notificationPushItemDto.setItemExpiryTimestamp(expireTimestamp);
		notificationPushItemDto.setPushTimestamp(pushTimeStamp);
		notificationPushItemDto.setItemIdentifier(itemIdentifier);

		return notificationPushItemDto;
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

	public void setSpatialQuery(PostgreSqlAreaOfInterestQuery spatialQuery) {
		this.spatialQuery = spatialQuery;
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
