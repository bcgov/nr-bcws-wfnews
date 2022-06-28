package ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints;

import org.junit.Assert;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.nrs.common.wfone.rest.resource.HealthCheckResponseRsrc;
import ca.bc.gov.nrs.wfnews.api.rest.test.EndpointsTest;
import ca.bc.gov.nrs.wfone.common.rest.client.RestClientServiceException;

public class CheckHealthEndpointsTest extends EndpointsTest {
	
	private static final Logger logger = LoggerFactory.getLogger(CheckHealthEndpointsTest.class);

	
	@Test
	public void testNoAuthorization() throws RestClientServiceException {
		logger.debug("<testNoAuthorization");
		
		if(skipTests) {
			logger.warn("Skipping tests");
			return;
		}

		logger.debug(">testNoAuthorization");
	}
}
