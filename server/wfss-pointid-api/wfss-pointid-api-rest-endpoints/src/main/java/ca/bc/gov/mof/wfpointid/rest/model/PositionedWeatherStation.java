package ca.bc.gov.mof.wfpointid.rest.model;

public class PositionedWeatherStation extends WeatherStation {

	double lat;
	double lon;

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
