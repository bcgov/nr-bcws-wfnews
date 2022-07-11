package ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.sql.DataSource;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

import ca.bc.gov.nrs.wfnews.service.api.v1.impl.IncidentsServiceImpl;
import ca.bc.gov.nrs.wfone.common.utils.ApplicationContextProvider;
import ca.bc.gov.test.jetty.EmbeddedServer;
import ca.bc.gov.nrs.wfnews.service.api.v1.IncidentsService;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.IncidentResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.IncidentListResource;

public class IncidentsEndpointsTest {
	
	private static final Logger logger = LoggerFactory.getLogger(IncidentsEndpointsTest.class);
	protected static final int port = 8889;
	protected static final String contextPath = "/wfnews-api/v1";
	protected IncidentsService service;
	protected static ApplicationContext testApplicationContext;
	protected static ApplicationContext webApplicationContext;
	
	@Before
	public void setUp() {
		this.service = new IncidentsServiceImpl();
	}
	
	@BeforeClass
	public static void startServer() throws Exception {
		logger.debug("<startServer");
		
		
		testApplicationContext = new ClassPathXmlApplicationContext(new String[] { "classpath:/test-spring-config.xml" });
		
		Properties applicationProperties = testApplicationContext.getBean("applicationProperties", Properties.class);
		
		for(String key:applicationProperties.stringPropertyNames()) {
			
			String value = applicationProperties.getProperty(key);
			logger.debug(key+"="+value);
			
			System.setProperty(key, value);
		}
				
		Map<String, DataSource> dataSources = new HashMap<String, DataSource>();

		EmbeddedServer.startIfRequired(port, contextPath, dataSources);
		
		logger.debug(">startServer");
	}

	@After
	public void teardown() {
		this.service = null;
	}
	
	@AfterClass
	public static void stopServer() throws Exception {
		EmbeddedServer.stop();
		logger.debug("stopServer");
	}

	@Test
	public void testGetIncidentsByID() {
		IncidentResource incidentResource = null;
		incidentResource = this.service.getIncidentByID("393");
		Assert.assertNotNull(incidentResource);
	}
	
	@Test
	public void testGetIncidents() {
		String status = "Being held";
		String date = "2022-06-30";
		Double minLatitude = 55.0;
		Double maxLatitude = 57.0;
		Double minLongitude = -127.0;
		Double maxLongitude = -125.0;
		
		IncidentListResource incidentListResource = null;
		incidentListResource = this.service.getIncidents(status, date, minLatitude, maxLatitude, minLongitude, maxLongitude);
		Assert.assertNotNull(incidentListResource);
		List<IncidentResource> incidents = incidentListResource.getCollection();
		Assert.assertNotNull(incidents);
		
	}
	
	
}