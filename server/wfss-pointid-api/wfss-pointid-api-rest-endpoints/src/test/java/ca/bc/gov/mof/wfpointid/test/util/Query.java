package ca.bc.gov.mof.wfpointid.test.util;

public class Query {
	public static final String RESOURCE_WEATHER = "https://i1bcwsapi.nrs.gov.bc.ca/wfss-pointid-api/weather";
	
	public static String query(String resource, double lon, double lat) {
		String query = resource + "?lat=" + lat + "&lon=" + lon;
		return query;
	}
	
	public static String weather(double lon, double lat, String hour) {
		String query = query(RESOURCE_WEATHER, lon, lat);
		return query + "&hour=" + hour;
	}
	
}
