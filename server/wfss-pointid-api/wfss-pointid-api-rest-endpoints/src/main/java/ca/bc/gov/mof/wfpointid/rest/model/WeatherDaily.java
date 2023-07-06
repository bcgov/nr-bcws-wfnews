package ca.bc.gov.mof.wfpointid.rest.model;

public class WeatherDaily extends WeatherBase {
	
	String day;
	boolean forecastInd;
	Double buildupIndex;
	Double droughtCode;
	Double duffMoistureCode;
	
	public String getDay() {
		return day;
	}
	public void setDay(String day) {
		this.day = day;
	}
	public boolean isForecastInd() {
		return forecastInd;
	}
	public void setForecastInd(boolean forecastInd) {
		this.forecastInd = forecastInd;
	}
	public Double getBuildupIndex() {
		return buildupIndex;
	}

	public void setBuildupIndex(Double bui) {
		this.buildupIndex = bui;
	}

	public Double getDroughtCode() {
		return droughtCode;
	}

	public void setDroughtCode(Double dc) {
		this.droughtCode = dc;
	}

	public Double getDuffMoistureCode() {
		return duffMoistureCode;
	}

	public void setDuffMoistureCode(Double dmc) {
		this.duffMoistureCode = dmc;
	}
	

}
