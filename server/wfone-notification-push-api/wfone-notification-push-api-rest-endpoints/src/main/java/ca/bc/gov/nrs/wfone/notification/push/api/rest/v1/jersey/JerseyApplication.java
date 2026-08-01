package ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.jersey;

import java.util.stream.Collectors;
import java.util.stream.Stream;

import jakarta.servlet.ServletConfig;
import jakarta.ws.rs.core.Context;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.nrs.wfone.common.rest.endpoints.jersey.JerseyResourceConfig;
import ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.endpoints.impl.PushNearMeNotificationsEndpointImpl;
import ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.endpoints.impl.TopLevelEndpointsImpl;
import io.swagger.v3.jaxrs2.integration.JaxrsOpenApiContextBuilder;
import io.swagger.v3.jaxrs2.integration.resources.AcceptHeaderOpenApiResource;
import io.swagger.v3.jaxrs2.integration.resources.OpenApiResource;
import io.swagger.v3.oas.integration.OpenApiConfigurationException;
import io.swagger.v3.oas.integration.SwaggerConfiguration;

public class JerseyApplication extends JerseyResourceConfig {

	private static final Logger logger = LoggerFactory.getLogger(JerseyApplication.class);

	public JerseyApplication(@Context ServletConfig servletConfig) {
		super();
		logger.debug("<JerseyApplication");

		// packages(...) classpath scanning picks up both an endpoint interface (which carries the
		// @Path annotations) and its Impl class as separate root resources for the same path,
		// which Jersey either rejects as ambiguous or, worse, tries to instantiate the abstract
		// interface directly. Register concrete Impl classes explicitly instead, matching the
		// other JAX-RS modules in this codebase (wfnews-api, wfone-notifications-api).
		register(TopLevelEndpointsImpl.class);
		register(PushNearMeNotificationsEndpointImpl.class);

		register(OpenApiResource.class);
		register(AcceptHeaderOpenApiResource.class);

		SwaggerConfiguration oasConfig = new SwaggerConfiguration()
			.prettyPrint(Boolean.TRUE)
			.resourcePackages(
				Stream.of(
					"ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.endpoints",
					"ca.bc.gov.nrs.wfone.common.api.rest.code.endpoints",
					"ca.bc.gov.nrs.wfone.common.rest.endpoints"
				).collect(Collectors.toSet()));

		try {
			// .application(this) scopes the swagger-core reader to this ResourceConfig's own
			// resourcePackages-matched classes; without it (the bug this replaces),
			// OpenApiResource itself leaks into the generated document as an undocumented
			// "/openapi.json" path. Matches wfnews-api and wfone-notifications-api.
			new JaxrsOpenApiContextBuilder<JaxrsOpenApiContextBuilder<?>>()
					.servletConfig(servletConfig)
					.application(this)
					.openApiConfiguration(oasConfig)
					.buildContext(true);
		} catch (OpenApiConfigurationException e) {
			throw new RuntimeException(e.getMessage(), e);
		}

		logger.debug(">JerseyApplication");
	}
}