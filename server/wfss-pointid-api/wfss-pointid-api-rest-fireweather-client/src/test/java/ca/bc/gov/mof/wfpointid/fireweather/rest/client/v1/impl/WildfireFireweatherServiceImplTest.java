package ca.bc.gov.mof.wfpointid.fireweather.rest.client.v1.impl;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasProperty;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.junit.Assert.assertThat;

import java.util.Collection;
import java.util.stream.Collectors;

import org.junit.BeforeClass;
import org.junit.Ignore;
import org.junit.Test;
import org.locationtech.jts.geom.Point;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.mof.wfpointid.rest.client.GeometryConverters;
import ca.bc.gov.mof.wfpointid.fireweather.rest.client.v1.WildfireFireweatherServiceException;
import ca.bc.gov.mof.wfpointid.fireweather.rest.v1.resource.WeatherStationResource;

public class WildfireFireweatherServiceImplTest {

	private static final Logger logger = LoggerFactory.getLogger(WildfireFireweatherServiceImplTest.class);
	private static WildfireFireweatherServiceImpl service;

	@BeforeClass
	public static void setup() {
		// TO-DO hide these
		String webadeOauth2ClientId = "WFSS_POINTID_REST"; 
		String webadeOauth2ClientSecret = "password";
		String webadeOauth2TokenUrl = "https://d1api.vividsolutions.com/oauth2/v1/oauth/token?disableDeveloperFilter";
		String scopes = "WFSS.* WFWX.*";
		String topLevelRestURL = "https://d1wfapi.vividsolutions.com/wfwx-fireweather-api/";
		
		service = new WildfireFireweatherServiceImpl(
				webadeOauth2ClientId, 
				webadeOauth2ClientSecret,
				webadeOauth2TokenUrl, 
				scopes);
		service.setTopLevelRestURL(topLevelRestURL);
	}
	
	@Test
	public void testGetWeatherStation() throws InterruptedException, WildfireFireweatherServiceException {
		logger.debug("<test");

		String stationId = "b94e0202-ba11-3afa-e053-e60a0a0a9fb2";
		
		WeatherStationResource station = service.getWeatherStation(stationId).get();
		logger.info(String.format("%s (%d) <%f, %f>", station.getDisplayLabel(), station.getStationCode(), station.getLatitude(), station.getLongitude()));
		assertThat(station, hasProperty("displayLabel", is("HOPE AP (EC)")));
		
		logger.debug(">test");
	}
	
	@Test
	public void testGetWeatherStationDoesntExist() throws InterruptedException, WildfireFireweatherServiceException {
		logger.debug("<test");
		
		String stationId = "00000000-0000-0000-0000-000000000000";
		
		assertThat(service.getWeatherStation(stationId), hasProperty("present",is(false)));

		logger.debug(">test");
	}
	
	@Test
	public void testGetWeatherStationByCode() throws InterruptedException, WildfireFireweatherServiceException {
		logger.debug("<test");
		
		int stationCode = 129;
		
		WeatherStationResource station = service.getWeatherStationByCode(stationCode).get();
		logger.info(String.format("%s (%d) <%f, %f>", station.getDisplayLabel(), station.getStationCode(), station.getLatitude(), station.getLongitude()));
		assertThat(station, hasProperty("displayLabel", is("PINK MOUNTAIN")));
		
		logger.debug(">test");
	}
	@Test
	public void testGetWeatherStationByCodeDoesntExist() throws InterruptedException, WildfireFireweatherServiceException {
		logger.debug("<test");
		
		int stationCode = 999999999;
		
		assertThat(service.getWeatherStationByCode(stationCode), hasProperty("present",is(false)));

		logger.debug(">test");
	}
	
	
	@Test
	public void testGetHourliesTSRange() throws InterruptedException, WildfireFireweatherServiceException {
		logger.debug("<test");
		
		String stationId = "bb7cb089-2aac-4734-e053-1d09228eeca8";
				
		service.getHourlies(stationId, 1621407600000L, 1621493999999L);
		
		logger.debug(">test");
	}
	
