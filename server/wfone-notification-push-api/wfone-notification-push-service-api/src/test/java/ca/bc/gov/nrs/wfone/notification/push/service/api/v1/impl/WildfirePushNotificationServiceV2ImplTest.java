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
		service.setPushNotificationFactory(new FakePushNotificationFactory());
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
		NotificationDto dto = new NotificationDto();
		dto.setNotificationGuid(notificationGuid);
		dto.setSubscriberGuid(subscriberGuid);
		dto.setNotificationToken(token);
		dto.setNotificationName("My Place");
		dto.setLatitude(50.0);
		dto.setLongitude(-120.0);
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
		public List<NotificationDto> select(Geometry geometry, String topic, String afterNotificationGuid, int pageSize) {
			// One page, then nothing. The service stops when a page is short.
			if (afterNotificationGuid == null || afterNotificationGuid.isEmpty()) {
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
		public PushNotification getPushNotification(Object resource, String token, FactoryContext context) {
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
