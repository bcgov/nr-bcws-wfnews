package ca.bc.gov.nrs.wfnews.service.api.v1.validation.constraints;

import java.util.Date;

import javax.validation.constraints.NotNull;

import ca.bc.gov.nrs.wfnews.service.api.v1.validation.Errors;

public interface PublishedIncidentConstraints{
	
	@NotNull(message=Errors.PUBLISHED_INCIDENT_GUID_NOTBLANK, groups=PublishedIncidentConstraints.class)
	public String getIncidentGuid();
	
	@NotNull(message=Errors.PUBLISHED_INCIDENT_LABEL_NOTBLANK, groups=PublishedIncidentConstraints.class)
	public String getIncidentNumberLabel();
	
	@NotNull(message=Errors.PUBLISHED_NEWS_CREATED_TIMESTAMP_NOTBLANK, groups=PublishedIncidentConstraints.class)
	public Date getNewsCreatedTimestamp();
	
	@NotNull(message=Errors.PUBLISHED_DISCOVERY_DATE_NOTBLANK, groups=PublishedIncidentConstraints.class)
	public Date getDiscoveryDate();
	
	@NotNull(message=Errors.PUBLISHED_FIRE_OF_NOTE_IND_NOTBLANK, groups=PublishedIncidentConstraints.class)
	public Boolean getFireOfNoteInd();
	
	@NotNull(message=Errors.PUBLISHED_WILDFIRE_CREW_IND_NOTBLANK, groups=PublishedIncidentConstraints.class)
	public Boolean getWildfireCrewResourcesInd();
	
	@NotNull(message=Errors.PUBLISHED_HEAVY_EQUPIPMENT_IND_NOTBLANK, groups=PublishedIncidentConstraints.class)
	public Boolean getHeavyEquipmentResourcesInd();
	
	@NotNull(message=Errors.PUBLISHED_INCIDENT_MGMT_CREW_NOTBLANK, groups=PublishedIncidentConstraints.class)
	public Boolean getIncidentMgmtCrewRsrcInd();
	
	@NotNull(message=Errors.PUBLISHED_STRUCTURE_PROTECTION_NOTBLANK, groups=PublishedIncidentConstraints.class)
	public Boolean getStructureProtectionRsrcInd();
	
}