	@Test
	public void testGetDailiesTSRange() throws InterruptedException, WildfireFireweatherServiceException {
		logger.debug("<test");
		
		String stationId = "b94e0202-bc8d-3afa-e053-e60a0a0a9fb2";
				
		service.getDailies(stationId, 1621407600000L, 1621493999999L);
		
		logger.debug(">test");
	}
	
	@Test
	public void testGetNearbyWeatherStations() throws Exception {
		logger.debug("<test");

		double rDeg=0.83;
		double insideLatOffset=0.9*rDeg;
		double outsideLatOffset=1.1*rDeg;
		double insideLonOffset=insideLatOffset*Math.cos(57.0875278*Math.PI/180);
		double outsideLonOffset=outsideLatOffset*Math.cos(57.0875278*Math.PI/180);
		
		// Lat
		
		Point point = GeometryConverters.latLon(57.0875278, -122.5909722-insideLatOffset);

		Collection<WeatherStationResource> stations = service.getNearbyWeatherStations(point,50*1000);
		logger.info(stations.stream().map(station->String.format("%s (%d) <%f, %f>", station.getDisplayLabel(), station.getStationCode(), station.getLatitude(), station.getLongitude())).collect(Collectors.joining(", ", "[", "]")));
		assertThat(stations, hasItem(hasProperty("displayLabel", is("PINK MOUNTAIN"))));
		
		point = GeometryConverters.latLon(57.0875278, -122.5909722+insideLatOffset);

		stations = service.getNearbyWeatherStations(point,50*1000);
		logger.info(stations.stream().map(station->String.format("%s (%d) <%f, %f>", station.getDisplayLabel(), station.getStationCode(), station.getLatitude(), station.getLongitude())).collect(Collectors.joining(", ", "[", "]")));
		assertThat(stations, hasItem(hasProperty("displayLabel", is("PINK MOUNTAIN"))));
		
		point = GeometryConverters.latLon(57.0875278, -122.5909722-outsideLatOffset);

		stations = service.getNearbyWeatherStations(point,50*1000);
		logger.info(stations.stream().map(station->String.format("%s (%d) <%f, %f>", station.getDisplayLabel(), station.getStationCode(), station.getLatitude(), station.getLongitude())).collect(Collectors.joining(", ", "[", "]")));
		assertThat(stations, not(hasItem(hasProperty("displayLabel", is("PINK MOUNTAIN")))));
		
		point = GeometryConverters.latLon(57.0875278, -122.5909722+outsideLatOffset);

		stations = service.getNearbyWeatherStations(point,50*1000);
		logger.info(stations.stream().map(station->String.format("%s (%d) <%f, %f>", station.getDisplayLabel(), station.getStationCode(), station.getLatitude(), station.getLongitude())).collect(Collectors.joining(", ", "[", "]")));		
		assertThat(stations, not(hasItem(hasProperty("displayLabel", is("PINK MOUNTAIN")))));
		
		// Long 
		
		point = GeometryConverters.latLon(57.0875278-insideLonOffset, -122.5909722);

		stations = service.getNearbyWeatherStations(point,50*1000);
		logger.info(stations.stream().map(station->String.format("%s (%s) <%f, %f>", station.getDisplayLabel(), station.getStationCode(), station.getLatitude(), station.getLongitude())).collect(Collectors.joining(", ", "[", "]")));
		assertThat(stations, hasItem(hasProperty("displayLabel", is("PINK MOUNTAIN"))));
		
		point = GeometryConverters.latLon(57.0875278+insideLonOffset, -122.5909722);

		stations = service.getNearbyWeatherStations(point,50*1000);
		logger.info(stations.stream().map(station->String.format("%s (%s) <%f, %f>", station.getDisplayLabel(), station.getStationCode(), station.getLatitude(), station.getLongitude())).collect(Collectors.joining(", ", "[", "]")));
		assertThat(stations, hasItem(hasProperty("displayLabel", is("PINK MOUNTAIN"))));
		
		point = GeometryConverters.latLon(57.0875278-outsideLonOffset, -122.5909722);

		stations = service.getNearbyWeatherStations(point,50*1000);
		logger.info(stations.stream().map(station->String.format("%s (%s) <%f, %f>", station.getDisplayLabel(), station.getStationCode(), station.getLatitude(), station.getLongitude())).collect(Collectors.joining(", ", "[", "]")));
		assertThat(stations, not(hasItem(hasProperty("displayLabel", is("PINK MOUNTAIN")))));
		
		point = GeometryConverters.latLon(57.0875278+outsideLonOffset, -122.5909722);
		
		stations = service.getNearbyWeatherStations(point,50*1000);
		logger.info(stations.stream().map(station->String.format("%s (%s) <%f, %f>", station.getDisplayLabel(), station.getStationCode(), station.getLatitude(), station.getLongitude())).collect(Collectors.joining(", ", "[", "]")));
		assertThat(stations, not(hasItem(hasProperty("displayLabel", is("PINK MOUNTAIN")))));

		logger.debug(">test");
	}
	
