package ca.bc.gov.nrs.wfone.notification.push.service.api.v1.impl;

import ca.bc.gov.nrs.wfone.common.model.Message;
import ca.bc.gov.nrs.wfone.common.service.api.model.factory.FactoryContext;
import ca.bc.gov.nrs.wfone.notification.push.model.v1.PushNotification;
import ca.bc.gov.nrs.wfone.notification.push.model.v1.PushNotificationList;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dao.NotificationPushItemDao;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dao.NotificationSettingsDao;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dto.NotificationDto;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dto.NotificationPushItemDto;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.postgresql.PostgreSqlAreaOfInterestQuery;
import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.model.factory.PushNotificationFactory;
import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.monitor.handler.SpatialMonitorHandler;
import com.amazonaws.services.sqs.model.MessageAttributeValue;
import com.google.firebase.ErrorCode;
import com.google.firebase.messaging.BatchResponse;
import com.google.firebase.messaging.MessagingErrorCode;
import com.google.firebase.messaging.SendResponse;
import com.google.firebase.messaging.TestSendResponses;
import com.vividsolutions.jts.geom.Geometry;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.SimpleTransactionStatus;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** A recipient that already has a push item, a dead token, and an FCM error that can pass. */
public class WildfirePushNotificationServiceV2ImplTest {

	private static final String EVENT_BODY = "{ \"incidentNumberLabel\": \"V12345\", \"discoveryDate\": 160000000, \"latitude\": 50.0, \"longitude\": -120.0 }";

	private TestService service;
	private FakePushItemDao pushItemDao;
	private FakeSettingsDao settingsDao;
	private FakePushNotificationFactory pushNotificationFactory;
	private List<NotificationDto> audience;

	@Before
	public void setUp() {
		pushItemDao = new FakePushItemDao();
		settingsDao = new FakeSettingsDao();
		audience = new ArrayList<>();

		service = new TestService();
		service.setSpatialMonitorHandler(new SpatialMonitorHandler());
		service.setSpatialQuery(new FakeSpatialQuery());
		service.setNotificationPushItemDao(pushItemDao);
		service.setNotificationSettingsDao(settingsDao);
		pushNotificationFactory = new FakePushNotificationFactory();
		service.setPushNotificationFactory(pushNotificationFactory);
		service.setTransactionManager(new FakeTransactionManager());
		service.setWfonePushItemExpireHours("48");
		service.setPushNotificationPrefix("");
		service.setSendThreadCount(1);
		service.setAudiencePageSize(1000);
	}

	@Test
	public void aRecipientThatAlreadyHasAPushItemIsNotSentTwice() throws Exception {
		audience.add(recipient("guid-1", "token-1", "subscriber-1"));
		audience.add(recipient("guid-2", "token-2", "subscriber-2"));

		// Another worker, or an earlier delivery of the same event, already inserted guid-1.
		pushItemDao.insertResult = Collections.singletonList("guid-2");
		service.responses.add(Collections.singletonList(TestSendResponses.success("message-2")));

		service.pushNearMeNotifications(sqsMessage(), false, null);

		Assert.assertEquals("Only the inserted recipient is sent to", 1, service.sentMessageCounts.size());
		Assert.assertEquals(1, service.sentMessageCounts.get(0).intValue());
		Assert.assertTrue("A push item that was sent is not deleted", pushItemDao.deletedGuids.isEmpty());
	}

	@Test
	public void aDeadTokenIsClearedInOneStatement() throws Exception {
		audience.add(recipient("guid-1", "token-1", "subscriber-1"));
		audience.add(recipient("guid-2", "token-2", "subscriber-2"));

		pushItemDao.insertResult = List.of("guid-1", "guid-2");
		service.responses.add(List.of(TestSendResponses.success("message-1"),
				TestSendResponses.failure(MessagingErrorCode.UNREGISTERED, ErrorCode.NOT_FOUND)));

		service.pushNearMeNotifications(sqsMessage(), false, null);

		Assert.assertEquals("One bulk update, not one update for each token", 1, settingsDao.clearDeviceTokensCalls);
		Assert.assertEquals(Collections.singletonList("subscriber-2"), settingsDao.clearedSubscriberGuids);
		Assert.assertTrue("A dead token is not tried again", pushItemDao.deletedGuids.isEmpty());
		Assert.assertEquals("The dead token is not sent a second time", 1, service.sentMessageCounts.size());
	}

