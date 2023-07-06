package ca.bc.gov.mof.wfpointid.fireweather.rest.v1.resource;

import java.util.Date;
import java.util.Map;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown=true)
public class Weather {
	UUID id;
	UUID stationId;
	String createdBy;
	String lastModifiedBy;
	Long lastEntityUpdateTimestamp;
	Date updateDate;
  Boolean archive;
  Long weatherTimestamp;
  Double temperature;
  Double relativeHumidity;
  Double windSpeed;
  Double windDirection;
  Double barometricPressure;
  Double precipitation;
  Boolean observationValidInd;
  String observationValidComment;
  Boolean calculate;
  String businessKey;
  Double fineFuelMoistureCode;
  Double initialSpreadIndex;
  Double fireWeatherIndex;
  Map<String,?> hourlyMeasurementTypeCode;

	public UUID getId() {
		return id;
	}
	public void setId(UUID id) {
		this.id = id;
	}
	public UUID getStationId() {
		return stationId;
	}
	public void setStationId(UUID stationId) {
		this.stationId = stationId;
	}
	public String getCreatedBy() {
		return createdBy;
	}
	public void setCreatedBy(String createdBy) {
		this.createdBy = createdBy;
	}
	public String getLastModifiedBy() {
		return lastModifiedBy;
	}
	public void setLastModifiedBy(String lastModifiedBy) {
		this.lastModifiedBy = lastModifiedBy;
	}
	public Long getLastEntityUpdateTimestamp() {
		return lastEntityUpdateTimestamp;
	}
	public void setLastEntityUpdateTimestamp(Long lastEntityUpdateTimestamp) {
		this.lastEntityUpdateTimestamp = lastEntityUpdateTimestamp;
	}
	public Date getUpdateDate() {
		return updateDate;
	}
	public void setUpdateDate(Date updateDate) {
		this.updateDate = updateDate;
	}
	public Boolean getArchive() {
		return archive;
	}
	public void setArchive(Boolean archive) {
		this.archive = archive;
	}
	public Long getWeatherTimestamp() {
		return weatherTimestamp;
	}
	public void setWeatherTimestamp(Long weatherTimestamp) {
		this.weatherTimestamp = weatherTimestamp;
	}
	public Double getTemperature() {
		return temperature;
	}
	public void setTemperature(Double temperature) {
		this.temperature = temperature;
	}
	public Double getRelativeHumidity() {
		return relativeHumidity;
	}
	public void setRelativeHumidity(Double relativeHumidity) {
		this.relativeHumidity = relativeHumidity;
	}
	public Double getWindSpeed() {
		return windSpeed;
	}
	public void setWindSpeed(Double windSpeed) {
		this.windSpeed = windSpeed;
	}
	public Double getWindDirection() {
		return windDirection;
	}
	public void setWindDirection(Double windDirection) {
		this.windDirection = windDirection;
	}
	public Double getBarometricPressure() {
		return barometricPressure;
	}
	public void setBarometricPressure(Double barometricPressure) {
		this.barometricPressure = barometricPressure;
	}
	public Double getPrecipitation() {
		return precipitation;
	}
	public void setPrecipitation(Double precipitation) {
		this.precipitation = precipitation;
	}
	public Boolean getObservationValidInd() {
		return observationValidInd;
	}
	public void setObservationValidInd(Boolean observationValidInd) {
		this.observationValidInd = observationValidInd;
	}
	public String getObservationValidComment() {
		return observationValidComment;
	}
	public void setObservationValidComment(String observationValidComment) {
		this.observationValidComment = observationValidComment;
	}
	public Boolean getCalculate() {
		return calculate;
	}
	public void setCalculate(Boolean calculate) {
		this.calculate = calculate;
	}
	public String getBusinessKey() {
		return businessKey;
	}
	public void setBusinessKey(String businessKey) {
		this.businessKey = businessKey;
	}
	public Double getFineFuelMoistureCode() {
		return fineFuelMoistureCode;
	}
	public void setFineFuelMoistureCode(Double fineFuelMoistureCode) {
		this.fineFuelMoistureCode = fineFuelMoistureCode;
	}
	public Double getInitialSpreadIndex() {
		return initialSpreadIndex;
	}
	public void setInitialSpreadIndex(Double initialSpreadIndex) {
		this.initialSpreadIndex = initialSpreadIndex;
	}
	public Double getFireWeatherIndex() {
		return fireWeatherIndex;
	}
	public void setFireWeatherIndex(Double fireWeatherIndex) {
		this.fireWeatherIndex = fireWeatherIndex;
	}
	public Map<String, ?> getHourlyMeasurementTypeCode() {
		return hourlyMeasurementTypeCode;
	}
	public void setHourlyMeasurementTypeCode(Map<String, ?> hourlyMeasurementTypeCode) {
		this.hourlyMeasurementTypeCode = hourlyMeasurementTypeCode;
	}
    
    
}
