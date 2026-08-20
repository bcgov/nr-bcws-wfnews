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
import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.model.MessageInformation;
import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.model.factory.PushNotificationFactory;
import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.monitor.handler.SpatialMonitorHandler;
import com.amazonaws.services.sqs.model.MessageAttributeValue;
import com.google.firebase.messaging.BatchResponse;
import com.google.firebase.messaging.SendResponse;
import com.google.firebase.messaging.TestSendResponses;
import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.GeometryFactory;
import org.apache.commons.dbcp2.BasicDataSource;
import org.apache.ibatis.session.SqlSessionFactory;
import org.junit.After;
import org.junit.Assert;
import org.junit.Assume;
import org.junit.Before;
import org.junit.Test;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.SqlSessionTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;

import javax.sql.DataSource;
import java.lang.reflect.Field;
import java.sql.Connection;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Measures the audience read through the Java, where load-testing/audience-read measures the
 * SQL only. The numbers are for comparison, not a prediction of production RDS times.
 *
 * It needs that harness's seeded container, and it is skipped without one. Run with
 * -Dwfnews.scale.jdbcUrl.
 */
public class AudienceReadScaleTest {

	private static final Logger logger = LoggerFactory.getLogger(AudienceReadScaleTest.class);

	private static final String JDBC_URL_PROPERTY = "wfnews.scale.jdbcUrl";

	/** The point fire near Kelowna of the harness. Approximately 53,765 recipients. */
	private static final double FIRE_LONGITUDE = -119.4960;
	private static final double FIRE_LATITUDE = 49.8880;

	/** The Okanagan evacuation order of the harness. Approximately 330,064 recipients. */
	private static final double[][] OKANAGAN_RING = {
			{-120.6, 49.2}, {-118.6, 49.2}, {-118.6, 50.6}, {-120.6, 50.6}, {-120.6, 49.2}};

	/** The harness seed writes the topic with spaces. The four constants use underscores. */
	private static final String ACTIVE_FIRES_TOPIC = "BCWS_ActiveFires_PublicView";
	private static final String EVACUATION_TOPIC = "Evacuation Orders and Alerts";

	private BasicDataSource dataSource;
	private NotificationPushItemDao pushItemDao;

	@Before
	public void setUp() throws Exception {
		String jdbcUrl = System.getProperty(JDBC_URL_PROPERTY);
		Assume.assumeNotNull("Set -D" + JDBC_URL_PROPERTY + " to run this test", jdbcUrl);

		dataSource = new BasicDataSource();
		dataSource.setDriverClassName(org.postgresql.Driver.class.getName());
		dataSource.setUrl(jdbcUrl);
		dataSource.setUsername(System.getProperty("wfnews.scale.user", "wfnews"));
		dataSource.setPassword(System.getProperty("wfnews.scale.password", "password"));
		dataSource.setMaxTotal(10);

		pushItemDao = newPushItemDao(dataSource);

		assertSeeded();
	}

	@After
	public void tearDown() throws Exception {
		if (dataSource != null) {
			dataSource.close();
		}
	}

	@Test
	public void theMaterialisePassAtScale() throws Exception {
		String itemIdentifier = "scale-materialise-point";
		deleteWorkList(itemIdentifier);

		long started = System.nanoTime();
		int written = pushItemDao.materialiseAudience(pointFire(), ACTIVE_FIRES_TOPIC, itemIdentifier, new Date(),
				expiry(), null);
		long millis = millisSince(started);

		report("Materialise pass, point fire", written, millis);

		// A second delivery must write nothing, and it must not cost a second write.
		long secondStarted = System.nanoTime();
		int again = pushItemDao.materialiseAudience(pointFire(), ACTIVE_FIRES_TOPIC, itemIdentifier, new Date(),
				expiry(), null);
		report("Materialise pass, same event again", again, millisSince(secondStarted));

		Assert.assertTrue("The harness expects approximately 53,765 recipients", written > 50000);
		Assert.assertEquals("A second delivery writes nothing", 0, again);
	}

