package ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.endpoints;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.junit.Assert;
import org.junit.Test;
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
		Assert.assertNotNull(resource);

		Map<String, Object> map = null;
		try {
			map = mapper.readValue(resource, Map.class);
		} catch (IOException e) {
			logger.debug(e.getMessage());
		}
		Assert.assertNotNull(map);

		Map<String, Object> info = (Map<String, Object>) map.get("info");
		Assert.assertNotNull("Missing info", info);

		Map<String, Object> components = (Map<String, Object>) map.get("components");
		Assert.assertNotNull("Missing components", components);

		Assert.assertEquals(1, components.size());

		Map<String, Object> schemas = (Map<String, Object>) components.get("schemas");
		Assert.assertNotNull("Missing schemas", schemas);

		for (String schemaKey : schemas.keySet()) {
			logger.debug(schemaKey);

			Map<String, Object> schema = (Map<String, Object>) schemas.get(schemaKey);
			Assert.assertNotNull("Missing schema", schema);

			Map<String, Object> properties = (Map<String, Object>) schema.get("properties");

			Map<String, Object> xml = (Map<String, Object>) schema.get("xml");

			if (properties != null && xml != null) {

				Map<String, Object> typeProperty = (Map<String, Object>) properties.get("@type");
				Assert.assertNotNull(schemaKey + " is missing typeProperty", typeProperty);

				Assert.assertNotNull("missing typeProperty", typeProperty);
			}
		}

		Map<String, Object> paths = (Map<String, Object>) map.get("paths");
		Assert.assertNotNull("Missing paths", paths);

		for (String pathKey : paths.keySet()) {
			logger.debug(pathKey);

			Map<String, Object> path = (Map<String, Object>) paths.get(pathKey);
			Assert.assertNotNull("Missing path", path);

			for (String methodKey : path.keySet()) {
				logger.debug(methodKey);

				Map<String, Object> method = (Map<String, Object>) path.get(methodKey);
				Assert.assertNotNull("Missing method", method);

				Assert.assertNotNull("missing summary", method.get("summary"));
				Assert.assertFalse("missing summary", method.get("summary").toString().isEmpty());

				Assert.assertNotNull("missing x-auth-type", method.get("x-auth-type"));
				Assert.assertFalse("missing x-auth-type", method.get("x-auth-type").toString().isEmpty());

				Assert.assertNotNull("missing x-throttling-tier", method.get("x-throttling-tier"));
				Assert.assertFalse("missing x-throttling-tier", method.get("x-throttling-tier").toString().isEmpty());

				{
					List<Map<String, Object>> parameters = (List<Map<String, Object>>) method.get("parameters");
					Assert.assertNotNull("Missing parameters", parameters);

					boolean foundRestVersion = false;
					// boolean foundIfMatch = false;
					for (Map<String, Object> parameter : parameters) {

						String name = (String) parameter.get("name");
						logger.debug("parameter " + name);
						Assert.assertNotNull("Missing parameter name", name);

						if (HeaderConstants.VERSION_HEADER.equals(name)) {
							foundRestVersion = true;
						} else if (HeaderConstants.IF_MATCH_HEADER.equals(name)) {
							// foundIfMatch = true;
						}
					}

					Assert.assertTrue("missing Rest-Version parameter", foundRestVersion);
					
				}

				{
					Map<String, Object> responses = (Map<String, Object>) method.get("responses");
					Assert.assertNotNull("Missing responses", responses);

					boolean has20x = false;
					for (String codeKey : responses.keySet()) {
						logger.debug("response " + codeKey);

						if (codeKey.startsWith("20")) {
							has20x = true;
						}

						Map<String, Object> response = (Map<String, Object>) responses.get(codeKey);
						Assert.assertNotNull("Missing response", response);

						Assert.assertNotNull("missing description", response.get("description"));
						Assert.assertFalse("missing description", response.get("description").toString().isEmpty());
					}

					Assert.assertTrue("missing 500 response", responses.keySet().contains("500"));

					if ("get".equalsIgnoreCase(methodKey)) {
						Assert.assertTrue("missing 200 response", has20x);
					} else if ("post".equalsIgnoreCase(methodKey)) {
						Assert.assertTrue("missing 20X response", has20x);
						Assert.assertTrue("missing 400 response", responses.keySet().contains("400"));
					} else if ("put".equalsIgnoreCase(methodKey)) {
						Assert.assertTrue("missing 200 response", has20x);
						Assert.assertTrue("missing 400 response", responses.keySet().contains("400"));
						Assert.assertTrue("missing 404 response", responses.keySet().contains("404"));
						Assert.assertTrue("missing 409 response", responses.keySet().contains("409"));
						Assert.assertTrue("missing 412 response", responses.keySet().contains("412"));
					} else if ("delete".equalsIgnoreCase(methodKey)) {
						Assert.assertTrue("missing 20X response", has20x);
						Assert.assertTrue("missing 404 response", responses.keySet().contains("404"));
						Assert.assertTrue("missing 409 response", responses.keySet().contains("409"));
						Assert.assertTrue("missing 412 response", responses.keySet().contains("412"));
					}
				}

			}
		}

		logger.debug("<testSwagger");
	}

}
