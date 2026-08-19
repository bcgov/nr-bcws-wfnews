package ca.bc.gov.nrs.wfone.notification.push.service.api.v1.impl;

import ca.bc.gov.nrs.wfone.common.model.Message;
import ca.bc.gov.nrs.wfone.common.service.api.model.factory.FactoryContext;
import ca.bc.gov.nrs.wfone.notification.push.model.v1.PushNotification;
import ca.bc.gov.nrs.wfone.notification.push.model.v1.PushNotificationList;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dao.NotificationPushItemDao;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dao.NotificationSettingsDao;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dao.mybatis.NotificationPushItemDaoImpl;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dao.mybatis.mapper.NotificationPushItemMapper;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dto.NotificationDto;
import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.model.factory.PushNotificationFactory;
import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.monitor.handler.SpatialMonitorHandler;
import com.amazonaws.services.sqs.model.MessageAttributeValue;
import com.google.firebase.ErrorCode;
import com.google.firebase.messaging.BatchResponse;
import com.google.firebase.messaging.MessagingErrorCode;
import com.google.firebase.messaging.SendResponse;
import com.google.firebase.messaging.TestSendResponses;
import org.apache.commons.dbcp2.BasicDataSource;
import org.apache.ibatis.session.SqlSessionFactory;
import org.junit.After;
import org.junit.Assert;
import org.junit.Assume;
import org.junit.Before;
import org.junit.Test;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;

import javax.sql.DataSource;
import java.io.InputStream;
import java.lang.reflect.Field;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * The only test that executes NotificationPushItemMapper.xml. FCM is stubbed and nothing
 * else is. It needs a database, and it is skipped without one. Start postgis/postgis:13-3.3
 * on port 55433, then run with -Dwfnews.itest.jdbcUrl.
 */
public class AudienceReadIntegrationTest {

	private static final String JDBC_URL_PROPERTY = "wfnews.itest.jdbcUrl";

	/** The event of the seed: a point fire at -120.0, 50.0. */
	private static final String EVENT_BODY =
			"{ \"incidentNumberLabel\": \"V12345\", \"discoveryDate\": 160000000, \"latitude\": 50.0, \"longitude\": -120.0 }";

	private BasicDataSource dataSource;
	private TestService service;
	private NotificationPushItemDao pushItemDao;
	private FakeSettingsDao settingsDao;
	private FakePushNotificationFactory pushNotificationFactory;

	@Before
	public void setUp() throws Exception {
		String jdbcUrl = System.getProperty(JDBC_URL_PROPERTY);
		Assume.assumeNotNull("Set -D" + JDBC_URL_PROPERTY + " to run this test", jdbcUrl);

		dataSource = new BasicDataSource();
		dataSource.setDriverClassName(org.postgresql.Driver.class.getName());
		dataSource.setUrl(jdbcUrl);
		dataSource.setUsername(System.getProperty("wfnews.itest.user", "wfnews"));
		dataSource.setPassword(System.getProperty("wfnews.itest.password", "password"));
		dataSource.setMaxTotal(10);

		// Skipped when Liquibase built the database, so the seed lands on the real schema.
		if (!Boolean.getBoolean("wfnews.itest.skipSchema")) {
			runScript(dataSource, "audience-read-itest-schema.sql");
		}

		runScript(dataSource, "audience-read-itest-seed.sql");

		pushItemDao = newPushItemDao(dataSource);
		settingsDao = new FakeSettingsDao();

		service = new TestService();
		service.setSpatialMonitorHandler(new SpatialMonitorHandler());
		service.setNotificationPushItemDao(pushItemDao);
		service.setNotificationSettingsDao(settingsDao);
		pushNotificationFactory = new FakePushNotificationFactory();
		service.setPushNotificationFactory(pushNotificationFactory);
		service.setTransactionManager(new DataSourceTransactionManager(dataSource));
		service.setWfonePushItemExpireHours("48");
		service.setPushNotificationPrefix("");
		service.setSendThreadCount(1);
		service.setAudiencePageSize(1000);
	}

