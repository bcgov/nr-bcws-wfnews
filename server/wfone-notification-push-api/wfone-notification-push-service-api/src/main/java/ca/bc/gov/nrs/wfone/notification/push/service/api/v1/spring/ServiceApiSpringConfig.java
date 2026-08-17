package ca.bc.gov.nrs.wfone.notification.push.service.api.v1.spring;

import java.io.IOException;
import java.util.Arrays;
import java.util.Properties;

import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.WildfirePushNotificationServiceV2;
import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.impl.WildfirePushNotificationServiceV2Impl;
import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.monitor.handler.MonitorHandler;
import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.monitor.handler.SpatialMonitorHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.transaction.PlatformTransactionManager;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;

import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.spring.PersistenceSpringConfig;
import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.model.factory.PushNotificationFactory;
import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.validation.ModelValidator;
import org.springframework.core.io.ByteArrayResource;


@Configuration
@Import({ PersistenceSpringConfig.class })
public class ServiceApiSpringConfig {

	private static final Logger logger = LoggerFactory.getLogger(ServiceApiSpringConfig.class);

	public ServiceApiSpringConfig() {
		logger.debug("<ServiceApiSpringConfig");

		logger.debug(">ServiceApiSpringConfig");
	}

	// Beans provided by EndpointsSpringConfig
	@Autowired
	ResourceBundleMessageSource messageSource;
	@Autowired
	Properties applicationProperties;

	@Autowired
	PushNotificationFactory pushNotificationFactory;

	// Imported Spring Config
	@Autowired
	PersistenceSpringConfig persistenceSpringConfig;

	@Autowired
	PlatformTransactionManager transactionManager;

	@Bean
	public ModelValidator modelValidator() {
		ModelValidator result;

		result = new ModelValidator();
		result.setMessageSource(messageSource);

		return result;
	}

	/** One field, not one for each topic: ecs.tf sets this per monitor type already. */
	@Value("${WFONE_PUSH_ITEM_EXPIRE_HOURS}")
	private String wfonePushItemExpireHours;

	@Value("${WFONE_PUSH_NOTIFICATION_PREFIX}")
	private String pushNotificationPrefix;

	/** Recipients read from the spatial query in one page. */
	@Value("${WFONE_PUSH_NOTIFICATION_AUDIENCE_PAGE_SIZE:1000}")
	private int audiencePageSize;

	/** Pages sent at the same time. */
	@Value("${WFONE_PUSH_NOTIFICATION_SEND_THREADS:4}")
	private int sendThreadCount;

	/** Messages given to FCM in one second. Zero removes the limit. */
	@Value("${WFONE_PUSH_NOTIFICATION_FCM_PERMITS_PER_SECOND:0}")
	private double fcmPermitsPerSecond;

	@Bean()
	public WildfirePushNotificationServiceV2 wildfirePushNotificationServiceV2() {
		WildfirePushNotificationServiceV2Impl result;

		result = new WildfirePushNotificationServiceV2Impl();

		result.setWfonePushItemExpireHours(wfonePushItemExpireHours);
		result.setPushNotificationPrefix(pushNotificationPrefix);
		result.setAudiencePageSize(audiencePageSize);
		result.setSendThreadCount(sendThreadCount);
		result.setFcmPermitsPerSecond(fcmPermitsPerSecond);

		result.setSpatialMonitorHandler(spatialMonitorHandler());
		result.setSpatialQuery(persistenceSpringConfig.postgreSpatialQuery());
		result.setNotificationSettingsDao(persistenceSpringConfig.notificationSettingsDao());
		result.setNotificationPushItemDao(persistenceSpringConfig.notificationPushItemDao());
		result.setPushNotificationFactory(pushNotificationFactory);

		result.setTransactionManager(transactionManager);
		result.setFirebaseMessaging(getFireBaseMessenger());

		return result;
	}

	@Bean
	public MonitorHandler spatialMonitorHandler() {
		return new SpatialMonitorHandler();
	}

	@Value("${WFONE_FIREBASE_DB_URL}")
	private String firebaseDbUrl;

	@Value("${FIREBASE_CONFIG_JSON}")
	private String firebaseConfigJson;

	@Bean
	FirebaseMessaging getFireBaseMessenger() {
		FirebaseMessaging result;

		try {

			String[] scopes = { "https://www.googleapis.com/auth/firebase.messaging" };
			Resource resource = new ByteArrayResource(firebaseConfigJson.getBytes());
			GoogleCredentials googleCredentials = GoogleCredentials.fromStream(resource.getInputStream())
					.createScoped(Arrays.asList(scopes));
			googleCredentials.refreshAccessToken();

			// FirebaseOptions.Builder() is deprecated in firebase-admin 9.x. Use the factory.
			FirebaseOptions options = FirebaseOptions.builder().setCredentials(googleCredentials)
					.setDatabaseUrl(firebaseDbUrl).build();

			String defaultAppName = System.getProperty("firebaseAppName", FirebaseApp.DEFAULT_APP_NAME);
			FirebaseApp firebaseApp = FirebaseApp.initializeApp(options, defaultAppName);

			result = FirebaseMessaging.getInstance(firebaseApp);

		} catch (IOException e) {
			throw new RuntimeException(e);
		}

		return result;
	}
}
