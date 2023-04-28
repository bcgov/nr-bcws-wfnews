package ca.bc.gov.nrs.wfnews.persistence.v1.dto;

import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.nrs.wfnews.api.model.v1.PublishedIncident;

public class PublishedIncidentDto extends AuditDto<PublishedIncidentDto> {
	
	private static final long serialVersionUID = 1L;

	private static final Logger logger = LoggerFactory.getLogger(PublishedIncidentDto.class);
	
	private String publishedIncidentDetailGuid;
	private String incidentGuid;
	private String incidentNumberLabel;
	private Date newsCreatedTimestamp;
	private String stageOfControlCode;
	private Integer generalIncidentCauseCatId;
	private String newsPublicationStatusCode;
	private Date discoveryDate;
	private Date declaredOutDate;
	private String fireCentreCode;
	private String fireCentreName;
	private Integer fireZoneUnitIdentifier;
	private Boolean fireOfNoteInd;
	private String incidentName;
	private String incidentLocation;
	private String incidentOverview;
	private String traditionalTerritoryDetail;
	private String incidentSizeType;
	private Integer incidentSizeEstimatedHa;
	private Integer incidentSizeMappedHa;
	private String incidentSizeDetail;
	private String incidentCauseDetail;
	private Integer contactOrgUnitIdentifer;
	private String contactPhoneNumber;
	private String contactEmailAddress;
	private String resourceDetail;
	private Boolean wildfireCrewResourcesInd;
	private String wildfireCrewResourcesDetail;
	private Boolean wildfireAviationResourceInd;
	private String wildfireAviationResourceDetail;
	private Boolean heavyEquipmentResourcesInd;
	private String heavyEquipmentResourcesDetail;
	private Boolean incidentMgmtCrewRsrcInd;
	private String incidentMgmtCrewRsrcDetail;
	private Boolean structureProtectionRsrcInd;
	private String structureProtectionRsrcDetail;
	private Date publishedTimestamp;
	private String publishedUserTypeCode; 
	private String publishedUserGuid;
	private String publishedUserUserId;
	private String publishedUserName;
	private Date lastUpdatedTimestamp;
	private String longitude;
	private String latitude;
	private Integer fireYear;
	private String responseTypeCode;
	private String responseTypeDetail;
	
	public PublishedIncidentDto() {

	}
	
	public PublishedIncidentDto(PublishedIncidentDto dto) {
		this.publishedIncidentDetailGuid = dto.publishedIncidentDetailGuid;
		this.incidentGuid = dto.incidentGuid;
		this.incidentNumberLabel = dto.incidentNumberLabel;
		this.newsCreatedTimestamp = dto.newsCreatedTimestamp;
		this.stageOfControlCode = dto.stageOfControlCode;
		this.generalIncidentCauseCatId = dto.generalIncidentCauseCatId;
		this.newsPublicationStatusCode = dto.newsPublicationStatusCode;
		this.discoveryDate = dto.discoveryDate;
		this.fireZoneUnitIdentifier = dto.fireZoneUnitIdentifier;
		this.fireOfNoteInd = dto.fireOfNoteInd;
		this.incidentName = dto.incidentName;
		this.incidentLocation = dto.incidentLocation;
		this.incidentOverview = dto.incidentOverview;
		this.traditionalTerritoryDetail = dto.traditionalTerritoryDetail;
		this.incidentSizeType = dto.incidentSizeType;
		this.incidentSizeEstimatedHa = dto.incidentSizeEstimatedHa;
		this.incidentSizeMappedHa = dto.incidentSizeMappedHa;
		this.incidentSizeDetail = dto.incidentSizeDetail;
		this.incidentCauseDetail = dto.incidentCauseDetail;
		this.contactOrgUnitIdentifer = dto.contactOrgUnitIdentifer;
		this.contactPhoneNumber= dto.contactPhoneNumber;
		this.contactEmailAddress= dto.contactEmailAddress;
		this.resourceDetail = dto.resourceDetail;
		this.wildfireCrewResourcesInd = dto.wildfireCrewResourcesInd;
		this.wildfireCrewResourcesDetail = dto.wildfireCrewResourcesDetail;
		this.wildfireAviationResourceInd = dto.wildfireAviationResourceInd;
		this.wildfireAviationResourceDetail = dto.wildfireAviationResourceDetail;
		this.heavyEquipmentResourcesInd = dto.heavyEquipmentResourcesInd;
		this.heavyEquipmentResourcesDetail = dto.heavyEquipmentResourcesDetail;
		this.incidentMgmtCrewRsrcInd = dto.incidentMgmtCrewRsrcInd;
		this.incidentMgmtCrewRsrcDetail = dto.incidentMgmtCrewRsrcDetail;
		this.structureProtectionRsrcInd = dto.structureProtectionRsrcInd;
		this.structureProtectionRsrcDetail = dto.structureProtectionRsrcDetail;
		this.publishedTimestamp = dto.publishedTimestamp;
		this.publishedUserTypeCode = dto.publishedUserTypeCode; 
		this.publishedUserGuid = dto.publishedUserGuid;
		this.publishedUserUserId = dto.publishedUserUserId;
		this.publishedUserName = dto.publishedUserName;
		this.lastUpdatedTimestamp = dto.lastUpdatedTimestamp;
		this.latitude = dto.latitude;
		this.longitude = dto.longitude;
		this.declaredOutDate = dto.declaredOutDate;
		this.fireCentreCode = dto.fireCentreCode;
		this.fireCentreName = dto.fireCentreName;
		this.fireYear = dto.fireYear;
		this.responseTypeCode = dto.responseTypeCode;
		this.responseTypeDetail = dto.responseTypeDetail;
		this.createDate = dto.createDate;
		this.updateDate = dto.updateDate;
	}
	
