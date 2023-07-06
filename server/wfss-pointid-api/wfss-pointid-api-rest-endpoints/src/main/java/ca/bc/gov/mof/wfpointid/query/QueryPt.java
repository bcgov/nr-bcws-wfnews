package ca.bc.gov.mof.wfpointid.query;

public class QueryPt {
	
	private double lon;
	private double lat;

	public QueryPt(double lon, double lat) {
		this.lon = lon;
		this.lat = lat;
	}

	public double getLon() {
		return lon;
	}

	public double getLat() {
		return lat;
	}

	public String toString() {
		return "[" + lon + ", " + lat + "]";
	}
	
	public static QueryPt create(double[] lonlat) {
		return new QueryPt(lonlat[0], lonlat[1]);
	}

	public static QueryPt create(double lon, double lat) {
		return new QueryPt(lon, lat);
	}
	
}
