package ca.bc.gov.mof.wfpointid.rest.model;

import java.text.SimpleDateFormat;
import java.util.Date;

public abstract class QueryResource extends ErrorResource {
	private static SimpleDateFormat jsonDateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
	
	double lat;
	double lon;
	private String timestamp;
	
	public QueryResource() {
		timestamp = jsonDateFormat.format(new Date());
	}
	
	public String getTimestamp() {
		return timestamp;
	}

	public void setErrorMsg(String errorMsg) {
		this.errorMsg = errorMsg;
	}

	public double getLat() {
		return lat;
	}
	public void setLat(double lat) {
		this.lat = lat;
	}
	public double getLon() {
		return lon;
	}
	public void setLon(double lon) {
		this.lon = lon;
	}

	
}