	public PublishedIncidentDto(PublishedIncident incident) {
		this.publishedIncidentDetailGuid = incident.getPublishedIncidentDetailGuid();
		this.incidentGuid = incident.getIncidentGuid();
		this.incidentNumberLabel = incident.getIncidentNumberLabel();
		this.newsCreatedTimestamp = incident.getNewsCreatedTimestamp();
		this.stageOfControlCode = incident.getStageOfControlCode();
		this.generalIncidentCauseCatId = incident.getGeneralIncidentCauseCatId();
		this.newsPublicationStatusCode = incident.getNewsPublicationStatusCode();
		this.discoveryDate = incident.getDiscoveryDate();
		this.fireZoneUnitIdentifier = incident.getFireZoneUnitIdentifier();
		this.fireOfNoteInd = incident.getFireOfNoteInd();
		this.incidentName = incident.getIncidentName();
		this.incidentLocation = incident.getIncidentLocation();
		this.incidentOverview = incident.getIncidentOverview();
		this.traditionalTerritoryDetail = incident.getTraditionalTerritoryDetail();
		this.incidentSizeType = incident.getIncidentSizeType();
		this.incidentSizeEstimatedHa = incident.getIncidentSizeEstimatedHa();
		this.incidentSizeMappedHa = incident.getIncidentSizeMappedHa();
		this.incidentSizeDetail = incident.getIncidentSizeDetail();
		this.incidentCauseDetail = incident.getIncidentCauseDetail();
		this.contactOrgUnitIdentifer = incident.getContactOrgUnitIdentifer();
		this.contactPhoneNumber= incident.getContactPhoneNumber();
		this.contactEmailAddress= incident.getContactEmailAddress();
		this.resourceDetail = incident.getResourceDetail();
		this.wildfireCrewResourcesInd = incident.getWildfireCrewResourcesInd();
		this.wildfireCrewResourcesDetail = incident.getWildfireCrewResourcesDetail();
		this.wildfireAviationResourceInd = incident.getWildfireAviationResourceInd();
		this.wildfireAviationResourceDetail = incident.getWildfireAviationResourceDetail();
		this.heavyEquipmentResourcesInd = incident.getHeavyEquipmentResourcesInd();
		this.heavyEquipmentResourcesDetail = incident.getHeavyEquipmentResourcesDetail();
		this.incidentMgmtCrewRsrcInd = incident.getIncidentMgmtCrewRsrcInd();
		this.incidentMgmtCrewRsrcDetail = incident.getIncidentMgmtCrewRsrcDetail();
		this.structureProtectionRsrcInd = incident.getStructureProtectionRsrcInd();
		this.structureProtectionRsrcDetail = incident.getStructureProtectionRsrcDetail();
		this.publishedTimestamp = incident.getPublishedTimestamp();
		this.publishedUserTypeCode = incident.getPublishedUserTypeCode(); 
		this.publishedUserGuid = incident.getPublishedUserGuid();
		this.publishedUserUserId = incident.getPublishedUserUserId();
		this.publishedUserName = incident.getPublishedUserName();
		this.lastUpdatedTimestamp = incident.getLastUpdatedTimestamp();
		this.latitude = incident.getLatitude();
		this.longitude = incident.getLongitude();
		this.declaredOutDate = incident.getDeclaredOutDate();
		this.fireCentreCode = incident.getFireCentreCode();
		this.fireCentreName = incident.getFireCentreName();
		this.fireYear = incident.getFireYear();
		this.responseTypeCode = incident.getResponseTypeCode();
		this.responseTypeDetail = incident.getResponseTypeDetail();
		this.createDate = incident.getCreateDate();
		this.updateDate = incident.getUpdateDate();
	}
	
	
	@Override
	public PublishedIncidentDto copy() {
		return new PublishedIncidentDto(this);
	}
	
