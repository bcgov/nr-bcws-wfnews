package ca.bc.gov.mof.wfpointid.fireweather.rest.client.v1.impl;

import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasProperty;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.Assert.assertThat;
import static org.junit.Assume.assumeThat;

import java.util.Collection;

import org.junit.BeforeClass;
import org.junit.Test;
import org.locationtech.jts.geom.Point;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.mof.wfpointid.rest.client.GeometryConverters;
import ca.bc.gov.mof.wfpointid.rest.client.v1.WildfireNewsServiceException;
import ca.bc.gov.mof.wfpointid.rest.client.v1.impl.WildfireNewsServiceImpl;
import ca.bc.gov.mof.wfpointid.wfnews.rest.v1.resource.SimplePublishedIncidentResource;

public class WildfireNewsServiceImplTest {

	private static final Logger logger = LoggerFactory.getLogger(WildfireNewsServiceImplTest.class);
	private static WildfireNewsServiceImpl service;

	@BeforeClass
	public static void setup() {
		
		// TO-DO
		String topLevelRestURL = "https://wfnews-api.test.bcwildfireservices.com/";
		
		service = new WildfireNewsServiceImpl();
		service.setTopLevelRestURL(topLevelRestURL);
	}
	
	@Test
	public void testGetNearbyNone() throws InterruptedException, WildfireNewsServiceException {
		logger.debug("<test");
		
		Point point = GeometryConverters.latLon(57.0875278, -122.5909722);

		Collection<SimplePublishedIncidentResource> incidents = service.getNearbyPublishedIncidents(point,0);
		assertThat(incidents, empty());
		
		logger.debug(">test");
	}
	
	@Test
	public void testGetNearbySome() throws InterruptedException, WildfireNewsServiceException {
		logger.debug("<test");
		
		Point point = GeometryConverters.latLon(57.0875278, -122.5909722);

		Collection<SimplePublishedIncidentResource> incidents = service.getNearbyPublishedIncidents(point,1000*1000);
		
		assumeThat(incidents, not(empty()));
		assertThat(incidents, hasItem(hasProperty("incidentNumberLabel", notNullValue())));
		
		logger.debug(">test");
	}

}
