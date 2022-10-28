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

	public Boolean getFireOfNoteInd(); 
	
	public void setFireOfNoteInd(Boolean fireOfNoteInd); 

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
	
	public Boolean getWildfireCrewResourcesInd(); 

	public void setWildfireCrewResourcesInd(Boolean wildfireCrewResourcesInd); 

	public String getWildfireCrewResourcesDetail(); 

	public void setWildfireCrewResourcesDetail(String wildfireCrewResourcesDetail); 

	public Boolean getWildfireAviationResourceInd(); 

	public void setWildfireAviationResourceInd(Boolean wildfireAviationResourceInd); 

	public String getWildfireAviationResourceDetail(); 

	public void setWildfireAviationResourceDetail(String wildfireAviationResourceDetail); 

	public Boolean getHeavyEquipmentResourcesInd();

	public void setHeavyEquipmentResourcesInd(Boolean heavyEquipmentResourcesInd); 

	public String getHeavyEquipmentResourcesDetail(); 

	public void setHeavyEquipmentResourcesDetail(String heavyEquipmentResourcesDetail); 

	public Boolean getIncidentMgmtCrewRsrcInd(); 
	
	public void setIncidentMgmtCrewRsrcInd(Boolean incidentMgmtCrewRsrcInd); 
	
	public String getIncidentMgmtCrewRsrcDetail();

	public void setIncidentMgmtCrewRsrcDetail(String incidentMgmtCrewRsrcDetail); 

	public Boolean getStructureProtectionRsrcInd(); 

	public void setStructureProtectionRsrcInd(Boolean structureProtectionRsrcInd);

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
	
	public String getLatitude();
	public void setLatitude(String latitude);

	public String getLongitude();
	public void setLongitude(String longitude);

	public Date getDeclaredOutDate();
	public void setDeclaredOutDate(Date declaredOutDate);

	public String getFireCentre();
	public void setFireCentre(String fireCentre);

	public Integer getFireYear();
	public void setFireYear(Integer fireYear);
}