	@After
	public void tearDown() throws Exception {
		if (dataSource != null) {
			dataSource.close();
		}
	}

	@Test
	public void theMaterialisePassWritesOneWorkListRowForEachRecipient() throws Exception {
		service.responses.add(successes(3));

		service.pushNearMeNotifications(sqsMessage(), false, null);

		// sub-1 has three saved locations, sub-2 has one and sub-7 has two. sub-3 is far away,
		// sub-4 has no token, sub-5 is turned off and sub-6 watches another topic.
		Assert.assertEquals("Six recipients in the work list", 6, count("SELECT count(*) FROM notification_push_item"));
		Assert.assertEquals("Three subscribers", 3,
				count("SELECT count(DISTINCT subscriber_guid) FROM notification_push_item"));
		Assert.assertEquals("The second topic row of n-2 makes no second work list row", 1,
				count("SELECT count(*) FROM notification_push_item WHERE notification_guid = 'n-2'"));

		Assert.assertEquals("One send call", 1, service.sentMessageCounts.size());
		Assert.assertEquals("One push for each subscriber, and not one for each saved location", 3,
				service.sentMessageCounts.get(0).intValue());

		Assert.assertEquals("Every row is marked sent", 0,
				count("SELECT count(*) FROM notification_push_item WHERE sent_timestamp IS NULL"));
		Assert.assertEquals("Every row carries its subscriber", 0,
				count("SELECT count(*) FROM notification_push_item WHERE subscriber_guid IS NULL"));
		Assert.assertEquals("Every row carries its expiry, for the delete job", 0,
				count("SELECT count(*) FROM notification_push_item WHERE item_expiry_timestamp IS NULL"));
	}

	@Test
	public void theNearestSavedLocationNamesThePush() throws Exception {
		service.responses.add(successes(3));

		service.pushNearMeNotifications(sqsMessage(), false, null);

		List<String> bodies = pushNotificationFactory.bodies();

		Assert.assertEquals("One body for each subscriber", 3, bodies.size());
		Assert.assertTrue("The nearest saved location of sub-1 names its push",
				bodies.stream().anyMatch(body -> body.contains("Near cabin")));
		Assert.assertFalse("A farther saved location does not",
				bodies.stream().anyMatch(body -> body.contains("Far cabin")));
		Assert.assertFalse(bodies.stream().anyMatch(body -> body.contains("Mid cabin")));
	}

	@Test
	public void aSecondDeliveryOfTheSameEventSendsNothing() throws Exception {
		service.responses.add(successes(3));
		service.pushNearMeNotifications(sqsMessage(), false, null);

		// The same event again.
		service.pushNearMeNotifications(sqsMessage(), false, null);

		Assert.assertEquals("The second delivery sends no message", 1, service.sentMessageCounts.size());
		Assert.assertEquals("And it writes no second work list row", 6,
				count("SELECT count(*) FROM notification_push_item"));
	}

	@Test
	public void aFailedSendLeavesTheRowAsUnsentWork() throws Exception {
		for (int attempt = 0; attempt < 3; attempt++) {
			service.responses.add(failures(3));
		}

		try {
			service.pushNearMeNotifications(sqsMessage(), false, null);
			Assert.fail("The event must fail, so that it stays on the queue");
		} catch (Exception expected) {
			// The consumer job leaves the message on the queue.
		}

		Assert.assertEquals("The record is kept, and not deleted", 6,
				count("SELECT count(*) FROM notification_push_item"));
		Assert.assertEquals("Every row goes back to unsent work", 6,
				count("SELECT count(*) FROM notification_push_item WHERE sent_timestamp IS NULL"));
	}