	@Override
	public boolean equalsBK(PublishedIncidentDto other) {
		boolean result = false;

		if(other!=null) {
			result = true;
			result = result && ((newsCreatedTimestamp==null && other.newsCreatedTimestamp==null) || (newsCreatedTimestamp!=null && newsCreatedTimestamp.equals(other.newsCreatedTimestamp)));
		}	
		
		return result;
	}

	@Override
	public boolean equalsAll(PublishedIncidentDto other) {
		boolean result = false;

		if(other==null) {
			logger.info("other PublishedIncidentDto is null");
		} else {

			result = true;
			result = result && equals("publishedIncidentDetailGuid", publishedIncidentDetailGuid, other.publishedIncidentDetailGuid);
			result = result && equals("incidentGuid", incidentGuid, other.incidentGuid);
			result = result && equals("incidentNumberLabel", incidentNumberLabel, other.incidentNumberLabel);
			result = result && equals("newsCreatedTimestamp", newsCreatedTimestamp, other.newsCreatedTimestamp);
			result = result && equals("stageOfControlCode", stageOfControlCode, other.stageOfControlCode);
			result = result && equals("generalIncidentCauseCatId", generalIncidentCauseCatId, other.generalIncidentCauseCatId);
			result = result && equals("newsPublicationStatusCode", newsPublicationStatusCode, other.newsPublicationStatusCode);
			result = result && equals("discoveryDate", discoveryDate, other.discoveryDate);
			result = result && equals("fireZoneUnitIdentifier", fireZoneUnitIdentifier, other.fireZoneUnitIdentifier);
			result = result && equals("fireOfNoteInd", fireOfNoteInd, other.fireOfNoteInd);
			result = result && equals("incidentName", incidentName, other.incidentName);
			result = result && equals("incidentLocation", incidentLocation, other.incidentLocation);
			result = result && equals("incidentOverview", incidentOverview, other.incidentOverview);
			result = result && equals("traditionalTerritoryDetail", traditionalTerritoryDetail, other.traditionalTerritoryDetail);
			result = result && equals("incidentSizeType", incidentSizeType, other.incidentSizeType);
			result = result && equals("incidentSizeEstimatedHa", incidentSizeEstimatedHa, other.incidentSizeEstimatedHa);
			result = result && equals("incidentSizeMappedHa", incidentSizeMappedHa, other.incidentSizeMappedHa);
			result = result && equals("incidentSizeDetail", incidentSizeDetail, other.incidentSizeDetail);
			result = result && equals("incidentCauseDetail", incidentCauseDetail, other.incidentCauseDetail);
			result = result && equals("contactOrgUnitIdentifer", contactOrgUnitIdentifer, other.contactOrgUnitIdentifer);
			result = result && equals("contactPhoneNumber", contactPhoneNumber, other.contactPhoneNumber);
			result = result && equals("resourceDetail", resourceDetail, other.resourceDetail);
			result = result && equals("wildfireCrewResourcesInd", wildfireCrewResourcesInd, other.wildfireCrewResourcesInd);
			result = result && equals("wildfireCrewResourcesDetail", wildfireCrewResourcesDetail, other.wildfireCrewResourcesDetail);
			result = result && equals("wildfireAviationResourceInd", wildfireAviationResourceInd, other.wildfireAviationResourceInd);
			result = result && equals("wildfireAviationResourceDetail", wildfireAviationResourceDetail, other.wildfireAviationResourceDetail);
			result = result && equals("heavyEquipmentResourcesInd", heavyEquipmentResourcesInd, other.heavyEquipmentResourcesInd);
			result = result && equals("heavyEquipmentResourcesDetail", heavyEquipmentResourcesDetail, other.heavyEquipmentResourcesDetail);
			result = result && equals("incidentMgmtCrewRsrcInd", incidentMgmtCrewRsrcInd, other.incidentMgmtCrewRsrcInd);
			result = result && equals("incidentMgmtCrewRsrcDetail", incidentMgmtCrewRsrcDetail, other.incidentMgmtCrewRsrcDetail);
			result = result && equals("structureProtectionRsrcInd", structureProtectionRsrcInd, other.structureProtectionRsrcInd);
			result = result && equals("structureProtectionRsrcDetail", structureProtectionRsrcDetail, other.structureProtectionRsrcDetail);
			result = result && equals("publishedTimestamp", publishedTimestamp, other.publishedTimestamp);
			result = result && equals("publishedUserTypeCode", publishedUserTypeCode, other.publishedUserTypeCode);
			result = result && equals("publishedUserGuid", publishedUserGuid, other.publishedUserGuid);
			result = result && equals("publishedUserUserId", publishedUserUserId, other.publishedUserUserId);
			result = result && equals("publishedUserName", publishedUserName, other.publishedUserName);
			result = result && equals("lastUpdatedTimestamp", lastUpdatedTimestamp, other.lastUpdatedTimestamp);
			result = result && equals("longitude", longitude, other.longitude);
			result = result && equals("latitude", latitude, other.latitude);
			result = result && equals("declaredOutDate", declaredOutDate, other.declaredOutDate);
			result = result && equals("fireCentreCode", fireCentreCode, other.fireCentreCode);
			result = result && equals("fireCentreName", fireCentreName, other.fireCentreName);
			result = result && equals("fireYear", fireYear, other.fireYear);
			result = result && equals("responseTypeCode", responseTypeCode, other.responseTypeCode);
			result = result && equals("responseTypeDetail", responseTypeDetail, other.responseTypeDetail);
			result = result && equals("createDate", createDate, other.createDate);
			result = result && equals("updateDate", updateDate, other.updateDate);
		}

		return result;
	}

