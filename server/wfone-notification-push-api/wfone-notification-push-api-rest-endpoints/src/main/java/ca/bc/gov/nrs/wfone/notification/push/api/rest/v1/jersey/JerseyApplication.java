package ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.jersey;

import java.util.stream.Collectors;
import java.util.stream.Stream;

import jakarta.servlet.ServletConfig;
import jakarta.ws.rs.core.Context;

import org.glassfish.jersey.server.ResourceConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.swagger.v3.jaxrs2.integration.resources.AcceptHeaderOpenApiResource;
import io.swagger.v3.jaxrs2.integration.resources.OpenApiResource;
import io.swagger.v3.oas.integration.GenericOpenApiContextBuilder;
import io.swagger.v3.oas.integration.OpenApiConfigurationException;
import io.swagger.v3.oas.integration.SwaggerConfiguration;

public class JerseyApplication extends ResourceConfig {

	private static final Logger logger = LoggerFactory.getLogger(JerseyApplication.class);

	public JerseyApplication(@Context ServletConfig servletConfig) {
		super();
		logger.debug("<JerseyApplication");

		packages("ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.endpoints");
		packages("ca.bc.gov.nrs.wfone.common.api.rest.code.endpoints");
		packages("ca.bc.gov.nrs.wfone.common.rest.endpoints");

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
			new GenericOpenApiContextBuilder<>()
					.openApiConfiguration(oasConfig)
					.buildContext(true);
		} catch (OpenApiConfigurationException e) {
			throw new RuntimeException(e.getMessage(), e);
		}

		logger.debug(">JerseyApplication");
	}
}