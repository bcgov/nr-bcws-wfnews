package ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints;

import java.util.List;
import java.util.Properties;

import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

import ca.bc.gov.nrs.wfnews.service.api.v1.impl.IncidentsServiceImpl;
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
	static String queryUrl = null;
	
	@Before
	public void setUp() {
		this.service = new IncidentsServiceImpl();
	}
	
	@BeforeClass
	public static void startServer() throws Exception {
		logger.debug("<startServer");
		
		
		testApplicationContext = new ClassPathXmlApplicationContext(new String[] { "classpath:/test-spring-config.xml" });
		
		Properties applicationProperties = testApplicationContext.getBean("applicationProperties", Properties.class);
		
		queryUrl = applicationProperties.getProperty("wfnews-agol-query.url");
		Assert.assertNotNull(queryUrl);
		
		for(String key:applicationProperties.stringPropertyNames()) {
			
			String value = applicationProperties.getProperty(key);
			logger.debug(key+"="+value);
			
			System.setProperty(key, value);
		}
						
		logger.debug(">startServer");
	}

	@After
	public void teardown() {
		this.service = null;
	}

	@Test
	public void testGetIncidentsByID() {
		this.service.setAgolQueryUrl(queryUrl);
        IncidentResource incidentResource = this.service.getIncidentByID("391");
        Assert.assertNotNull(incidentResource.getFireID());
        Assert.assertTrue(incidentResource.getFireID().equals(391));
	}
	
	@Test
	public void testGetIncidents() {
		this.service.setAgolQueryUrl(queryUrl);
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