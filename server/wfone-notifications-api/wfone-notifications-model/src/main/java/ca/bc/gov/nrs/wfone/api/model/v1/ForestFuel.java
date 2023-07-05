package ca.bc.gov.nrs.wfone.api.model.v1;

import java.io.Serializable;

public interface ForestFuel extends Serializable {

	public String getOtherFuelDescription();
	public void setOtherFuelDescription(String otherFuelDescription);

	public String getForestFuelReportTypeCode();
	public void setForestFuelReportTypeCode(String forestFuelReportTypeCode);

	public String getForestFuelCategoryCode();
	public void setForestFuelCategoryCode(String forestFuelCategoryCode);

	public String getForestFuelTypeCode();
	public void setForestFuelTypeCode(String forestFuelTypeCode);

	public String getForestFuelDensityCode();
	public void setForestFuelDensityCode(String forestFuelDensityCode);

	public String getForestFuelAgeCode();
	public void setForestFuelAgeCode(String forestFuelAgeCode);
	public boolean isBlank();
}