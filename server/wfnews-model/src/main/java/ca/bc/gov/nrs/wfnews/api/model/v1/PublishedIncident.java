package ca.bc.gov.nrs.wfnews.api.model.v1;

import java.util.Date;

public interface PublishedIncident{


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

	public Integer getFireZoneUnitIdentifier();

	public void setFireZoneUnitIdentifier(Integer fireZoneUnitIdentifier);

	public String getFireOfNoteInd(); 
	
	public void setFireOfNoteInd(String fireOfNoteInd); 

	public String getIncidentName(); 

	public void setIncidentName(String incidentName);

	public String getIncidentLocation(); 

	public void setIncidentLocation(String incidentLocation); 
	
	public String getIncidentOverview(); 

	public void setIncidentOverview(String incidentOverview); 
	

	public String getTraditionalTerritoryDetail();

	public void setTraditionalTerritoryDetail(String traditionalTerritoryDetail);
	
	public String getIncidentSizeType(); 

	public void setIncidentSizeType(String incidentSizeType);

	public Integer getIncidentSizeEstimatedHa(); 

	public void setIncidentSizeEstimatedHa(Integer incidentSizeEstimatedHa); 

	public Integer getIncidentSizeMappedHa(); 

	public void setIncidentSizeMappedHa(Integer incidentSizeMappedHa);
	
	public String getIncidentSizeDetail(); 

	public void setIncidentSizeDetail(String incidentSizeDetail); 
	
	public String getIncidentCauseDetail(); 

	public void setIncidentCauseDetail(String incidentCauseDetail); 
	
	public Integer getContactOrgUnitIdentifer();

	public void setContactOrgUnitIdentifer(Integer contactOrgUnitIdentifer); 

	public String getContactPhoneNumber(); 

	public void setContactPhoneNumber(String contactPhoneNumber); 

	public String getResourceDetail();

	public void setResourceDetail(String resourceDetail);
	
	public String getWildfireCrewResourcesInd(); 

	public void setWildfireCrewResourcesInd(String wildfireCrewResourcesInd); 

	public String getWildfireCrewResourcesDetail(); 

	public void setWildfireCrewResourcesDetail(String wildfireCrewResourcesDetail); 

	public String getWildfireAviationResourceInd(); 

	public void setWildfireAviationResourceInd(String wildfireAviationResourceInd); 

	public String getWildfireAviationResourceDetail(); 

	public void setWildfireAviationResourceDetail(String wildfireAviationResourceDetail); 

	public String getHeavyEquipmentResourcesInd();

	public void setHeavyEquipmentResourcesInd(String heavyEquipmentResourcesInd); 

	public String getHeavyEquipmentResourcesDetail(); 

	public void setHeavyEquipmentResourcesDetail(String heavyEquipmentResourcesDetail); 

	public String getIncidentMgmtCrewRsrcInd(); 
	
	public void setIncidentMgmtCrewRsrcInd(String incidentMgmtCrewRsrcInd); 
	
	public String getIncidentMgmtCrewRsrcDetail();

	public void setIncidentMgmtCrewRsrcDetail(String incidentMgmtCrewRsrcDetail); 

	public String getStructureProtectionRsrcInd(); 

	public void setStructureProtectionRsrcInd(String structureProtectionRsrcInd);

	public String getStructureProtectionRsrcDetail(); 

	public void setStructureProtectionRsrcDetail(String structureProtectionRsrcDetail);

	public Date getPublishedTimestamp();

	public void setPublishedTimestamp(Date publishedTimestamp); 
	
	public String getPublishedUserTypeCode();

	public void setPublishedUserTypeCode(String publishedUserTypeCode);
	
	public String getPublishedUserGuid(); 

	public void setPublishedUserGuid(String publishedUserGuid); 

	public String getPublishedUserUserId(); 

	public void setPublishedUserUserId(String publishedUserUserId); 
	
	public String getPublishedUserName(); 

	public void setPublishedUserName(String publishedUserName);

	public Date getLastUpdatedTimestamp();

	public void setLastUpdatedTimestamp(Date lastUpdatedTimestamp); 

	public Long getPublishedIncidentRevisionCount(); 
	
	public void setPublishedIncidentRevisionCount(Long publishedIncidentRevisionCount); 

	public String getContactEmailAddress(); 
	
	public void setContactEmailAddress(String contactEmailAddress);

	public Date getCreateDate();

	public void setCreateDate(Date createDate); 

	public String getCreateUser(); 

	public void setCreateUser(String createUser);
	
	public Date getUpdateDate();

	public void setUpdateDate(Date updateDate); 
	
	public String getUpdateUser();

	public void setUpdateUser(String updateUser); 
	
}