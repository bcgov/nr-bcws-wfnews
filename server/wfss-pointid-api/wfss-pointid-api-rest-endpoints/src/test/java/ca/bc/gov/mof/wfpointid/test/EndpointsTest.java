package ca.bc.gov.mof.wfpointid.test;

import java.util.HashMap;
import java.util.Map;

import javax.sql.DataSource;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

import ca.bc.gov.test.jetty.EmbeddedServer;

public abstract class EndpointsTest {
	
	private static final Logger logger = LoggerFactory.getLogger(EndpointsTest.class);
	
	protected static boolean skipTests = false;

	protected static final int port = 8889;
	protected static final String contextPath = "/wfss-pointid";
	protected static final String topLevelRestURL = "http://localhost:" + port + contextPath + "/";

	protected static ApplicationContext testApplicationContext;
	
	@BeforeClass
	public static void startServer() throws Exception {
		logger.debug("<startServer");
		
		if(skipTests) {
			logger.warn("Skipping tests");
			return;
		}

		System.setProperty("webade-bootstrap-override-directory-location", "src/test/resources");
		System.setProperty("user-info-file-location", "src/test/resources/webade-xml-user-info.xml");
		
		testApplicationContext = new ClassPathXmlApplicationContext(new String[] { "classpath:/test-spring-config.xml" });
		
		Map<String, DataSource> dataSources = new HashMap<String, DataSource>();

		EmbeddedServer.startIfRequired(port, contextPath, dataSources);

		logger.debug(">startServer");
	}

	@AfterClass
	public static void stopServer() throws Exception {
		EmbeddedServer.stop();
		logger.debug("stopServer");
	}
}
