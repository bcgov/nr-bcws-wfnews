package ca.bc.gov.nrs.wfnews.api.model.v1;

public interface PublishedIncident extends SimplePublishedIncident {
	public Integer getFireZoneUnitIdentifier();
	public void setFireZoneUnitIdentifier(Integer fireZoneUnitIdentifier);
	
	public String getIncidentOverview(); 
	public void setIncidentOverview(String incidentOverview); 
	
	public String getIncidentSizeType(); 
	public void setIncidentSizeType(String incidentSizeType);

	public Integer getContactOrgUnitIdentifer();
	public void setContactOrgUnitIdentifer(Integer contactOrgUnitIdentifer); 

	public String getContactPhoneNumber(); 
	public void setContactPhoneNumber(String contactPhoneNumber); 

	public String getResourceDetail();
	public void setResourceDetail(String resourceDetail);

	public String getWildfireCrewResourcesDetail(); 
	public void setWildfireCrewResourcesDetail(String wildfireCrewResourcesDetail); 

	public String getWildfireAviationResourceDetail(); 
	public void setWildfireAviationResourceDetail(String wildfireAviationResourceDetail); 

	public String getHeavyEquipmentResourcesDetail(); 
	public void setHeavyEquipmentResourcesDetail(String heavyEquipmentResourcesDetail); 
	
	public String getIncidentMgmtCrewRsrcDetail();
	public void setIncidentMgmtCrewRsrcDetail(String incidentMgmtCrewRsrcDetail); 

	public String getStructureProtectionRsrcDetail(); 
	public void setStructureProtectionRsrcDetail(String structureProtectionRsrcDetail);
	
	public String getPublishedUserTypeCode();
	public void setPublishedUserTypeCode(String publishedUserTypeCode);
	
	public String getPublishedUserGuid(); 
	public void setPublishedUserGuid(String publishedUserGuid); 

	public String getPublishedUserUserId(); 
	public void setPublishedUserUserId(String publishedUserUserId); 
	
	public String getPublishedUserName(); 
	public void setPublishedUserName(String publishedUserName);

	public Long getPublishedIncidentRevisionCount(); 
	public void setPublishedIncidentRevisionCount(Long publishedIncidentRevisionCount); 

	public String getContactEmailAddress(); 
	public void setContactEmailAddress(String contactEmailAddress);

	public String getCreateUser(); 
	public void setCreateUser(String createUser);
	
	public String getUpdateUser();
	public void setUpdateUser(String updateUser);

	public Integer getCrewResourceCount();
	public void setCrewResourceCount(Integer crewResourceCount);

	public Integer getAviationResourceCount();
	public void setAviationResourceCount(Integer aviationResourceCount);

	public Integer getHeavyEquipmentResourceCount();
	public void setHeavyEquipmentResourceCount(Integer heavyEquipmentResourceCount);

	public Integer getIncidentManagementResourceCount();
	public void setIncidentManagementResourceCount(Integer incidentManagementResourceCount);

	public Integer getStructureProtectionResourceCount();
	public void setStructureProtectionResourceCount(Integer structureProtectionResourceCount);
}
