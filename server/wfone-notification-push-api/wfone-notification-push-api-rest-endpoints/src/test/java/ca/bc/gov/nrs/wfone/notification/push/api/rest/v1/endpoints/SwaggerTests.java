package ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.endpoints;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.databind.ObjectMapper;

import ca.bc.gov.nrs.common.wfone.rest.resource.HeaderConstants;
import ca.bc.gov.nrs.wfone.common.rest.client.RestClientServiceException;
import ca.bc.gov.nrs.wfone.notification.push.api.rest.client.v1.WildfireNotificationPushService;
import ca.bc.gov.nrs.wfone.notification.push.api.rest.client.v1.impl.WildfireNotificationPushServiceImpl;
import ca.bc.gov.nrs.wfone.notification.push.api.rest.test.EndpointsTest;
import ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.endpoints.security.Scopes;

public class SwaggerTests extends EndpointsTest {
	private static final Logger logger = LoggerFactory.getLogger(SwaggerTests.class);

	protected static final String scope = getScopeString(Scopes.GET_TOPLEVEL);

	private static ObjectMapper mapper = new ObjectMapper();

	@Test
	@SuppressWarnings("unchecked")
	public void testSwagger() throws RestClientServiceException {
		logger.debug("<testSwagger");

		if (skipTests) {
			logger.warn("Skipping tests");
			return;
		}

		WildfireNotificationPushService service = new WildfireNotificationPushServiceImpl();
		((WildfireNotificationPushServiceImpl) service).setTopLevelRestURL(topLevelRestURL);

		String resource = service.getSwaggerString();
		logger.debug(resource);
		Assertions.assertNotNull(resource);

		Map<String, Object> map = null;
		try {
			map = mapper.readValue(resource, Map.class);
		} catch (IOException e) {
			logger.debug(e.getMessage());
		}
		Assertions.assertNotNull(map);

		Map<String, Object> info = (Map<String, Object>) map.get("info");
		Assertions.assertNotNull(info, "Missing info");

		Map<String, Object> components = (Map<String, Object>) map.get("components");
		Assertions.assertNotNull(components, "Missing components");

		Assertions.assertEquals(1, components.size());

		Map<String, Object> schemas = (Map<String, Object>) components.get("schemas");
		Assertions.assertNotNull(schemas, "Missing schemas");

		for (String schemaKey : schemas.keySet()) {
			logger.debug(schemaKey);

			Map<String, Object> schema = (Map<String, Object>) schemas.get(schemaKey);
			Assertions.assertNotNull(schema, "Missing schema");

			Map<String, Object> properties = (Map<String, Object>) schema.get("properties");

			Map<String, Object> xml = (Map<String, Object>) schema.get("xml");

			if (properties != null && xml != null) {

				Map<String, Object> typeProperty = (Map<String, Object>) properties.get("@type");
				Assertions.assertNotNull(typeProperty, schemaKey + " is missing typeProperty");

				Assertions.assertNotNull(typeProperty, "missing typeProperty");
			}
		}

		Map<String, Object> paths = (Map<String, Object>) map.get("paths");
		Assertions.assertNotNull(paths, "Missing paths");

		for (String pathKey : paths.keySet()) {
			logger.debug(pathKey);

			Map<String, Object> path = (Map<String, Object>) paths.get(pathKey);
			Assertions.assertNotNull(path, "Missing path");

			for (String methodKey : path.keySet()) {
				logger.debug(methodKey);

				Map<String, Object> method = (Map<String, Object>) path.get(methodKey);
				Assertions.assertNotNull(method, "Missing method");

				Assertions.assertNotNull(method.get("summary"), "missing summary");
				Assertions.assertFalse(method.get("summary").toString().isEmpty(), "missing summary");

				Assertions.assertNotNull(method.get("x-auth-type"), "missing x-auth-type");
				Assertions.assertFalse(method.get("x-auth-type").toString().isEmpty(), "missing x-auth-type");

				Assertions.assertNotNull(method.get("x-throttling-tier"), "missing x-throttling-tier");
				Assertions.assertFalse(method.get("x-throttling-tier").toString().isEmpty(), "missing x-throttling-tier");

				{
					List<Map<String, Object>> parameters = (List<Map<String, Object>>) method.get("parameters");
					Assertions.assertNotNull(parameters, "Missing parameters");

					boolean foundRestVersion = false;
					for (Map<String, Object> parameter : parameters) {

						String name = (String) parameter.get("name");
						logger.debug("parameter " + name);
						Assertions.assertNotNull(name, "Missing parameter name");

						if (HeaderConstants.VERSION_HEADER.equals(name)) {
							foundRestVersion = true;
						}
					}

					Assertions.assertTrue(foundRestVersion, "missing Rest-Version parameter");
					
				}

				{
					Map<String, Object> responses = (Map<String, Object>) method.get("responses");
					Assertions.assertNotNull(responses, "Missing responses");

					boolean has20x = false;
					for (String codeKey : responses.keySet()) {
						logger.debug("response " + codeKey);

						if (codeKey.startsWith("20")) {
							has20x = true;
						}

						Map<String, Object> response = (Map<String, Object>) responses.get(codeKey);
						Assertions.assertNotNull(response, "Missing response");

						Assertions.assertNotNull(response.get("description"), "missing description");
						Assertions.assertFalse(response.get("description").toString().isEmpty(), "missing description");
					}

					Assertions.assertTrue(responses.keySet().contains("500"), "missing 500 response");

					if ("get".equalsIgnoreCase(methodKey)) {
						Assertions.assertTrue(has20x, "missing 200 response");
					} else if ("post".equalsIgnoreCase(methodKey)) {
						Assertions.assertTrue(has20x, "missing 20X response");
						Assertions.assertTrue(responses.keySet().contains("400"), "missing 400 response");
					} else if ("put".equalsIgnoreCase(methodKey)) {
						Assertions.assertTrue(has20x, "missing 200 response");
						Assertions.assertTrue(responses.keySet().contains("400"), "missing 400 response");
						Assertions.assertTrue(responses.keySet().contains("404"), "missing 404 response");
						Assertions.assertTrue(responses.keySet().contains("409"), "missing 409 response");
						Assertions.assertTrue(responses.keySet().contains("412"), "missing 412 response");
					} else if ("delete".equalsIgnoreCase(methodKey)) {
						Assertions.assertTrue(has20x, "missing 20X response");
						Assertions.assertTrue(responses.keySet().contains("404"), "missing 404 response");
						Assertions.assertTrue(responses.keySet().contains("409"), "missing 409 response");
						Assertions.assertTrue(responses.keySet().contains("412"), "missing 412 response");
					}
				}

			}
		}

		logger.debug("<testSwagger");
	}

}
