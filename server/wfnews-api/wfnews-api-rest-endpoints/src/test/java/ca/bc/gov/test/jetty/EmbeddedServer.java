package ca.bc.gov.test.jetty;

import java.util.Map;
import javax.sql.DataSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class EmbeddedServer {
	
	private static final Logger logger = LoggerFactory.getLogger(EmbeddedServer.class);

	public static void startIfRequired(int port, String contextPath, Map<String, DataSource> dataSources) throws Exception {
		logger.debug("startIfRequired: " + port + "/" + contextPath);
	}

	public static void stop() throws Exception {
		logger.debug("stop EmbeddedServer");
	}
}
