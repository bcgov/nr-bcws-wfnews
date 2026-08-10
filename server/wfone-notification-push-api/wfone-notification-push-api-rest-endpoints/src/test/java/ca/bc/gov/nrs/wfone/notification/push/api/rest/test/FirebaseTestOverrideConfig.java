package ca.bc.gov.nrs.wfone.notification.push.api.rest.test;

import org.easymock.EasyMock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.google.firebase.messaging.FirebaseMessaging;

/**
 * Overrides the production {@code getFireBaseMessenger} bean for tests: the real bean calls
 * GoogleCredentials.fromStream(...).refreshAccessToken() against live GCP credentials, which
 * a local test environment does not have. Bean definition overriding (same bean name) swaps in
 * a harmless nice mock so the Spring context can boot; tests that care about push behaviour
 * replace it again with their own controlled mock in @BeforeAll.
 */
@Configuration
public class FirebaseTestOverrideConfig {

	@Bean
	public FirebaseMessaging getFireBaseMessenger() {
		return EasyMock.createNiceMock(FirebaseMessaging.class);
	}
}