	@Test
	public void theSendPassAtScale() throws Exception {
		String itemIdentifier = "scale-send-point";
		deleteWorkList(itemIdentifier);
		int written = pushItemDao.materialiseAudience(pointFire(), ACTIVE_FIRES_TOPIC, itemIdentifier, new Date(),
				expiry(), null);

		// The page loop of the send pass, with no FCM and no grouping. This is the JDBC row
		// transfer and the MyBatis mapping on their own.
		int pageSize = 1000;
		long pages = 0;
		long rows = 0;
		String afterSubscriberGuid = "";
		String afterPushItemGuid = "";

		long started = System.nanoTime();
		while (true) {
			List<NotificationDto> claimed = pushItemDao.claimPushItems(itemIdentifier, afterSubscriberGuid,
					afterPushItemGuid, pageSize);

			if (claimed.isEmpty()) {
				break;
			}

			NotificationDto last = claimed.get(claimed.size() - 1);
			afterSubscriberGuid = last.getSubscriberGuid();
			afterPushItemGuid = last.getNotificationPushItemGuid();
			pages++;
			rows += claimed.size();
		}
		long millis = millisSince(started);

		logger.info("### Send pass, point fire: {} rows in {} pages, {} ms, {} rows for each second",
				rows, pages, millis, rowsPerSecond(rows, millis));

		Assert.assertEquals("Every materialised row is claimed exactly one time", written, rows);
	}

	@Test
	public void theWholePushWorkerAtScale() throws Exception {
		com.amazonaws.services.sqs.model.Message sqsMessage = activeFireMessage();
		MessageInformation messageInformation = new SpatialMonitorHandler().handleMessage(sqsMessage);
		deleteWorkList(messageInformation.getItemIdentifier());

		CountingService service = newService();
		HeapSampler heap = HeapSampler.start();

		long started = System.nanoTime();
		service.pushNearMeNotifications(sqsMessage, false, null);
		long millis = millisSince(started);

		long peakHeapMb = heap.stop();
		long recipients = countWorkList(messageInformation.getItemIdentifier());

		logger.info("### Whole push worker, point fire");
		logger.info("###   recipients      {}", recipients);
		logger.info("###   FCM messages    {}", service.messages.get());
		logger.info("###   send calls      {}", service.sendCalls.get());
		logger.info("###   wall time       {} ms", millis);
		logger.info("###   throughput      {} recipients for each second", rowsPerSecond(recipients, millis));
		logger.info("###   peak heap       {} MB", peakHeapMb);

		Assert.assertTrue("The harness expects approximately 53,765 recipients", recipients > 50000);
		Assert.assertTrue("One message for each subscriber, and fewer than one for each recipient",
				service.messages.get() < recipients);
		Assert.assertEquals("Every row is sent", 0, countUnsent(messageInformation.getItemIdentifier()));
	}

	@Test
	public void theEvacuationOrderMaterialisePassAtScale() throws Exception {
		String itemIdentifier = "scale-materialise-evac";
		deleteWorkList(itemIdentifier);

		long started = System.nanoTime();
		int written = pushItemDao.materialiseAudience(okanaganEvacuationOrder(), EVACUATION_TOPIC, itemIdentifier,
				new Date(), expiry(), null);
		long millis = millisSince(started);

		report("Materialise pass, evacuation order", written, millis);

		// The old paged read cost 1,058,088 ms for the same rows.
		Assert.assertTrue("The harness expects approximately 330,064 recipients", written > 300000);
	}

