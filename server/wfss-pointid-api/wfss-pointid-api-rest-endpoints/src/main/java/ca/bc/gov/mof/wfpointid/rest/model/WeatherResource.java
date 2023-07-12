package ca.bc.gov.mof.wfpointid.rest.model;

public class WeatherResource extends QueryResource {
	WeatherStation[] stations;

	public WeatherStation[] getStations() {
		return stations;
	}

	public void setStations(WeatherStation[] stations) {
		this.stations = stations;
	}
	
	
}