	@Test
	public void aRedeliveryAfterAFailureSendsTheUnsentRowsOnly() throws Exception {
		for (int attempt = 0; attempt < 3; attempt++) {
			service.responses.add(failures(3));
		}

		try {
			service.pushNearMeNotifications(sqsMessage(), false, null);
			Assert.fail("The event must fail");
		} catch (Exception expected) {
			// Expected.
		}

		service.sentMessageCounts.clear();
		service.responses.add(successes(3));

		service.pushNearMeNotifications(sqsMessage(), false, null);

		Assert.assertEquals("The redelivery sends the three subscribers again", 1, service.sentMessageCounts.size());
		Assert.assertEquals(3, service.sentMessageCounts.get(0).intValue());
		Assert.assertEquals("And now they are marked sent", 0,
				count("SELECT count(*) FROM notification_push_item WHERE sent_timestamp IS NULL"));
	}

	@Test
	public void aSubscriberThatCrossesAPageBoundaryStillGetsOnePush() throws Exception {
		// The work list is sub-1 x3, sub-2 x1, sub-7 x2. A page of five ends in the middle of
		// sub-7. The send pass must hold sub-7 back and join it to the next page.
		service.setAudiencePageSize(5);
		service.responses.add(successes(2));
		service.responses.add(successes(1));

		service.pushNearMeNotifications(sqsMessage(), false, null);

		Assert.assertEquals("Two pages", 2, service.sentMessageCounts.size());
		Assert.assertEquals("Page one holds the two whole subscribers", 2,
				service.sentMessageCounts.get(0).intValue());
		Assert.assertEquals("sub-7 crosses the boundary and still gets one push", 1,
				service.sentMessageCounts.get(1).intValue());

		List<String> bodies = pushNotificationFactory.bodies();
		Assert.assertEquals("Three subscribers, three pushes, and no push two times", 3, bodies.size());
		Assert.assertEquals("One push names a saved location of sub-7", 1,
				bodies.stream().filter(body -> body.contains("Lake lot") || body.contains("Town house")).count());
	}

	@Test
	public void aClaimedPageIsNotClaimedTwice() throws Exception {
		// This is what keeps two push workers on one event apart.
		int written = pushItemDao.materialiseAudience(
				new SpatialMonitorHandler().handleMessage(sqsMessage()).getGeometry(),
				"BCWS_ActiveFires_PublicView", "event-claim", new java.util.Date(), new java.util.Date(), null);

		Assert.assertEquals(6, written);

		List<NotificationDto> first = pushItemDao.claimPushItems("event-claim", "", "", 1000);
		List<NotificationDto> second = pushItemDao.claimPushItems("event-claim", "", "", 1000);

		Assert.assertEquals("The first worker takes every row", 6, first.size());
		Assert.assertTrue("The second worker takes nothing", second.isEmpty());

		Assert.assertEquals("The claim reads the token from the work list row", "token-1",
				first.get(0).getNotificationToken());
		Assert.assertNotNull("And the push item guid, so a failure can give it back",
				first.get(0).getNotificationPushItemGuid());
		Assert.assertNotNull(first.get(0).getLatitude());
		Assert.assertNotNull(first.get(0).getRadius());

		// The rows come back ordered by subscriber, so a run of rows is one subscriber.
		List<String> subscribers = first.stream().map(NotificationDto::getSubscriberGuid).toList();
		Assert.assertEquals(List.of("sub-1", "sub-1", "sub-1", "sub-2", "sub-7", "sub-7"), subscribers);
	}

	@Test
	public void aReleasedRowComesBackAsUnsentWork() throws Exception {
		pushItemDao.materialiseAudience(
				new SpatialMonitorHandler().handleMessage(sqsMessage()).getGeometry(),
				"BCWS_ActiveFires_PublicView", "event-release", new java.util.Date(), new java.util.Date(), null);

		List<NotificationDto> claimed = pushItemDao.claimPushItems("event-release", "", "", 1000);
		String released = claimed.get(0).getNotificationPushItemGuid();

		pushItemDao.releasePushItems(Collections.singletonList(released), "event-release");

		List<NotificationDto> again = pushItemDao.claimPushItems("event-release", "", "", 1000);

		Assert.assertEquals("Only the released row comes back", 1, again.size());
		Assert.assertEquals(released, again.get(0).getNotificationPushItemGuid());
	}

