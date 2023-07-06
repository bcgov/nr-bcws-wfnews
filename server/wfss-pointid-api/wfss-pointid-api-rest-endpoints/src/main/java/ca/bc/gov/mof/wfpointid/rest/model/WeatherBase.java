package ca.bc.gov.mof.wfpointid.rest.model;

import ca.bc.gov.mof.wfpointid.util.GeoUtil;

public class WeatherBase {
	
	int index;
	
	Double temp;
	Integer relativeHumidity;
	Double windSpeed;
	Integer windDirection;
	String windCardinalDir;
	Double precipitation;
	Double fineFuelMoistureCode;
	Double initialSpreadIndex;
	Double fireWeatherIndex;
	

	public int getIndex() {
		return index;
	}
	public void setIndex(int index) {
		this.index = index;
	}
	public Double getTemp() {
		return temp;
	}
	public void setTemp(Double temp) {
		this.temp = temp;
	}
	public Integer getRelativeHumidity() {
		return relativeHumidity;
	}
	public void setRelativeHumidity(Integer relativeHumidity) {
		this.relativeHumidity = relativeHumidity;
	}
	public Double getWindSpeed() {
		return windSpeed;
	}
	public void setWindSpeed(Double windSpeed) {
		this.windSpeed = windSpeed;
	}
	public Integer getWindDirection() {
		return windDirection;
	}
	public void setWindDirection(Integer windDirection) {
		this.windDirection = windDirection;
	}
	public String getWindCardinalDir() {
		if (windDirection == null) return null;
		return GeoUtil.compassPoint(windDirection.doubleValue());
	}
	public Double getPrecipitation() {
		return precipitation;
	}
	public void setPrecipitation(Double precipitation) {
		this.precipitation = precipitation;
	}
	public Double getFineFuelMoistureCode() {
		return fineFuelMoistureCode;
	}
	public void setFineFuelMoistureCode(Double ffmc) {
		this.fineFuelMoistureCode = ffmc;
	}
	public Double getInitialSpreadIndex() {
		return initialSpreadIndex;
	}
	public void setInitialSpreadIndex(Double isi) {
		this.initialSpreadIndex = isi;
	}
	public Double getFireWeatherIndex() {
		return fireWeatherIndex;
	}
	public void setFireWeatherIndex(Double fireWeatherIndex) {
		this.fireWeatherIndex = fireWeatherIndex;
	}
	
}