	@Test
	public void anErrorThatCanPassIsTriedAgain() throws Exception {
		audience.add(recipient("guid-1", "token-1", "subscriber-1"));

		pushItemDao.insertResult = Collections.singletonList("guid-1");
		service.responses.add(Collections.singletonList(
				TestSendResponses.failure(MessagingErrorCode.UNAVAILABLE, ErrorCode.UNAVAILABLE)));
		service.responses.add(Collections.singletonList(TestSendResponses.success("message-1")));

		service.pushNearMeNotifications(sqsMessage(), false, null);

		Assert.assertEquals("The message is sent twice: the first attempt and the retry", 2,
				service.sentMessageCounts.size());
		Assert.assertTrue("A recipient that succeeded on the retry keeps its push item",
				pushItemDao.deletedGuids.isEmpty());
		Assert.assertEquals("UNAVAILABLE is not a dead token", 0, settingsDao.clearDeviceTokensCalls);
	}

	@Test
	public void thePushItemIsDeletedWhenEveryAttemptFails() throws Exception {
		audience.add(recipient("guid-1", "token-1", "subscriber-1"));

		pushItemDao.insertResult = Collections.singletonList("guid-1");
		for (int attempt = 0; attempt < 3; attempt++) {
			service.responses.add(Collections.singletonList(
					TestSendResponses.failure(MessagingErrorCode.UNAVAILABLE, ErrorCode.UNAVAILABLE)));
		}

		try {
			service.pushNearMeNotifications(sqsMessage(), false, null);
			Assert.fail("The event must fail, so that it stays on the queue");
		} catch (Exception expected) {
			// The consumer job catches this and leaves the message on the queue.
		}

		Assert.assertEquals("The push item is deleted so that a later delivery can try again",
				Collections.singletonList("guid-1"), pushItemDao.deletedGuids);
	}

	@Test
	public void overlappingSavedLocationsOfOneSubscriberGetOnePush() throws Exception {
		// Three saved locations of one subscriber match. The query returns them nearest first.
		audience.add(recipient("guid-near", "token-1", "subscriber-1", "Kelowna cabin"));
		audience.add(recipient("guid-mid", "token-1", "subscriber-1", "Vernon house"));
		audience.add(recipient("guid-far", "token-1", "subscriber-1", "Kamloops lot"));

		pushItemDao.insertResult = List.of("guid-near", "guid-mid", "guid-far");
		service.responses.add(Collections.singletonList(TestSendResponses.success("message-1")));

		service.pushNearMeNotifications(sqsMessage(), false, null);

		Assert.assertEquals("One send call", 1, service.sentMessageCounts.size());
		Assert.assertEquals("One message for three saved locations", 1,
				service.sentMessageCounts.get(0).intValue());
		Assert.assertEquals("Every saved location keeps its push item", 0, pushItemDao.deletedGuids.size());
	}

	@Test
	public void theNearestSavedLocationNamesThePush() throws Exception {
		// The event is at 50.0, -120.0. The farther row comes first, so only the ranking can
		// pick the nearer one.
		audience.add(recipient("guid-far", "token-1", "subscriber-1", "Kamloops lot", 50.9, -120.0));
		audience.add(recipient("guid-near", "token-1", "subscriber-1", "Kelowna cabin", 50.1, -120.0));

		pushItemDao.insertResult = List.of("guid-near", "guid-far");
		service.responses.add(Collections.singletonList(TestSendResponses.success("message-1")));

		service.pushNearMeNotifications(sqsMessage(), false, null);

		Assert.assertEquals(1, pushNotificationFactory.entries.size());
		Map<String, String> entry = pushNotificationFactory.entries.get(0);
		Assert.assertTrue("The body names the nearest saved location",
				entry.get("message").contains("Kelowna cabin"));
		Assert.assertFalse("The body does not name the farther saved location",
				entry.get("message").contains("Kamloops lot"));
		Assert.assertEquals("guid-near", entry.get("notificationGuid"));
	}