	@Test
	public void testGetNearestWeatherStation() throws Exception {
		logger.debug("<test");
		
		// Points selected near point equidistant to three stations
		
		Point point = GeometryConverters.latLon(56.77026, -122.37741);

		WeatherStationResource station = service.getNearestWeatherStation(point);
		logger.info(String.format("%s (%d) <%f, %f>", station.getDisplayLabel(), station.getStationCode(), station.getLatitude(), station.getLongitude()));
		assertThat(station, hasProperty("displayLabel", is("PINK MOUNTAIN")));

		point = GeometryConverters.latLon(56.76927, -122.37453);
		station = service.getNearestWeatherStation(point);
		logger.info(String.format("%s (%d) <%f, %f>", station.getDisplayLabel(), station.getStationCode(), station.getLatitude(), station.getLongitude()));
		assertThat(station, hasProperty("displayLabel", is("WONOWON")));
		
		point = GeometryConverters.latLon(56.76817, -122.37684);
		station = service.getNearestWeatherStation(point);
		logger.info(String.format("%s (%d) <%f, %f>", station.getDisplayLabel(), station.getStationCode(), station.getLatitude(), station.getLongitude()));
		assertThat(station, hasProperty("displayLabel", is("GRAHAM")));

		logger.debug(">test");
	}
	
	@Test
	public void testGetNearestWeatherStationWithin() throws Exception {
		logger.debug("<test");
		
		// Points selected near point equidistant to three stations
		double rDeg=0.83;
		double outsideLatOffset=1.1*rDeg;
		double outsideLonOffset=outsideLatOffset*Math.cos(57.0875278*Math.PI/180);
		
		Point point = GeometryConverters.latLon(56.77026, -122.37741);

		WeatherStationResource station = service.getNearestWeatherStationWithin(point, 50*1000).get();
		logger.info(String.format("%s (%d) <%f, %f>", station.getDisplayLabel(), station.getStationCode(), station.getLatitude(), station.getLongitude()));
		assertThat(station, hasProperty("displayLabel", is("PINK MOUNTAIN")));

		point = GeometryConverters.latLon(56.76927, -122.37453);
		station = service.getNearestWeatherStationWithin(point, 50*1000).get();
		logger.info(String.format("%s (%d) <%f, %f>", station.getDisplayLabel(), station.getStationCode(), station.getLatitude(), station.getLongitude()));
		assertThat(station, hasProperty("displayLabel", is("WONOWON")));
		
		point = GeometryConverters.latLon(56.76817, -122.37684);
		station = service.getNearestWeatherStationWithin(point, 50*1000).get();
		logger.info(String.format("%s (%d) <%f, %f>", station.getDisplayLabel(), station.getStationCode(), station.getLatitude(), station.getLongitude()));
		assertThat(station, hasProperty("displayLabel", is("GRAHAM")));
		
		// Point not near any station 
		point = GeometryConverters.latLon(57.0875278+outsideLonOffset, -122.5909722);
		assertThat(service.getNearestWeatherStationWithin(point, 50*1000), hasProperty("present",is(false)));
		
		logger.debug(">test");
	}

}
