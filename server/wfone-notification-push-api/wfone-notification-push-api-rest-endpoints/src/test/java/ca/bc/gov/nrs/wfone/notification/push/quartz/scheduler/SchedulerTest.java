package ca.bc.gov.nrs.wfone.notification.push.quartz.scheduler;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.nrs.wfone.notification.push.api.rest.test.EndpointsTest;

public class SchedulerTest extends EndpointsTest {

	private static final Logger logger = LoggerFactory.getLogger(SchedulerTest.class);

	@Test
	@Disabled("Manual soak test - sleeps 5 minutes with no assertions to let the Quartz scheduler run; never appropriate for CI")
	public void testNoAuthorization() {
		logger.debug("<testNoAuthorization");
		
		if(skipTests) {
			logger.warn("Skipping tests");
			return;
		}

		try {
			Thread.sleep(5*60*1000);
		} catch (InterruptedException e) {
			// do nothing
		}
		
		logger.debug(">testNoAuthorization");
	}
	
}