	@Test
	public void theRankingScalesLongitudeForTheLatitude() throws Exception {
		// 0.30 degrees of longitude at 50 N is about 21 km. 0.25 degrees of latitude is about
		// 28 km. Raw degrees would pick the wrong row.
		audience.add(recipient("guid-lat", "token-1", "subscriber-1", "North place", 50.25, -120.0));
		audience.add(recipient("guid-lon", "token-1", "subscriber-1", "East place", 50.0, -119.7));

		pushItemDao.insertResult = List.of("guid-lat", "guid-lon");
		service.responses.add(Collections.singletonList(TestSendResponses.success("message-1")));

		service.pushNearMeNotifications(sqsMessage(), false, null);

		Assert.assertTrue("The truly nearer place wins",
				pushNotificationFactory.entries.get(0).get("message").contains("East place"));
	}

	@Test
	public void eachSubscriberStillGetsOwnPush() throws Exception {
		audience.add(recipient("guid-1", "token-1", "subscriber-1", "A"));
		audience.add(recipient("guid-2", "token-1", "subscriber-1", "B"));
		audience.add(recipient("guid-3", "token-2", "subscriber-2", "C"));

		pushItemDao.insertResult = List.of("guid-1", "guid-2", "guid-3");
		service.responses.add(List.of(TestSendResponses.success("message-1"),
				TestSendResponses.success("message-2")));

		service.pushNearMeNotifications(sqsMessage(), false, null);

		Assert.assertEquals("Two subscribers, two messages", 2, service.sentMessageCounts.get(0).intValue());
	}

	@Test
	public void everyPushItemOfAFailedSubscriberIsDeleted() throws Exception {
		// One message covers three rows. A row left behind would block the retry for all time.
		audience.add(recipient("guid-near", "token-1", "subscriber-1", "Kelowna cabin"));
		audience.add(recipient("guid-mid", "token-1", "subscriber-1", "Vernon house"));
		audience.add(recipient("guid-far", "token-1", "subscriber-1", "Kamloops lot"));

		pushItemDao.insertResult = List.of("guid-near", "guid-mid", "guid-far");
		for (int attempt = 0; attempt < 3; attempt++) {
			service.responses.add(Collections.singletonList(
					TestSendResponses.failure(MessagingErrorCode.UNAVAILABLE, ErrorCode.UNAVAILABLE)));
		}

		try {
			service.pushNearMeNotifications(sqsMessage(), false, null);
			Assert.fail("The event must fail, so that it stays on the queue");
		} catch (Exception expected) {
			// The consumer job catches this and leaves the message on the queue.
		}

		Assert.assertEquals("Every row of the group is deleted, not the nearest only",
				List.of("guid-near", "guid-mid", "guid-far"), pushItemDao.deletedGuids);
	}

	@Test
	public void aRowThatAnotherWorkerHoldsIsNotSentAgain() throws Exception {
		// An earlier delivery already inserted the nearest row. The subscriber still gets one
		// push, and the second nearest names it.
		audience.add(recipient("guid-near", "token-1", "subscriber-1", "Kelowna cabin"));
		audience.add(recipient("guid-far", "token-1", "subscriber-1", "Kamloops lot"));

		pushItemDao.insertResult = Collections.singletonList("guid-far");
		service.responses.add(Collections.singletonList(TestSendResponses.success("message-1")));

		service.pushNearMeNotifications(sqsMessage(), false, null);

		Assert.assertEquals(1, service.sentMessageCounts.get(0).intValue());
		Assert.assertTrue("The remaining row names the push",
				pushNotificationFactory.entries.get(0).get("message").contains("Kamloops lot"));
	}

	private com.amazonaws.services.sqs.model.Message sqsMessage() {
		com.amazonaws.services.sqs.model.Message message = new com.amazonaws.services.sqs.model.Message();
		Map<String, MessageAttributeValue> attributes = new HashMap<>();
		MessageAttributeValue monitorType = new MessageAttributeValue();
		monitorType.setStringValue("active-fires");
		attributes.put("monitorType", monitorType);
		message.setMessageAttributes(attributes);
		message.setBody(EVENT_BODY);

		return message;
	}

	private static NotificationDto recipient(String notificationGuid, String token, String subscriberGuid) {
		return recipient(notificationGuid, token, subscriberGuid, "My Place");
	}