	@Override
	public Logger getLogger() {
		return logger;
	}

	public String getPublishedIncidentDetailGuid() {
		return publishedIncidentDetailGuid;
	}

	public void setPublishedIncidentDetailGuid(String publishedIncidentDetailGuid) {
		this.publishedIncidentDetailGuid = publishedIncidentDetailGuid;
	}

	public String getIncidentGuid() {
		return incidentGuid;
	}

	public void setIncidentGuid(String incidentGuid) {
		this.incidentGuid = incidentGuid;
	}
	
	public String getIncidentNumberLabel() {
		return incidentNumberLabel;
	}

	public void setIncidentNumberLabel(String incidentNumberLabel) {
		this.incidentNumberLabel = incidentNumberLabel;
	}
	

	public Date getNewsCreatedTimestamp() {
		return newsCreatedTimestamp;
	}

	public void setNewsCreatedTimestamp(Date newsCreatedTimestamp) {
		this.newsCreatedTimestamp = newsCreatedTimestamp;
	}

	public String getStageOfControlCode() {
		return stageOfControlCode;
	}

	public void setStageOfControlCode(String stageOfControlCode) {
		this.stageOfControlCode = stageOfControlCode;
	}

	public Integer getGeneralIncidentCauseCatId() {
		return generalIncidentCauseCatId;
	}

	public void setGeneralIncidentCauseCatId(Integer generalIncidentCauseCatId) {
		this.generalIncidentCauseCatId = generalIncidentCauseCatId;
	}

	public String getNewsPublicationStatusCode() {
		return newsPublicationStatusCode;
	}

	public void setNewsPublicationStatusCode(String newsPublicationStatusCode) {
		this.newsPublicationStatusCode = newsPublicationStatusCode;
	}

	public Date getDiscoveryDate() {
		return discoveryDate;
	}

	public void setDiscoveryDate(Date discoveryDate) {
		this.discoveryDate = discoveryDate;
	}

	public Integer getFireZoneUnitIdentifier() {
		return fireZoneUnitIdentifier;
	}

	public void setFireZoneUnitIdentifier(Integer fireZoneUnitIdentifier) {
		this.fireZoneUnitIdentifier = fireZoneUnitIdentifier;
	}

