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
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dto.NotificationSettingsDto;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dto.NotificationTopicDto;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.postgresql.PostgreSqlAreaOfInterestQuery;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.type.NotificationTopics;
import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.WildfirePushNotificationServiceV2;
import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.exception.InvalidNotificationTokenException;
import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.model.MessageInformation;
import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.model.TwitterInformation;
import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.model.factory.PushNotificationFactory;
import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.monitor.handler.MonitorHandler;
import com.amazonaws.services.sqs.model.Message;
import com.google.common.annotations.VisibleForTesting;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Notification;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.DefaultTransactionDefinition;

import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.time.Duration;
import java.util.*;

public class WildfirePushNotificationServiceV2Impl implements WildfirePushNotificationServiceV2 {

	private static final Logger logger = LoggerFactory.getLogger(WildfirePushNotificationServiceV2Impl.class);
	private static final String MONITOR_ATTRIBUTE = "monitorType";
	private static final String NO_SUCH_INFORMATION_FROM_SQS_MESSAGE = "no such information from sqs message";

	private Map<String, Integer> expirations = new HashMap<>();

	private String pushNotificationPrefix;

	private MonitorHandler spatialMonitorHandler;
	private PostgreSqlAreaOfInterestQuery spatialQuery;
	private NotificationSettingsDao notificationSettingsDao;
	private NotificationPushItemDao notificationPushItemDao;
	private PushNotificationFactory pushNotificationFactory;

	private PlatformTransactionManager transactionManager;
	private FirebaseMessaging firebaseMessaging;

	private static class ProcessingCount {
		long toProcess = 0, processed = 0;
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
		result.put(NotificationTopics.BRITISH_COLUMBIA_BANS_AND_PROHIBITION_AREAS, "There is a new burn prohibition in %s Fire Centre near your saved location %s. Tap for more info.");
		result.put(NotificationTopics.EVACUATION_ORDERS_AND_ALERTS, "There is a new evacuation order or alert issued by %s near your saved location %s. Tap for more info.");
		result.put(NotificationTopics.BRITISH_COLUMBIA_AREA_RESTRICTIONS, "There is a new area restriction for %s near your saved location %s. Tap for more info.");
		result.put(NotificationTopics.BCWF_ACTIVEFIRES_PUBLIVIEW, "There is a new wildfire (incident #%s) near your saved location %s. Tap for more info.");
		TOPIC_MESSAGE_BODIES = Collections.unmodifiableMap(result);
	}

	@VisibleForTesting
	Calendar now() {
		return Calendar.getInstance();
	}

