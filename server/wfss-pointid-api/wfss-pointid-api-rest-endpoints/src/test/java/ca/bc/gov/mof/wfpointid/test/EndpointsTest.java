package ca.bc.gov.mof.wfpointid.test;

import java.util.Properties;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

import javax.sql.DataSource;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.BeforeAll;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

import ca.bc.gov.test.jetty.EmbeddedServer;

public abstract class EndpointsTest {

	private static final Logger logger = LoggerFactory.getLogger(EndpointsTest.class);

	// Requires VPN + INT endpoints. Run with -Dwfnews.it=true.
	protected static boolean skipTests = !Boolean.getBoolean("wfnews.it");

	protected static final int port = 8889;
	protected static final String contextPath = "/wfss-pointid";
	protected static final String topLevelRestURL = "http://localhost:" + port + contextPath + "/";

	protected static ApplicationContext testApplicationContext;

	@BeforeAll
	public static void startServer() throws Exception {
		logger.debug("<startServer");

		Assumptions.assumeFalse(skipTests, "Requires VPN + INT endpoints; run with -Dwfnews.it=true");

		System.setProperty("webade-bootstrap-override-directory-location", "src/test/resources");
		System.setProperty("user-info-file-location", "src/test/resources/webade-xml-user-info.xml");
		
		try (InputStream is = EndpointsTest.class.getResourceAsStream("/test.properties")) {
			Properties p = new Properties();
			p.load(is);
			for (String name : p.stringPropertyNames()) {
				System.setProperty(name, p.getProperty(name));
			}
		}
		
		testApplicationContext = new ClassPathXmlApplicationContext(new String[] { "classpath:/test-spring-config.xml" });
		
		Map<String, DataSource> dataSources = new HashMap<String, DataSource>();

		EmbeddedServer.startIfRequired(port, contextPath, dataSources);

		logger.debug(">startServer");
	}

	@AfterAll
	public static void stopServer() throws Exception {
		EmbeddedServer.stop();
		logger.debug("stopServer");
	}
}
