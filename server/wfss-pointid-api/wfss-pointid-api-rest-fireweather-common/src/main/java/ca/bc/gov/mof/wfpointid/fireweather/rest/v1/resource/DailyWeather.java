package ca.bc.gov.mof.wfpointid.fireweather.rest.v1.resource;

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown=true)
public class DailyWeather extends Weather {
	private Boolean startIndices;
	private Double temperatureMin;
	private Double temperatureMax;
	private Double relativeHumidityMin;
	private Double relativeHumidityMax;
	private Integer dangerForest;
	private Integer dangerGrassland;
	private Integer dangerScrub;
	private Double duffMoistureCode;
	private Double droughtCode;
	private Double buildUpIndex;
	private Object dailySeverityRating;
	private Object grasslandCuring;
	private Boolean missingHourlyData;
	private Object previousState;
	
    private Map<String,?> recordType;

	public Boolean getStartIndices() {
		return startIndices;
	}

	public void setStartIndices(Boolean startIndices) {
		this.startIndices = startIndices;
	}

	public Double getTemperatureMin() {
		return temperatureMin;
	}

	public void setTemperatureMin(Double temperatureMin) {
		this.temperatureMin = temperatureMin;
	}

	public Double getTemperatureMax() {
		return temperatureMax;
	}

	public void setTemperatureMax(Double temperatureMax) {
		this.temperatureMax = temperatureMax;
	}

	public Double getRelativeHumidityMin() {
		return relativeHumidityMin;
	}

	public void setRelativeHumidityMin(Double relativeHumidityMin) {
		this.relativeHumidityMin = relativeHumidityMin;
	}

	public Double getRelativeHumidityMax() {
		return relativeHumidityMax;
	}

	public void setRelativeHumidityMax(Double relativeHumidityMax) {
		this.relativeHumidityMax = relativeHumidityMax;
	}

	public Integer getDangerForest() {
		return dangerForest;
	}

	public void setDangerForest(Integer dangerForest) {
		this.dangerForest = dangerForest;
	}

	public Integer getDangerGrassland() {
		return dangerGrassland;
	}

	public void setDangerGrassland(Integer dangerGrassland) {
		this.dangerGrassland = dangerGrassland;
	}

	public Integer getDangerScrub() {
		return dangerScrub;
	}

	public void setDangerScrub(Integer dangerScrub) {
		this.dangerScrub = dangerScrub;
	}

	public Double getDuffMoistureCode() {
		return duffMoistureCode;
	}

	public void setDuffMoistureCode(Double duffMoistureCode) {
		this.duffMoistureCode = duffMoistureCode;
	}

	public Double getDroughtCode() {
		return droughtCode;
	}

	public void setDroughtCode(Double droughtCode) {
		this.droughtCode = droughtCode;
	}

	public Double getBuildUpIndex() {
		return buildUpIndex;
	}

	public void setBuildUpIndex(Double buildUpIndex) {
		this.buildUpIndex = buildUpIndex;
	}

	public Object getDailySeverityRating() {
		return dailySeverityRating;
	}

	public void setDailySeverityRating(Object dailySeverityRating) {
		this.dailySeverityRating = dailySeverityRating;
	}

	public Object getGrasslandCuring() {
		return grasslandCuring;
	}

	public void setGrasslandCuring(Object grasslandCuring) {
		this.grasslandCuring = grasslandCuring;
	}

	public Boolean getMissingHourlyData() {
		return missingHourlyData;
	}

	public void setMissingHourlyData(Boolean missingHourlyData) {
		this.missingHourlyData = missingHourlyData;
	}

	public Object getPreviousState() {
		return previousState;
	}

	public void setPreviousState(Object previousState) {
		this.previousState = previousState;
	}

	public Map<String, ?> getRecordType() {
		return recordType;
	}

	public void setRecordType(Map<String, ?> recordType) {
		this.recordType = recordType;
	}
	
}
