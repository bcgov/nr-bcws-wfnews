package ca.bc.gov.nrs.wfnews.api.model.v1;

import java.io.Serializable;
import java.util.Date;

public interface SituationReport extends Serializable {
  public String getReportGuid();
  public void setReportGuid(String reportGuid);
  
  public Long getIncidentTeamCount();
	public void setIncidentTeamCount(Long incidentTeamCount);

  public Long getCrewCount();
	public void setCrewCount(Long crewCount);

  public Long getAviationCount();
	public void setAviationCount(Long aviationCount);

  public Long getStructureProtectionCount();
	public void setStructureProtectionCount(Long structureProtectionCount);

  public Long getHeavyEquipmentCount();
	public void setHeavyEquipmentCount(Long heavyEquipmentCount);

  public String getSituationOverview(); 
	public void setSituationOverview(String situationOverview); 

  public Date getSituationReportDate();
	public void setSituationReportDate(Date situationReportDate);

	public Date getCreatedTimestamp();
	public void setCreatedTimestamp(Date createdTimestamp);

	public Boolean getArchivedInd();
	public void setArchivedInd(Boolean archivedInd);

	public Boolean getPublishedInd();
	public void setPublishedInd(Boolean publishedInd);

	public Long getRevisionCount();
	public void setRevisionCount(Long externalUriRevisionCount);

	public Date getCreateDate();
	public void setCreateDate(Date createDate);

	public String getCreateUser();
	public void setCreateUser(String createUser);

	public Date getUpdateDate();
	public void setUpdateDate(Date updateDate);

	public String getUpdateUser();
	public void setUpdateUser(String updateUser);
}