	public Boolean getFireOfNoteInd() {
		return fireOfNoteInd;
	}

	public void setFireOfNoteInd(Boolean fireOfNoteInd) {
		this.fireOfNoteInd = fireOfNoteInd;
	}

	public String getIncidentName() {
		return incidentName;
	}

	public void setIncidentName(String incidentName) {
		this.incidentName = incidentName;
	}

	public String getIncidentLocation() {
		return incidentLocation;
	}

	public void setIncidentLocation(String incidentLocation) {
		this.incidentLocation = incidentLocation;
	}

	public String getIncidentOverview() {
		return incidentOverview;
	}

	public void setIncidentOverview(String incidentOverview) {
		this.incidentOverview = incidentOverview;
	}

	public String getTraditionalTerritoryDetail() {
		return traditionalTerritoryDetail;
	}

	public void setTraditionalTerritoryDetail(String traditionalTerritoryDetail) {
		this.traditionalTerritoryDetail = traditionalTerritoryDetail;
	}

	public String getIncidentSizeType() {
		return incidentSizeType;
	}

	public void setIncidentSizeType(String incidentSizeType) {
		this.incidentSizeType = incidentSizeType;
	}

	public Integer getIncidentSizeEstimatedHa() {
		return incidentSizeEstimatedHa;
	}

	public void setIncidentSizeEstimatedHa(Integer incidentSizeEstimatedHa) {
		this.incidentSizeEstimatedHa = incidentSizeEstimatedHa;
	}

	public Integer getIncidentSizeMappedHa() {
		return incidentSizeMappedHa;
	}

	public void setIncidentSizeMappedHa(Integer incidentSizeMappedHa) {
		this.incidentSizeMappedHa = incidentSizeMappedHa;
	}

	public String getIncidentSizeDetail() {
		return incidentSizeDetail;
	}

	public void setIncidentSizeDetail(String incidentSizeDetail) {
		this.incidentSizeDetail = incidentSizeDetail;
	}

	public String getIncidentCauseDetail() {
		return incidentCauseDetail;
	}

	public void setIncidentCauseDetail(String incidentCauseDetail) {
		this.incidentCauseDetail = incidentCauseDetail;
	}

	public Integer getContactOrgUnitIdentifer() {
		return contactOrgUnitIdentifer;
	}

	public void setContactOrgUnitIdentifer(Integer contactOrgUnitIdentifer) {
		this.contactOrgUnitIdentifer = contactOrgUnitIdentifer;
	}

	public String getContactPhoneNumber() {
		return contactPhoneNumber;
	}

	public void setContactPhoneNumber(String contactPhoneNumber) {
		this.contactPhoneNumber = contactPhoneNumber;
	}
	
	public String getContactEmailAddress() {
		return contactEmailAddress;
	}

	public void setContactEmailAddress(String contactEmailAddress) {
		this.contactEmailAddress = contactEmailAddress;
	}

	public String getResourceDetail() {
		return resourceDetail;
	}

	public void setResourceDetail(String resourceDetail) {
		this.resourceDetail = resourceDetail;
	}

	public Boolean getWildfireCrewResourcesInd() {
		return wildfireCrewResourcesInd;
	}

	public void setWildfireCrewResourcesInd(Boolean wildfireCrewResourcesInd) {
		this.wildfireCrewResourcesInd = wildfireCrewResourcesInd;
	}

	public String getWildfireCrewResourcesDetail() {
		return wildfireCrewResourcesDetail;
	}

	public void setWildfireCrewResourcesDetail(String wildfireCrewResourcesDetail) {
		this.wildfireCrewResourcesDetail = wildfireCrewResourcesDetail;
	}

	public Boolean getWildfireAviationResourceInd() {
		return wildfireAviationResourceInd;
	}

	public void setWildfireAviationResourceInd(Boolean wildfireAviationResourceInd) {
		this.wildfireAviationResourceInd = wildfireAviationResourceInd;
	}

	public String getWildfireAviationResourceDetail() {
		return wildfireAviationResourceDetail;
	}

	public void setWildfireAviationResourceDetail(String wildfireAviationResourceDetail) {
		this.wildfireAviationResourceDetail = wildfireAviationResourceDetail;
	}

	public Boolean getHeavyEquipmentResourcesInd() {
		return heavyEquipmentResourcesInd;
	}