	private Map<String, Date> getExpirations(){
		Map<String, Date> result = new HashMap<>();

		TOPIC_EXPIRATION_DEFAULTS.forEach((topic, defaultOffset)->{
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
		List<PushNotification> pushNotifications = new ArrayList<PushNotification>();

		// Start the transaction before we make any database calls
		logger.debug("Starting Transaction");
		TransactionDefinition transactionDefinition = new DefaultTransactionDefinition();

		try {
			Map<String, Date> expirations = getExpirations();
			Date currentTimeStamp = new Date();
			MessageInformation messageInformation = null;
			List<NotificationDto> subscribers = new ArrayList<>();

			// Extract message information
			String monitorType = messageFromSqs.getMessageAttributes().get(MONITOR_ATTRIBUTE).getStringValue();

			messageInformation = spatialMonitorHandler.handleMessage(messageFromSqs);
			Map<String, String> eventInformation = messageInformation.getEventInformation();

			logger.info("Event Indicator: " + messageInformation.getMessageId());
			logger.info("Event Date: " + messageInformation.getMessageDate().toString());
			logger.info("Monitor Type: " + monitorType);
			logger.info("Monitor Topic: " + messageInformation.getTopic());
			logger.info("All Event Information: " + eventInformation.toString());
			logger.info("###############################################");
			eventLogging = getEventLogging(monitorType, eventInformation);
			// Get a list of subscribers using area of interest (point/polygon)
			logger.debug("Fetching subsribers @ [" + messageInformation.getGeometry().getCoordinate().x + ", " + messageInformation.getGeometry().getCoordinate().y + "]" );
			subscribers = spatialQuery.select(messageInformation.getGeometry(), messageInformation.getTopic());
			logger.info(subscribers.size() + " subscribers found.");

			pushMessages(isTest, context, pushRecordsCount, pushNotifications, transactionDefinition, expirations, currentTimeStamp, messageInformation, subscribers);
		} catch (DaoException e) {
			throw new ServiceException("DAO threw an exception", e);
		} catch (SQLException e) {
			throw new ServiceException("PostgreSql threw an exception", e);
		} finally {
			logger.debug("Closing transaction");
			TransactionStatus transactionStatus = transactionManager.getTransaction(transactionDefinition);
			try {
				transactionManager.commit(transactionStatus);
			} catch (Exception te) {
				logger.error("Error occured closing transaction state", te);
			}
		}

		result = this.pushNotificationFactory.getPushNotificationList(pushNotifications, context);

		eventLogging.ifPresent(logger::info);

		logger.info(" Push near me completed :  pushRecordsToProcess = " + String.valueOf(pushRecordsCount.toProcess) + ". pushRecordsProcessed = " + String.valueOf(pushRecordsCount.processed));

		SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		Date jobFinishedDate = new Date();
		String jobFinishedDateString = formatter.format(jobFinishedDate);
		String jobStartedDateString = formatter.format(jobStartedDate);

		long millsDiff = jobFinishedDate.getTime() - jobStartedDate.getTime();
		Duration duration = Duration.ofMillis(millsDiff);
		String formattedElapsedTime = String.format("%d:%02d:%02d:%02d", duration.toDays(), duration.toHours() % 24, duration.toMinutes() % 60, (duration.toMillis() / 1000) % 60);
		logger.info(" Push near me Started " + jobStartedDateString + ".   Finished " + jobFinishedDateString + ".  Duration (days:hours:min:seconds): " + formattedElapsedTime);
		logger.info(">pushNearMeNotifications " + result);

		return result;
	}

	private void pushMessages(boolean isTest, FactoryContext context, ProcessingCount pushRecordsCount,
			List<PushNotification> pushNotifications, TransactionDefinition transactionDefinition,
			Map<String, Date> expirations, Date currentTimeStamp, MessageInformation messageInformation,
			List<NotificationDto> subscribers) throws DaoException {

		logger.debug("### Starting Processing Subscriber push events");
		Map<NotificationDto, NotificationSettingsDto> areaOfInterestSubscriberMap = new HashMap<>();

		logger.debug("Load notification settings, tokens...");
		for (NotificationDto subscriber : subscribers) {
			NotificationSettingsDto notificationSettingsDto = notificationSettingsDao.fetch(subscriber.getSubscriberGuid());
			// Ignore null or empty notification token
			if (StringUtils.isNotBlank(notificationSettingsDto.getNotificationToken())) {
				areaOfInterestSubscriberMap.put(subscriber, notificationSettingsDto);
			}
		}

		if (subscribers.size() != areaOfInterestSubscriberMap.size()) {
			logger.info("Found " + subscribers.size() + " subscribers, but not all had valid Notification Tokens.");
			logger.info("Valid Subscribers: " + areaOfInterestSubscriberMap.size());
			logger.info("Invalid Subscribers will be ignored");
		}

		logger.debug("Starting Push Message Loop for " + areaOfInterestSubscriberMap.size() + " subscribers");
		int successCount = 0;
		int failCount = 0;
		int ignoreCount = 0;
		for (Map.Entry<NotificationDto, NotificationSettingsDto> entry : areaOfInterestSubscriberMap.entrySet()) {
			try {
				NotificationDto notificationDto = entry.getKey();
				NotificationSettingsDto notificationSettingsDto = entry.getValue();
				logger.debug("Starting Push Notification");
				logger.debug("Notification GUID: " + entry.getKey().getNotificationGuid());
				logger.debug("Subscriber GUID: " + entry.getKey().getSubscriberGuid());
				logger.debug("Message: " + messageInformation.getMessageId());
				logger.debug("Topic: " + messageInformation.getTopic());

				if (notificationDto.getActiveIndicator().booleanValue() /* Must be true because it's filtered in the query */) {
					// Skip Inactive
					if ((notificationDto.getLatitude() == null || notificationDto.getLongitude() == null || notificationDto.getRadius() == null)) {
						logger.warn("Skipping Notification '" + notificationDto.getNotificationGuid() + "' Missing latitude, longitude, radius");
						ignoreCount++;
						continue;
					}

					try {
						pushMessageToSubscriber(isTest, context, pushRecordsCount, pushNotifications, transactionDefinition, expirations, currentTimeStamp, messageInformation, notificationDto, notificationSettingsDto);
						successCount++;
					} catch (Throwable t) {
						PushNotification pushNotification = this.pushNotificationFactory.getPushNotification(t, context);
						pushNotifications.add(0, pushNotification);

						throw t;
					}
				} else {
					logger.info("Subscriber is no longer active. Ignoring.");
					ignoreCount++;
				}
			} catch (Throwable e) {
				logger.error("Unhandled exception occured processing Notification");
				logger.error("Notification GUID: " + entry.getKey().getNotificationGuid());
				logger.error("Subscriber GUID: " + entry.getKey().getSubscriberGuid());
				logger.error("Message: " + messageInformation.getMessageId());
				logger.error("Topic: " + messageInformation.getTopic());
				logger.error("Exception caught : " + e.getLocalizedMessage());
				logger.error("Exception trace: " + e.getStackTrace());

				failCount++;
			}
		}

		logger.info("Push Notification process complete.");
		logger.info("Subscribed: " + areaOfInterestSubscriberMap.size());
		logger.info("Succeeded: " + successCount);
		logger.info("Ignored: " + ignoreCount);
		logger.info("Failed: " + failCount);
	}

	private void pushMessageToSubscriber(boolean isTest, FactoryContext context, ProcessingCount pushRecordsCount,
			List<PushNotification> pushNotifications, TransactionDefinition transactionDefinition,
			Map<String, Date> expirations, Date currentTimeStamp, MessageInformation messageInformation,
			NotificationDto notificationDto, NotificationSettingsDto notificationSettingsDto) throws Throwable {
		String topicKey = messageInformation.getTopic();
		String latitude = String.valueOf(notificationDto.getLatitude());
		String longitude = String.valueOf(notificationDto.getLongitude());
		String radius = String.valueOf(notificationDto.getRadius());

		Map<String, String> keyValueMapForPN = new HashMap<>();
		String location = "[" + latitude + "," + longitude + "]";
		keyValueMapForPN.put("coords", location);
		keyValueMapForPN.put("radius", radius);
		keyValueMapForPN.put("topicKey", topicKey);
		keyValueMapForPN.put("messageID", messageInformation.getMessageId());

		String incidentType = getIncidentType(messageInformation);
		String title = "New " + incidentType;
		if (StringUtils.isNotBlank(pushNotificationPrefix)) {
			title = pushNotificationPrefix + title;
		}

		String body = null;
		Date expireTimestamp = null;

		expireTimestamp = expirations.get(topicKey);
		body = ((isTest) ? "TEST: " : "") + String.format(TOPIC_MESSAGE_BODIES.get(topicKey), messageInformation.getMessageId(), notificationDto.getNotificationName());

		com.google.firebase.messaging.Message message = prepareNearMePushNotification(title, body, notificationSettingsDto.getNotificationToken(), keyValueMapForPN);
		++pushRecordsCount.toProcess;

		sendNearMePNAndCreateNotifPushItem(notificationSettingsDto, message, notificationDto.getNotificationGuid(), expireTimestamp, currentTimeStamp, topicKey);

		Map<String, String> pushMap = new HashMap<>();
		pushMap.put("notificationToken", notificationSettingsDto.getNotificationToken());
		pushMap.put("notificationGuid", notificationDto.getNotificationGuid());
		pushMap.put("notificationTopic", topicKey);
		pushMap.put("message", body);

		PushNotification pushNotification = this.pushNotificationFactory.getPushNotification(pushMap, notificationSettingsDto.getNotificationToken(), context);
		pushNotifications.add(pushNotification);

		++pushRecordsCount.processed;
	}

	private Optional<String> getEventLogging(String monitorType, Map<String, String> eventInformation) {
		switch (monitorType) {
		case "active-fires":
			String fireNumber = eventInformation.getOrDefault(MessageInformation.FIRE_NUMBER, NO_SUCH_INFORMATION_FROM_SQS_MESSAGE);
			String fireYear = eventInformation.getOrDefault(MessageInformation.FIRE_YEAR, NO_SUCH_INFORMATION_FROM_SQS_MESSAGE);
			return Optional.of(String.format("Push near me notifications for active fire with fire number [%s], fire year [%s]", fireNumber, fireYear));
		case "area-restrictions":
			String fireCentreName = eventInformation.getOrDefault(MessageInformation.FIRE_CENTRE_NAME, NO_SUCH_INFORMATION_FROM_SQS_MESSAGE);
			String fireZoneName = eventInformation.getOrDefault(MessageInformation.FIRE_ZONE_NAME, NO_SUCH_INFORMATION_FROM_SQS_MESSAGE);
			String name = eventInformation.getOrDefault(MessageInformation.NAME, NO_SUCH_INFORMATION_FROM_SQS_MESSAGE);
			return Optional.of(String.format("Push near me notifications for area restrictions with name [%s], fire centre name [%s], fire zone name [%s]", name, fireCentreName, fireZoneName));
		case "bans-prohibitions":
			String bansFireCentreName = eventInformation.getOrDefault(MessageInformation.FIRE_CENTRE_NAME, NO_SUCH_INFORMATION_FROM_SQS_MESSAGE);
			String bansFireZoneName = eventInformation.getOrDefault(MessageInformation.FIRE_ZONE_NAME, NO_SUCH_INFORMATION_FROM_SQS_MESSAGE);
			String accessProhibitionDescription = eventInformation.getOrDefault(MessageInformation.ACCESS_PROHIBITION_DESCRIPTION, NO_SUCH_INFORMATION_FROM_SQS_MESSAGE);
			String type = eventInformation.getOrDefault(MessageInformation.TYPE, NO_SUCH_INFORMATION_FROM_SQS_MESSAGE);
			return Optional.of(String.format("Push near me notifications for bans prohibitions with fire centre name [%s], fire zone name [%s], access prohibition description [%s], type [%s]", bansFireCentreName, bansFireZoneName, accessProhibitionDescription, type));
		case "evacuation-orders-alerts":
			String eventName = eventInformation.getOrDefault(MessageInformation.EVENT_NAME, NO_SUCH_INFORMATION_FROM_SQS_MESSAGE);
			String issuingAgency = eventInformation.getOrDefault(MessageInformation.ISSUING_AGENCY, NO_SUCH_INFORMATION_FROM_SQS_MESSAGE);
			return Optional.of(String.format("Push near me notifications for evacuation orders alerts with event name [%s], issuing agency [%s]", eventName, issuingAgency));
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

	private void sendNearMePNAndCreateNotifPushItem(NotificationSettingsDto notificationSettingsDto,
			com.google.firebase.messaging.Message message, String notificationGuid, Date expireTimestamp,
			Date pushTimeStamp, String identifier) throws Throwable {

		try {
			logger.debug("Starting Message Push");
			// check if this notification subscription still exists
			NotificationSettingsDto realTimeNotificationSettingsDto = notificationSettingsDao.fetch(notificationSettingsDto.getSubscriberGuid());

			if (realTimeNotificationSettingsDto != null && realTimeNotificationSettingsDto.getNotificationToken() != null && realTimeNotificationSettingsDto.getNotificationToken().length() > 0) {
				boolean notificationFound = false;

				for (NotificationDto realTimeNotificationDto : realTimeNotificationSettingsDto.getNotifications()) {
					if (realTimeNotificationDto.getNotificationGuid().equals(notificationGuid) && realTimeNotificationDto.getActiveIndicator() != null && realTimeNotificationDto.getActiveIndicator().booleanValue()) {
						notificationFound = true;
						break;
					}
				}

				if (notificationFound) {
					logger.debug("Sending to Firebase");
					String response = firebaseMessaging.send(message);
					logger.debug("Complete. Response: " + response);

					logger.debug("Writing transaction log to NotificationPushItemDTO");
					NotificationPushItemDto notificationPushItemDto = createNotificationPushItemDto(notificationGuid, expireTimestamp, pushTimeStamp, identifier);
					notificationPushItemDao.insert(notificationPushItemDto, null);
				}
			} else {
				throw new Exception("Notification Subscriber removed during processing.");
			}
		} catch (FirebaseMessagingException e) {
			logger.error("subscriberGuid=" + notificationSettingsDto.getSubscriberGuid());
			logger.error("notificationToken=" + notificationSettingsDto.getNotificationToken());
			logger.error("deviceType=" + notificationSettingsDto.getDeviceType());
			logger.error("Exception:" + e);
			logger.error("ErrorCode=" + e.getErrorCode());

			if ("invalid-argument".equals(e.getErrorCode()) || "registration-token-not-registered".equals(e.getErrorCode())) {
				this.notificationSettingsDao.inactivate(notificationSettingsDto.getSubscriberGuid(), null);
				logger.error("Subscriber " + notificationSettingsDto.getSubscriberGuid() + " excluded from future notifications");
			}
		} catch (Throwable e) {
			throw e;
		}
	}

	private static com.google.firebase.messaging.MulticastMessage prepareTweetForPushNotification(String title,
			String body, List<String> regTokens, TwitterInformation twitterInformation) {

		Notification.Builder builder = Notification.builder();
		builder.setBody(body);
		builder.setTitle(title);

		return com.google.firebase.messaging.MulticastMessage.builder().setNotification(builder.build())
				.addAllTokens(regTokens).putData("type", "tweet").putData("tweetId", twitterInformation.getIdStr())
				.build();
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

	public void setWfonePushItemExpireHoursBan(String wfonePushItemExpireHoursBan) {
		this.expirations.put(NotificationTopics.BRITISH_COLUMBIA_BANS_AND_PROHIBITION_AREAS, Integer.parseInt(wfonePushItemExpireHoursBan));
	}

	public void setWfonePushItemExpireHoursFire(String wfonePushItemExpireHoursFire) {
		this.expirations.put(NotificationTopics.BCWF_ACTIVEFIRES_PUBLIVIEW, Integer.parseInt(wfonePushItemExpireHoursFire));
	}

	public void setWfonePushItemExpireHoursEvacutaion(String wfonePushItemExpireHoursEvacutaion) {
		this.expirations.put(NotificationTopics.EVACUATION_ORDERS_AND_ALERTS, Integer.parseInt(wfonePushItemExpireHoursEvacutaion));
	}

	public void setWfonePushItemExpireHoursRestrictedArea(String wfonePushItemExpireHoursRestrictedArea) {
		this.expirations.put(NotificationTopics.BRITISH_COLUMBIA_AREA_RESTRICTIONS, Integer.parseInt(wfonePushItemExpireHoursRestrictedArea));
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
}
