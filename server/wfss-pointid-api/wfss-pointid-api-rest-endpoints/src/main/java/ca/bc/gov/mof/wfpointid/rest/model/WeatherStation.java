package ca.bc.gov.mof.wfpointid.rest.model;

public class WeatherStation {
	
	int stationCode;
	String stationName;
	int elevation;
	
	WeatherHourly[] hourlyObs;
	WeatherDaily[] dailyObs;
	
	public int getStationCode() {
		return stationCode;
	}
	public void setStationCode(int stationCode) {
		this.stationCode = stationCode;
	}
	public String getStationName() {
		return stationName;
	}
	public void setStationName(String stationName) {
		this.stationName = stationName;
	}
	public int getElevation() {
		return elevation;
	}
	public void setElevation(int elevation) {
		this.elevation = elevation;
	}
	public WeatherHourly[] getHourly() {
		return hourlyObs;
	}
	public void setHourly(WeatherHourly[] hourlyObs) {
		this.hourlyObs = hourlyObs;
	}
	public WeatherDaily[] getDaily() {
		return dailyObs;
	}
	public void setDaily(WeatherDaily[] dailyObs) {
		this.dailyObs = dailyObs;
	}
	
	
	
}
