package ca.bc.gov.nrs.wfnews.api.model.v1;

import java.util.Date;

public interface SimplePublishedIncident {
	public String getPublishedIncidentDetailGuid();
	public void setPublishedIncidentDetailGuid(String publishedIncidentDetailGuid); 
	
	public String getIncidentGuid(); 
	public void setIncidentGuid(String incidentGuid); 
	
	public String getIncidentNumberLabel(); 
	public void setIncidentNumberLabel(String incidentNumberLabel); 

	public Date getNewsCreatedTimestamp(); 
	public void setNewsCreatedTimestamp(Date newsCreatedTimestamp); 
	
	public String getStageOfControlCode(); 
	public void setStageOfControlCode(String stageOfControlCode); 
	
	public Integer getGeneralIncidentCauseCatId(); 
	public void setGeneralIncidentCauseCatId(Integer generalIncidentCauseCatId); 

	public String getNewsPublicationStatusCode();
	public void setNewsPublicationStatusCode(String newsPublicationStatusCode); 
	
	public Date getDiscoveryDate(); 
	public void setDiscoveryDate(Date discoveryDate); 

	public Boolean getFireOfNoteInd(); 
	public void setFireOfNoteInd(Boolean fireOfNoteInd); 

	public String getIncidentName(); 
	public void setIncidentName(String incidentName);

	public String getIncidentLocation(); 
	public void setIncidentLocation(String incidentLocation); 
	
	public String getTraditionalTerritoryDetail();
	public void setTraditionalTerritoryDetail(String traditionalTerritoryDetail);

	public Integer getIncidentSizeEstimatedHa(); 
	public void setIncidentSizeEstimatedHa(Integer incidentSizeEstimatedHa); 

	public Integer getIncidentSizeMappedHa(); 
	public void setIncidentSizeMappedHa(Integer incidentSizeMappedHa);
	
	public String getIncidentSizeDetail(); 
	public void setIncidentSizeDetail(String incidentSizeDetail); 
	
	public String getIncidentCauseDetail(); 
	public void setIncidentCauseDetail(String incidentCauseDetail); 
	
	public Boolean getWildfireCrewResourcesInd(); 
	public void setWildfireCrewResourcesInd(Boolean wildfireCrewResourcesInd); 

	public Boolean getWildfireAviationResourceInd(); 
	public void setWildfireAviationResourceInd(Boolean wildfireAviationResourceInd); 

	public Boolean getHeavyEquipmentResourcesInd();
	public void setHeavyEquipmentResourcesInd(Boolean heavyEquipmentResourcesInd); 

	public Boolean getIncidentMgmtCrewRsrcInd(); 
	public void setIncidentMgmtCrewRsrcInd(Boolean incidentMgmtCrewRsrcInd); 

	public Boolean getStructureProtectionRsrcInd(); 
	public void setStructureProtectionRsrcInd(Boolean structureProtectionRsrcInd);

	public Date getPublishedTimestamp();
	public void setPublishedTimestamp(Date publishedTimestamp); 

	public Date getLastUpdatedTimestamp();
	public void setLastUpdatedTimestamp(Date lastUpdatedTimestamp); 

	public Date getCreateDate();
	public void setCreateDate(Date createDate); 
	
	public Date getUpdateDate();
	public void setUpdateDate(Date updateDate); 
	
	public String getLatitude();
	public void setLatitude(String latitude);

	public String getLongitude();
	public void setLongitude(String longitude);

	public Date getDeclaredOutDate();
	public void setDeclaredOutDate(Date declaredOutDate);

	public String getFireCentreCode();
	public void setFireCentreCode(String fireCentreCode);

	public String getFireCentreName();
	public void setFireCentreName(String fireCentreName);

	public Integer getFireYear();
	public void setFireYear(Integer fireYear);

	public String getResponseTypeCode();
	public void setResponseTypeCode(String responseTypeCode);

	public String getResponseTypeDetail();
	public void setResponseTypeDetail(String responseTypeDetail);
}