	@Test
	public void aDeadTokenIsClearedAndItsRowStaysSent() throws Exception {
		service.responses.add(List.of(TestSendResponses.success("m-1"),
				TestSendResponses.failure(MessagingErrorCode.UNREGISTERED, ErrorCode.NOT_FOUND),
				TestSendResponses.success("m-3")));

		service.pushNearMeNotifications(sqsMessage(), false, null);

		Assert.assertEquals("One bulk update for the dead token", 1, settingsDao.clearDeviceTokensCalls);
		Assert.assertEquals(Collections.singletonList("sub-2"), settingsDao.clearedSubscriberGuids);
		Assert.assertEquals("A dead token has nothing to try again, so its row stays sent", 0,
				count("SELECT count(*) FROM notification_push_item WHERE sent_timestamp IS NULL"));
	}

	private static List<SendResponse> successes(int count) {
		List<SendResponse> result = new ArrayList<>();
		for (int i = 0; i < count; i++) {
			result.add(TestSendResponses.success("m-" + i));
		}

		return result;
	}

	private static List<SendResponse> failures(int count) {
		List<SendResponse> result = new ArrayList<>();
		for (int i = 0; i < count; i++) {
			result.add(TestSendResponses.failure(MessagingErrorCode.UNAVAILABLE, ErrorCode.UNAVAILABLE));
		}

		return result;
	}

	// ------------------------------------------------------------------ the plumbing

	/** The real DAO, the real mapper and the real XML. Only Spring is left out. */
	private static NotificationPushItemDao newPushItemDao(DataSource dataSource) throws Exception {
		SqlSessionFactoryBean factoryBean = new SqlSessionFactoryBean();
		factoryBean.setDataSource(dataSource);

		org.apache.ibatis.session.Configuration configuration = new org.apache.ibatis.session.Configuration();
		configuration.addMapper(NotificationPushItemMapper.class);
		factoryBean.setConfiguration(configuration);
		factoryBean.afterPropertiesSet();

		SqlSessionFactory sqlSessionFactory = factoryBean.getObject();
		NotificationPushItemMapper mapper = new SqlSessionTemplate(sqlSessionFactory)
				.getMapper(NotificationPushItemMapper.class);

		NotificationPushItemDaoImpl dao = new NotificationPushItemDaoImpl();
		Field field = NotificationPushItemDaoImpl.class.getDeclaredField("mapper");
		field.setAccessible(true);
		field.set(dao, mapper);

		return dao;
	}

	private static void runScript(DataSource dataSource, String resource) throws Exception {
		String sql;
		try (InputStream in = AudienceReadIntegrationTest.class.getClassLoader().getResourceAsStream(resource)) {
			Assert.assertNotNull("Cannot find " + resource, in);
			sql = new String(in.readAllBytes(), StandardCharsets.UTF_8);
		}

		try (Connection connection = dataSource.getConnection(); Statement statement = connection.createStatement()) {
			statement.execute(sql);
		}
	}

	private long count(String sql) throws Exception {
		try (Connection connection = dataSource.getConnection();
				Statement statement = connection.createStatement();
				ResultSet rs = statement.executeQuery(sql)) {
			rs.next();

			return rs.getLong(1);
		}
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

	/** The only stub. FCM never runs. */
	private static class TestService extends WildfirePushNotificationServiceV2Impl {

		private final List<List<SendResponse>> responses = new ArrayList<>();
		private final List<Integer> sentMessageCounts = Collections.synchronizedList(new ArrayList<>());

		@Override
		synchronized BatchResponse sendEach(List<com.google.firebase.messaging.Message> messages) {
			sentMessageCounts.add(messages.size());

			return TestSendResponses.batch(responses.remove(0));
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

	/** The service hands the built body to the factory. That is where the test reads it. */
	private static class FakePushNotificationFactory implements PushNotificationFactory {

		private final List<Map<String, String>> entries = Collections.synchronizedList(new ArrayList<>());

		private List<String> bodies() {
			List<String> result = new ArrayList<>();
			entries.forEach(entry -> result.add(entry.get("message")));

			return result;
		}

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

			return null;
		}
	}
}
