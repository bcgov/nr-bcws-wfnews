package ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.endpoints;

import org.junit.Assert;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.nrs.common.wfone.rest.resource.HealthCheckResponseRsrc;
import ca.bc.gov.nrs.wfone.common.rest.client.RestClientServiceException;
import ca.bc.gov.nrs.wfone.notification.push.api.rest.client.v1.WildfireNotificationPushService;
import ca.bc.gov.nrs.wfone.notification.push.api.rest.client.v1.impl.WildfireNotificationPushServiceImpl;
import ca.bc.gov.nrs.wfone.notification.push.api.rest.test.EndpointsTest;

public class CheckHealthEndpointsTest extends EndpointsTest {
	
	private static final Logger logger = LoggerFactory.getLogger(CheckHealthEndpointsTest.class);
	
	@Test
	public void testNoAuthorization() throws RestClientServiceException {
		logger.debug("<testNoAuthorization");
		
		if(skipTests) {
			logger.warn("Skipping tests");
			return;
		}

		WildfireNotificationPushService service = new WildfireNotificationPushServiceImpl();
		((WildfireNotificationPushServiceImpl) service).setTopLevelRestURL(topLevelRestURL);
		
		HealthCheckResponseRsrc healthCheckResponse = service.getHealthCheck("test");
		
		Assert.assertNotNull(healthCheckResponse);
		
		logger.debug(">testNoAuthorization");
	}
	
}