	private static NotificationDto recipient(String notificationGuid, String token, String subscriberGuid,
			String notificationName) {
		return recipient(notificationGuid, token, subscriberGuid, notificationName, 50.0, -120.0);
	}

	private static NotificationDto recipient(String notificationGuid, String token, String subscriberGuid,
			String notificationName, double latitude, double longitude) {
		NotificationDto dto = new NotificationDto();
		dto.setNotificationGuid(notificationGuid);
		dto.setSubscriberGuid(subscriberGuid);
		dto.setNotificationToken(token);
		dto.setNotificationName(notificationName);
		dto.setLatitude(latitude);
		dto.setLongitude(longitude);
		dto.setRadius(10.0);
		dto.setActiveIndicator(Boolean.TRUE);

		return dto;
	}

	/** Replaces the FCM call with a script of batch responses. */
	private class TestService extends WildfirePushNotificationServiceV2Impl {

		private final List<List<SendResponse>> responses = new ArrayList<>();
		private final List<Integer> sentMessageCounts = new ArrayList<>();

		@Override
		BatchResponse sendEach(List<com.google.firebase.messaging.Message> messages) {
			sentMessageCounts.add(messages.size());

			List<SendResponse> next = responses.remove(0);

			return TestSendResponses.batch(next);
		}
	}

	private class FakeSpatialQuery implements PostgreSqlAreaOfInterestQuery {

		@Override
		public List<NotificationDto> select(Geometry geometry, String topic, String afterSubscriberGuid, int pageSize) {
			// One page, then an empty page. A short page does not end the read.
			if (afterSubscriberGuid == null || afterSubscriberGuid.isEmpty()) {
				return new ArrayList<>(audience);
			}

			return Collections.emptyList();
		}
	}

	private static class FakePushItemDao implements NotificationPushItemDao {

		private List<String> insertResult = Collections.emptyList();
		private final List<String> deletedGuids = new ArrayList<>();

		@Override
		public List<String> insertPushItems(List<NotificationPushItemDto> dtos, String userId) {
			return new ArrayList<>(insertResult);
		}

		@Override
		public int deletePushItems(List<String> notificationGuids, String itemIdentifier) {
			deletedGuids.addAll(notificationGuids);

			return notificationGuids.size();
		}

		@Override
		public int deleteExpired(int limit) {
			return 0;
		}

	}

	private static class FakeSettingsDao implements NotificationSettingsDao {

		private int clearDeviceTokensCalls = 0;
		private final List<String> clearedSubscriberGuids = new ArrayList<>();

		@Override
		public int clearDeviceTokens(List<String> subscriberGuids, String userId) {
			clearDeviceTokensCalls++;
			clearedSubscriberGuids.addAll(subscriberGuids);

			return subscriberGuids.size();
		}

	}

	private static class FakePushNotificationFactory implements PushNotificationFactory {

		private final List<Map<String, String>> entries = new ArrayList<>();
		private final List<String> tokens = new ArrayList<>();

		@Override
		public PushNotificationList<? extends PushNotification> getPushNotificationList(
				List<PushNotification> pushNotifications, FactoryContext context) {
			return null;
		}

		@Override
		public PushNotification getPushNotification(Object resource, FactoryContext context) {
			return null;
		}

		@Override
		public PushNotification getPushNotification(Throwable t, FactoryContext context) {
			return null;
		}

		@Override
		public PushNotification getPushNotification(String resourceId, Throwable t, FactoryContext context) {
			return null;
		}

		@Override
		public PushNotification getPushNotification(String resourceId, Object resource, List<Message> messages,
				FactoryContext context) {
			return null;
		}

		@Override
		@SuppressWarnings("unchecked")
		public PushNotification getPushNotification(Object resource, String token, FactoryContext context) {
			entries.add((Map<String, String>) resource);
			tokens.add(token);

			return null;
		}
	}

	private static class FakeTransactionManager implements PlatformTransactionManager {

		@Override
		public TransactionStatus getTransaction(TransactionDefinition definition) {
			return new SimpleTransactionStatus();
		}

		@Override
		public void commit(TransactionStatus status) {
			// nothing to do
		}

		@Override
		public void rollback(TransactionStatus status) {
			// nothing to do
		}
	}
}