	public void setHeavyEquipmentResourcesInd(Boolean heavyEquipmentResourcesInd) {
		this.heavyEquipmentResourcesInd = heavyEquipmentResourcesInd;
	}

	public String getHeavyEquipmentResourcesDetail() {
		return heavyEquipmentResourcesDetail;
	}

	public void setHeavyEquipmentResourcesDetail(String heavyEquipmentResourcesDetail) {
		this.heavyEquipmentResourcesDetail = heavyEquipmentResourcesDetail;
	}

	public Boolean getIncidentMgmtCrewRsrcInd() {
		return incidentMgmtCrewRsrcInd;
	}

	public void setIncidentMgmtCrewRsrcInd(Boolean incidentMgmtCrewRsrcInd) {
		this.incidentMgmtCrewRsrcInd = incidentMgmtCrewRsrcInd;
	}

	public String getIncidentMgmtCrewRsrcDetail() {
		return incidentMgmtCrewRsrcDetail;
	}

	public void setIncidentMgmtCrewRsrcDetail(String incidentMgmtCrewRsrcDetail) {
		this.incidentMgmtCrewRsrcDetail = incidentMgmtCrewRsrcDetail;
	}

	public Boolean getStructureProtectionRsrcInd() {
		return structureProtectionRsrcInd;
	}

	public void setStructureProtectionRsrcInd(Boolean structureProtectionRsrcInd) {
		this.structureProtectionRsrcInd = structureProtectionRsrcInd;
	}

	public String getStructureProtectionRsrcDetail() {
		return structureProtectionRsrcDetail;
	}

	public void setStructureProtectionRsrcDetail(String structureProtectionRsrcDetail) {
		this.structureProtectionRsrcDetail = structureProtectionRsrcDetail;
	}

	public Date getPublishedTimestamp() {
		return publishedTimestamp;
	}

	public void setPublishedTimestamp(Date publishedTimestamp) {
		this.publishedTimestamp = publishedTimestamp;
	}

	public String getPublishedUserTypeCode() {
		return publishedUserTypeCode;
	}

	public void setPublishedUserTypeCode(String publishedUserTypeCode) {
		this.publishedUserTypeCode = publishedUserTypeCode;
	}

	public String getPublishedUserGuid() {
		return publishedUserGuid;
	}

	public void setPublishedUserGuid(String publishedUserGuid) {
		this.publishedUserGuid = publishedUserGuid;
	}

	public String getPublishedUserUserId() {
		return publishedUserUserId;
	}

	public void setPublishedUserUserId(String publishedUserUserId) {
		this.publishedUserUserId = publishedUserUserId;
	}

	public String getPublishedUserName() {
		return publishedUserName;
	}

	public void setPublishedUserName(String publishedUserName) {
		this.publishedUserName = publishedUserName;
	}

	public Date getLastUpdatedTimestamp() {
		return lastUpdatedTimestamp;
	}

	public void setLastUpdatedTimestamp(Date lastUpdatedTimestamp) {
		this.lastUpdatedTimestamp = lastUpdatedTimestamp;
	}

	public String getLatitude() {
		return this.latitude;
	}

	public void setLatitude(String latitude) {
		this.latitude = latitude;
	}

	public String getLongitude() {
		return this.longitude;
	}

	public void setLongitude(String longitude) {
		this.longitude = longitude;
	}

	public Date getDeclaredOutDate() {
		return declaredOutDate;
	}

	public void setDeclaredOutDate(Date declaredOutDate) {
		this.declaredOutDate = declaredOutDate;
	}

	public String getFireCentreCode() {
		return fireCentreCode;
	}

	public void setFireCentreCode(String fireCentreCode) {
		this.fireCentreCode = fireCentreCode;
	}

	public String getFireCentreName() {
		return fireCentreName;
	}

	public void setFireCentreName(String fireCentreName) {
		this.fireCentreName = fireCentreName;
	}

	public Integer getFireYear() {
		return fireYear;
	}

	public void setFireYear(Integer fireYear) {
		this.fireYear = fireYear;
	}

	public String getResponseTypeCode() {
		return this.responseTypeCode;
	}

	public void setResponseTypeCode(String responseTypeCode) {
		this.responseTypeCode = responseTypeCode;
	}

	public String getResponseTypeDetail() {
		return this.responseTypeDetail;
	}

	public void setResponseTypeDetail(String responseTypeDetail) {
		this.responseTypeDetail = responseTypeDetail;
	}
	
}