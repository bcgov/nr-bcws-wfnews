package ca.bc.gov.test.jetty;

import java.util.Map;

import javax.sql.DataSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.ConfigurableApplicationContext;

import ca.bc.gov.mof.wfpointid.PointIdServiceApplication;

/**
 * wfss-pointid-api is a real Spring Boot app (unlike the Jersey/WAR-style modules), so the
 * simplest, highest-fidelity way to stand it up for tests is to boot it exactly as production
 * does: SpringApplication.run against the real embedded Tomcat, not a hand-rolled container.
 */
public class EmbeddedServer {

	private static final Logger logger = LoggerFactory.getLogger(EmbeddedServer.class);

	private static ConfigurableApplicationContext context;

	public static void startIfRequired(int port, String contextPath, Map<String, DataSource> dataSources) throws Exception {
		logger.debug("<startIfRequired " + port + "/" + contextPath);

		if (context == null) {
			context = new SpringApplicationBuilder(PointIdServiceApplication.class)
					.properties("server.port=" + port)
					.properties("server.servlet.context-path=" + contextPath)
					.build()
					.run();
		}

		logger.debug(">startIfRequired");
	}

	public static void stop() throws Exception {
		if (context != null) {
			context.close();
			context = null;
		}
	}
}
