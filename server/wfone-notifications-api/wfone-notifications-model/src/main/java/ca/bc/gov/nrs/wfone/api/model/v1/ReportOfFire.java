package ca.bc.gov.nrs.wfone.api.model.v1;

import java.util.Date;
import java.util.List;

public interface ReportOfFire<P extends WildfireParty<?>, F extends ForestFuel> extends IncidentMessage {

	public Integer getReportOfFireNumber();
	public void setReportOfFireNumber(Integer reportOfFireNumber);

	public String getReportOfFireTypeCode();
	public void setReportOfFireTypeCode(String reportOfFireTypeCode);

	public Integer getWildfireYear();
	public void setWildfireYear(Integer wildfireYear);

	public Date getReportedDate();
	public void setReportedDate(Date reportedDate);

	public String getReportedByName();
	public void setReportedByName(String reportedByName);

	public Double getLatitude();
	public void setLatitude(Double latitude);

	public Double getLongitude();
	public void setLongitude(Double longitude);

	public Integer getElevationMeters();
	public void setElevationMeters(Integer elevationMeters);

	public String getFireLocationPoint();
	public void setFireLocationPoint(String fireLocationPoint);

	public String getReceivedByUserId();
	public void setReceivedByUserId(String receivedByUserId);

	public String getReceivedByUserGuid();
	public void setReceivedByUserGuid(String receivedByUserGuid);

	public Date getReceivedTimestamp();
	public void setReceivedTimestamp(Date receivedTimestamp);

	public P getReportedByParty();
	public void setReportedByParty(P reportedByParty);

	public List<F> getReportedForestFuel();
	public void setReportedForestFuel(List<F> reportedForestFuel);

	public String getFireCentreOrgUnitIdentifier();
	public void setFireCentreOrgUnitIdentifier(String fireCentreOrgUnitIdentifier);

	public String getFireCentreOrgUnitName();
	public void setFireCentreOrgUnitName(String fireCentreOrgUnitName);

	public String getFireCentreOrgUnitCharacterAlias();
	public void setFireCentreOrgUnitCharacterAlias(String fireCentreOrgUnitCharacterAlias);
	
	public String getZoneOrgUnitIdentifier();
	public void setZoneOrgUnitIdentifier(String zoneOrgUnitIdentifier);

	public String getZoneOrgUnitName();
	public void setZoneOrgUnitName(String zoneOrgUnitName);

	public String getZoneOrgUnitCharacterAlias();
	public void setZoneOrgUnitCharacterAlias(String zoneOrgUnitCharacterAlias);
}