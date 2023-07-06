package ca.bc.gov.mof.wfpointid.rest.model;

public class GeographyResource extends QueryResource {
	String fuelType;
	Integer slope;
	Integer aspect;
	Integer elevation;
	String mapsheet;
	String vegLabel;
	String bioGeoClimaticZone;
	
	public String getFuelType() {
		return fuelType;
	}
	public void setFuelType(String fuelType) {
		this.fuelType = fuelType;
	}
	
	public Integer getSlope() {
		return slope;
	}
	public void setSlope(Integer slope) {
		this.slope = slope;
	}
	public Integer getAspect() {
		return aspect;
	}
	public void setAspect(Integer aspect) {
		this.aspect = aspect;
	}
	public Integer getElevation() {
		return elevation;
	}
	public void setElevation(Integer elevation) {
		this.elevation = elevation;
	}
	
	public String getMapsheet() {
		return mapsheet;
	}
	public void setMapsheet(String mapsheet) {
		this.mapsheet = mapsheet;
	}
	public String getVegLabel() {
		return vegLabel;
	}
	public void setVegLabel(String vegLabel) {
		this.vegLabel = vegLabel;
	}
	public String getBioGeoClimaticZone() {
		return bioGeoClimaticZone;
	}
	public void setBioGeoClimaticZone(String bioGeoClimaticZone) {
		this.bioGeoClimaticZone = bioGeoClimaticZone;
	}
	
	
}
