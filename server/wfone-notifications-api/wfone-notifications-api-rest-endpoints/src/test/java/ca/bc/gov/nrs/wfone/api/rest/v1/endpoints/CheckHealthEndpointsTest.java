package ca.bc.gov.nrs.wfone.api.rest.v1.endpoints;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import ca.bc.gov.nrs.wfone.api.rest.test.EndpointsTest;
import ca.bc.gov.nrs.wfone.common.rest.client.RestClientServiceException;

public class CheckHealthEndpointsTest extends EndpointsTest {

	private static final Logger logger = LoggerFactory.getLogger(CheckHealthEndpointsTest.class);

	private static final ObjectMapper mapper = new ObjectMapper();

	@Test
	public void testNoAuthorization() throws RestClientServiceException, Exception {
		logger.debug("<testNoAuthorization");

		if (skipTests) {
			logger.warn("Skipping tests");
			return;
		}

		HttpClient client = HttpClient.newHttpClient();
		HttpRequest request = HttpRequest.newBuilder()
				.uri(URI.create(topLevelRestURL + "checkHealth?callstack=test"))
				.header("Accept", "application/json")
				.GET()
				.build();
		HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

		Assertions.assertEquals(200, response.statusCode(), "checkHealth should return 200: " + response.body());

		JsonNode body = mapper.readTree(response.body());
		Assertions.assertEquals("WFONE_NOTIFICATIONS_API", body.path("componentIdentifier").asText());
		Assertions.assertEquals("Wildfire Notifications Rest API", body.path("componentName").asText());
		Assertions.assertFalse(body.path("validationStatus").isMissingNode(), "checkHealth must report a validation status");

		logger.debug(">testNoAuthorization");
	}

}
