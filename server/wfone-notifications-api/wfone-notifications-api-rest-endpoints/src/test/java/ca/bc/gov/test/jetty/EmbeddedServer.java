package ca.bc.gov.test.jetty;

import java.net.URI;
import java.util.Map;

import javax.sql.DataSource;

import org.glassfish.jersey.test.DeploymentContext;
import org.glassfish.jersey.test.ServletDeploymentContext;
import org.glassfish.jersey.test.grizzly.GrizzlyWebTestContainerFactory;
import org.glassfish.jersey.test.spi.TestContainer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.context.ContextLoaderListener;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;

import ca.bc.gov.nrs.wfone.api.rest.v1.jersey.JerseyApplication;
import ca.bc.gov.nrs.wfone.api.rest.v1.spring.EndpointsSpringConfig;

public class EmbeddedServer {

	private static final Logger logger = LoggerFactory.getLogger(EmbeddedServer.class);

	private static TestContainer container;

	public static void startIfRequired(int port, String contextPath, Map<String, DataSource> dataSources) throws Exception {
		logger.debug("<startIfRequired " + port + "/" + contextPath);

		if (container == null) {

			DeploymentContext deploymentContext = ServletDeploymentContext.builder(JerseyApplication.class)
					.initParam("jakarta.ws.rs.Application", JerseyApplication.class.getName())
					.addListener(ContextLoaderListener.class)
					.contextParam("contextClass", AnnotationConfigWebApplicationContext.class.getName())
					.contextParam("contextConfigLocation", EndpointsSpringConfig.class.getName())
					.contextPath(contextPath)
					.build();

			container = new GrizzlyWebTestContainerFactory().create(URI.create("http://localhost:" + port + "/"), deploymentContext);
			container.start();
		}

		logger.debug(">startIfRequired");
	}

	public static void stop() throws Exception {
		if (container != null) {
			container.stop();
			container = null;
		}
	}
}