	/**
	 * Approximately 3 minutes. Empty notification_push_item first, or the number is not
	 * comparable: a full work list makes the materialise pass 2.6 times slower.
	 */
	@Test
	public void theOneMillionRecipientTarget() throws Exception {
		String itemIdentifier = "scale-one-million";
		deleteWorkList(itemIdentifier);

		logger.info("### notification_push_item holds {} rows before this measurement",
				scalar("SELECT count(*) FROM notification_push_item"));

		long materialiseStarted = System.nanoTime();
		int written = pushItemDao.materialiseAudience(southernBritishColumbia(), EVACUATION_TOPIC, itemIdentifier,
				new Date(), expiry(), null);
		long materialiseMillis = millisSince(materialiseStarted);

		long subscribers = scalar("SELECT count(DISTINCT subscriber_guid) FROM notification_push_item"
				+ " WHERE item_identifier = '" + itemIdentifier + "'");

		long pages = 0;
		long rows = 0;
		String afterSubscriberGuid = "";
		String afterPushItemGuid = "";

		long sendStarted = System.nanoTime();
		while (true) {
			List<NotificationDto> claimed = pushItemDao.claimPushItems(itemIdentifier, afterSubscriberGuid,
					afterPushItemGuid, 1000);

			if (claimed.isEmpty()) {
				break;
			}

			NotificationDto last = claimed.get(claimed.size() - 1);
			afterSubscriberGuid = last.getSubscriberGuid();
			afterPushItemGuid = last.getNotificationPushItemGuid();
			pages++;
			rows += claimed.size();
		}
		long sendMillis = millisSince(sendStarted);
		long totalMillis = materialiseMillis + sendMillis;

		logger.info("### The 1,000,000 target");
		logger.info("###   recipients        {}", written);
		logger.info("###   subscribers       {}", subscribers);
		logger.info("###   materialise pass  {} ms", materialiseMillis);
		logger.info("###   send pass         {} ms in {} pages", sendMillis, pages);
		logger.info("###   audience read     {} ms", totalMillis);
		logger.info("###   throughput        {} recipients for each second", rowsPerSecond(written, totalMillis));

		Assert.assertTrue("This measurement needs more than 1,000,000 recipients", written > 1000000);
		Assert.assertEquals("Every materialised row is claimed exactly one time", written, rows);

		// Section 8 of the main plan escalates when one event regularly takes more than
		// approximately 10 minutes. The audience read alone used to pass that trigger at
		// 330,000 recipients.
		Assert.assertTrue("The audience read must stay far below the 10 minute escalation trigger",
				totalMillis < 600000);
	}

	// ------------------------------------------------------------------ the plumbing

	private CountingService newService() {
		CountingService service = new CountingService();
		service.setSpatialMonitorHandler(new SpatialMonitorHandler());
		service.setNotificationPushItemDao(pushItemDao);
		service.setNotificationSettingsDao(new NoOpSettingsDao());
		service.setPushNotificationFactory(new NoOpPushNotificationFactory());
		service.setTransactionManager(new DataSourceTransactionManager(dataSource));
		service.setWfonePushItemExpireHours("48");
		service.setPushNotificationPrefix("");
		service.setSendThreadCount(4);
		service.setAudiencePageSize(1000);

		return service;
	}

	private static Geometry pointFire() {
		Geometry geometry = new GeometryFactory().createPoint(new Coordinate(FIRE_LONGITUDE, FIRE_LATITUDE));
		geometry.setSRID(4326);

		return geometry;
	}

	/** Southern British Columbia. Approximately 1,210,585 recipients in the harness seed. */
	private static Geometry southernBritishColumbia() {
		return ring(new double[][] {{-124, 48.5}, {-114, 48.5}, {-114, 51}, {-124, 51}, {-124, 48.5}});
	}

	private static Geometry okanaganEvacuationOrder() {
		return ring(OKANAGAN_RING);
	}

	private static Geometry ring(double[][] points) {
		Coordinate[] coordinates = new Coordinate[points.length];
		for (int i = 0; i < points.length; i++) {
			coordinates[i] = new Coordinate(points[i][0], points[i][1]);
		}

		Geometry geometry = new GeometryFactory().createLineString(coordinates);
		geometry.setSRID(4326);

		return geometry;
	}

	private static com.amazonaws.services.sqs.model.Message activeFireMessage() {
		com.amazonaws.services.sqs.model.Message message = new com.amazonaws.services.sqs.model.Message();
		Map<String, MessageAttributeValue> attributes = new HashMap<>();
		MessageAttributeValue monitorType = new MessageAttributeValue();
		monitorType.setStringValue("active-fires");
		attributes.put("monitorType", monitorType);
		message.setMessageAttributes(attributes);
		message.setBody("{ \"incidentNumberLabel\": \"SCALE-1\", \"discoveryDate\": 160000000, \"latitude\": "
				+ FIRE_LATITUDE + ", \"longitude\": " + FIRE_LONGITUDE + " }");

		return message;
	}

