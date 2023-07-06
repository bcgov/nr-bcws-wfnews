package ca.bc.gov.mof.wfpointid.test.util;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import ca.bc.gov.mof.wfpointid.ServiceBusyException;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequestDef;
import ca.bc.gov.mof.wfpointid.dataprovider.arcgis.ArcgisDataProvider;
import ca.bc.gov.mof.wfpointid.dataprovider.fireweather.FireweatherDataProvider;
import ca.bc.gov.mof.wfpointid.dataprovider.geoserver.GeoserverDataProvider;
import ca.bc.gov.mof.wfpointid.dataprovider.wfnews.WildfireNewsDataProvider;
import ca.bc.gov.mof.wfpointid.identify.IdentifyService;
import ca.bc.gov.mof.wfpointid.nearby.NearbyService;
import ca.bc.gov.mof.wfpointid.query.QueryDef;
import ca.bc.gov.mof.wfpointid.query.QueryEngine;
import ca.bc.gov.mof.wfpointid.query.QueryPt;
import ca.bc.gov.mof.wfpointid.query.QueryResult;
import ca.bc.gov.mof.wfpointid.util.Stopwatch;
import ca.bc.gov.mof.wfpointid.weather.FireweatherWeatherService;
import ca.bc.gov.mof.wfpointid.weather.WeatherService;

public class QueryTestUtil {

	static boolean DEBUG = false;

	public static final String URL_WF1GEOT = "https://wf1geot.nrs.gov.bc.ca/geoserver";
	public static final String URL_VIVID_GEOT = "https://d1wfbs.vividsolutions.com/geoserver";
	public static final String URL_WF1_ARCGIS = "https://services6.arcgis.com";
	public static  final String URL_BCGW = "https://openmaps.gov.bc.ca/geo/pub";
	public static  final String FIREWEATHER_CLIENT_ID = "WFSS_POINTID_REST"; 
	public static  final String FIREWEATHER_CLIENT_PASSWORD;
	public static  final String FIREWEATHER_CLIENT_OAUTH_TOKEN_URL = "https://d1api.vividsolutions.com/oauth2/v1/oauth/token?disableDeveloperFilter";
	public static  final String FIREWEATHER_CLIENT_OAUTH_SCOPES = "WFSS.* WFWX.*";
	public static  final String FIREWEATHER_CLIENT_URL = "https://d1wfapi.vividsolutions.com/wfwx-fireweather-api/";

	private static final String WFNEWS_CLIENT_URL = "https://wfnews-api.dev.bcwildfireservices.com/";
	
	static {
		Properties p = new Properties();
		try (InputStream is = QueryTestUtil.class.getResourceAsStream("/test_user.properties")) {
			p.load(is);
		} catch (NullPointerException|IOException e) {
			p.put("fireweather.password", "password");
		}
		FIREWEATHER_CLIENT_PASSWORD =  p.getProperty("fireweather.password");
	}
	
	public static QueryResult runQuery(QueryEngine engine, double lon, double lat, boolean useBufferedPoint, DataRequestDef[] dqd) throws ServiceBusyException {
		QueryPt lonlat = QueryPt.create( lon, lat);
		
		QueryDef qd = new QueryDef(dqd);
		
		Stopwatch sw = new Stopwatch();
		QueryResult result = engine.query(lonlat, null, useBufferedPoint, qd);
		
		if (DEBUG) {
			System.out.println();
			System.out.println("[" + sw.getTimeString() + "] " + result);
			System.out.println(result.toReportString());
		}
		return result;
	}
	
	public static QueryResult runQuery(QueryEngine engine, double lon, double lat, double radius, boolean useBufferedPoint, DataRequestDef[] dqd) throws ServiceBusyException {
		QueryPt lonlat = QueryPt.create( lon, lat);
		
		
		
		QueryDef qd = new QueryDef(dqd);
		
		Stopwatch sw = new Stopwatch();
		QueryResult result = engine.query(lonlat, Double.valueOf(radius), useBufferedPoint, qd);
		
		if (DEBUG) {
			System.out.println();
			System.out.println("[" + sw.getTimeString() + "] " + result);
			System.out.println(result.toReportString());
		}
		return result;
	}
	
	
	public static QueryEngine createBadHost_WF_GS() {
		QueryEngine engine = new QueryEngine();
		engine.addProvider(GeoserverDataProvider.create(IdentifyService.PROVIDER_WF_GS, "https://xwf1geot.nrs.gov.bc.ca/geoserver/wfs", 4, 1000));
		return engine;
	}
	
	public static QueryEngine createEngine_WF_GS_VIVID() {
		QueryEngine engine = new QueryEngine();
		engine.addProvider(GeoserverDataProvider.create(IdentifyService.PROVIDER_WF_GS, URL_VIVID_GEOT, 4, 1000));
		return engine;
	}

	public static QueryEngine createEngine_WF_GS() {
		QueryEngine engine = new QueryEngine();
		engine.addProvider(GeoserverDataProvider.create(IdentifyService.PROVIDER_WF_GS, URL_WF1GEOT, 4, 1000));
		return engine;
	}
	
	public static QueryEngine createEngine_WF_GS_BCGW() {
		QueryEngine engine = new QueryEngine();
		engine.addProvider(GeoserverDataProvider.create(IdentifyService.PROVIDER_WF_GS, URL_WF1GEOT, 4, 1000));
		engine.addProvider(GeoserverDataProvider.create(IdentifyService.PROVIDER_BCGW, URL_BCGW, 4, 1000));
		return engine;
	}

	public static QueryEngine createEngineNearby() {
		QueryEngine engine = new QueryEngine();
		engine.addProvider(ArcgisDataProvider.create(NearbyService.PROVIDER_WF_ARCGIS, URL_WF1_ARCGIS, 4, 1000));
		engine.addProvider(FireweatherDataProvider.create(
				NearbyService.PROVIDER_WF_FIREWEATHER, 
				FIREWEATHER_CLIENT_URL, 
				FIREWEATHER_CLIENT_ID, 
				FIREWEATHER_CLIENT_PASSWORD, 
				FIREWEATHER_CLIENT_OAUTH_TOKEN_URL, 
				FIREWEATHER_CLIENT_OAUTH_SCOPES, 
				4, 1000));
		engine.addProvider(WildfireNewsDataProvider.create(
				NearbyService.PROVIDER_WF_NEWS,
				WFNEWS_CLIENT_URL, 
				4, 1000));

		return engine;
	}
	
	public static WeatherService createServiceFireweather() {
		return new FireweatherWeatherService(
				FIREWEATHER_CLIENT_URL, 
				FIREWEATHER_CLIENT_ID, 
				FIREWEATHER_CLIENT_PASSWORD, 
				FIREWEATHER_CLIENT_OAUTH_TOKEN_URL, 
				FIREWEATHER_CLIENT_OAUTH_SCOPES);
	}
	
	
}
