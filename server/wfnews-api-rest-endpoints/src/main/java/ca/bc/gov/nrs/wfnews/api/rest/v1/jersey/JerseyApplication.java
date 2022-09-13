package ca.bc.gov.nrs.wfnews.api.rest.v1.jersey;

import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.servlet.ServletConfig;
import javax.ws.rs.core.Context;

import org.glassfish.jersey.media.multipart.MultiPartFeature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.impl.TopLevelEndpointsImpl;
import ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.impl.ExternalUriEndpointImpl;
import ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.impl.IncidentsEndpointsImpl;
import ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.impl.PublicExternalUriEndpointImpl;
import ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.impl.PublicPublishedIncidentEndpointImpl;
import ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.impl.PublishedIncidentEndpointImpl;
import ca.bc.gov.nrs.wfone.common.rest.endpoints.jersey.JerseyResourceConfig;
import io.swagger.v3.jaxrs2.integration.JaxrsOpenApiContextBuilder;
import io.swagger.v3.jaxrs2.integration.resources.AcceptHeaderOpenApiResource;
import io.swagger.v3.jaxrs2.integration.resources.OpenApiResource;
import io.swagger.v3.oas.integration.OpenApiConfigurationException;
import io.swagger.v3.oas.integration.SwaggerConfiguration;

public class JerseyApplication extends JerseyResourceConfig {

	private static final Logger logger = LoggerFactory.getLogger(JerseyApplication.class);

	/**
	 * Register JAX-RS application components.
	 */
	public JerseyApplication(@Context ServletConfig servletConfig) {
		super();

		logger.debug("<JerseyApplication");
		
		register(MultiPartFeature.class);
		register(TopLevelEndpointsImpl.class);
		register(OpenApiResource.class);
		register(AcceptHeaderOpenApiResource.class);
		register(IncidentsEndpointsImpl.class);
		register(PublishedIncidentEndpointImpl.class);
		register(PublicPublishedIncidentEndpointImpl.class);
		register(ExternalUriEndpointImpl.class);
		register(PublicExternalUriEndpointImpl.class);

		SwaggerConfiguration oasConfig = new SwaggerConfiguration()
			.prettyPrint(Boolean.TRUE)
			.resourcePackages(
				Stream.of(
					"ca.bc.gov.nrs.wfone.api.rest.v1.endpoints",
					"ca.bc.gov.nrs.wfone.common.api.rest.code.endpoints",
					"ca.bc.gov.nrs.wfone.common.rest.endpoints"
				).collect(Collectors.toSet()));


        try {
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