	private static Date expiry() {
		return new Date(System.currentTimeMillis() + 48L * 60 * 60 * 1000);
	}

	private static long millisSince(long startedNanos) {
		return (System.nanoTime() - startedNanos) / 1_000_000;
	}

	private static long rowsPerSecond(long rows, long millis) {
		return millis == 0 ? rows : rows * 1000 / millis;
	}

	private static void report(String what, long rows, long millis) {
		logger.info("### {}: {} rows in {} ms, {} rows for each second", what, rows, millis,
				rowsPerSecond(rows, millis));
	}

	private void assertSeeded() throws Exception {
		long subscribers = scalar("SELECT count(*) FROM notification_settings");

		Assert.assertTrue("This test needs the seeded harness database. Found " + subscribers
				+ " subscribers, and it needs approximately 1,000,000.", subscribers > 900000);
	}

	private void deleteWorkList(String itemIdentifier) throws Exception {
		execute("DELETE FROM notification_push_item WHERE item_identifier = '" + itemIdentifier + "'");
	}

	private long countWorkList(String itemIdentifier) throws Exception {
		return scalar("SELECT count(*) FROM notification_push_item WHERE item_identifier = '" + itemIdentifier + "'");
	}

	private long countUnsent(String itemIdentifier) throws Exception {
		return scalar("SELECT count(*) FROM notification_push_item WHERE item_identifier = '" + itemIdentifier
				+ "' AND sent_timestamp IS NULL");
	}

	private long scalar(String sql) throws Exception {
		try (Connection connection = dataSource.getConnection();
				Statement statement = connection.createStatement();
				java.sql.ResultSet rs = statement.executeQuery(sql)) {
			rs.next();

			return rs.getLong(1);
		}
	}

	private void execute(String sql) throws Exception {
		try (Connection connection = dataSource.getConnection(); Statement statement = connection.createStatement()) {
			statement.execute(sql);
		}
	}

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

	/** Samples the used heap, so the page size can be judged against the container memory. */
	private static class HeapSampler {

		private final AtomicBoolean running = new AtomicBoolean(true);
		private final AtomicLong peakBytes = new AtomicLong();
		private final Thread thread;

		private HeapSampler() {
			thread = new Thread(() -> {
				Runtime runtime = Runtime.getRuntime();

				while (running.get()) {
					long used = runtime.totalMemory() - runtime.freeMemory();
					peakBytes.accumulateAndGet(used, Math::max);

					try {
						Thread.sleep(25);
					} catch (InterruptedException e) {
						Thread.currentThread().interrupt();

						return;
					}
				}
			});
			thread.setDaemon(true);
		}

		static HeapSampler start() {
			System.gc();
			HeapSampler sampler = new HeapSampler();
			sampler.thread.start();

			return sampler;
		}

		long stop() throws InterruptedException {
			running.set(false);
			thread.join(1000);

			return peakBytes.get() / (1024 * 1024);
		}
	}

	/** FCM is the one thing that is stubbed. Every message succeeds, and none is sent. */
	private static class CountingService extends WildfirePushNotificationServiceV2Impl {

		private final AtomicLong messages = new AtomicLong();
		private final AtomicLong sendCalls = new AtomicLong();

		@Override
		BatchResponse sendEach(List<com.google.firebase.messaging.Message> firebaseMessages) {
			messages.addAndGet(firebaseMessages.size());
			sendCalls.incrementAndGet();

			List<SendResponse> responses = new ArrayList<>(firebaseMessages.size());
			for (int i = 0; i < firebaseMessages.size(); i++) {
				responses.add(TestSendResponses.success("scale-" + i));
			}

			return TestSendResponses.batch(responses);
		}
	}

	private static class NoOpSettingsDao implements NotificationSettingsDao {

		@Override
		public int clearDeviceTokens(List<String> subscriberGuids, String userId) {
			return subscriberGuids.size();
		}
	}

	private static class NoOpPushNotificationFactory implements PushNotificationFactory {

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
}
