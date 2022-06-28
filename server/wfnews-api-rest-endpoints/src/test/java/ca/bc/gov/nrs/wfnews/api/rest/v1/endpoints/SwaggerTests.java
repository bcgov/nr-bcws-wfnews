package ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints;

import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import ca.bc.gov.nrs.wfnews.api.rest.test.EndpointsTest;
import ca.bc.gov.nrs.wfone.common.rest.client.RestClientServiceException;

public class SwaggerTests extends EndpointsTest {
	private static final Logger logger = LoggerFactory.getLogger(SwaggerTests.class);
	
		
	private static ObjectMapper mapper = new ObjectMapper();

	@Test
	public void testSwagger() throws JsonMappingException, JsonProcessingException, RestClientServiceException {
		logger.debug("<testSwagger");
		
		if(skipTests) {
			logger.warn("Skipping tests");
			return;
		}
		logger.debug("<testSwagger");
	}
	
}
