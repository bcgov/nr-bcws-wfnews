package ca.bc.gov.nrs.wfnews.api.rest.v1.resource;

import java.util.Date;

import javax.xml.bind.annotation.XmlRootElement;

import org.codehaus.jackson.annotate.JsonTypeInfo;
import org.codehaus.jackson.annotate.JsonTypeName;

import ca.bc.gov.nrs.common.rest.resource.BaseResource;
import ca.bc.gov.nrs.wfnews.api.model.v1.PublishedIncident;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.types.ResourceTypes;

@XmlRootElement(namespace = ResourceTypes.NAMESPACE, name = ResourceTypes.PUBLISHED_INCIDENT_NAME)
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "@type")
@JsonTypeName(ResourceTypes.PUBLISHED_INCIDENT)
public class PublishedIncidentResource extends SimplePublishedIncidentResource implements PublishedIncident {
	
	private static final long serialVersionUID = 1L;
	
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
	private Long publishedIncidentRevisionCount;	
	private Date createDate;
	private String createUser;
	private Date updateDate;
	private String updateUser;
	private String latitude;
	private String longitude;
	private Integer fireYear;
	private String responseTypeCode;
	private String responseTypeDetail;

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

	public Long getPublishedIncidentRevisionCount() {
		return publishedIncidentRevisionCount;
	}

	public void setPublishedIncidentRevisionCount(Long publishedIncidentRevisionCount) {
		this.publishedIncidentRevisionCount = publishedIncidentRevisionCount;
	}

	public String getContactEmailAddress() {
		return contactEmailAddress;
	}

	public void setContactEmailAddress(String contactEmailAddress) {
		this.contactEmailAddress = contactEmailAddress;
	}

	public Date getCreateDate() {
		return createDate;
	}

	public void setCreateDate(Date createDate) {
		this.createDate = createDate;
	}

	public String getCreateUser() {
		return createUser;
	}

	public void setCreateUser(String createUser) {
		this.createUser = createUser;
	}

	public Date getUpdateDate() {
		return updateDate;
	}

	public void setUpdateDate(Date updateDate) {
		this.updateDate = updateDate;
	}

	public String getUpdateUser() {
		return updateUser;
	}

	public void setUpdateUser(String updateUser) {
		this.updateUser = updateUser;
	}

	@Override
	public String getIncidentNumberLabel() {
		return incidentNumberLabel;
	}

	@Override
	public void setIncidentNumberLabel(String incidentNumberLabel) {
		this.incidentNumberLabel = incidentNumberLabel;
	}
	
	@Override
	public String getLatitude() {
		return this.latitude;
	}

	@Override
	public void setLatitude(String latitude) {
		this.latitude = latitude;
	}

	@Override
	public String getLongitude() {
		return this.longitude;
	}

	@Override
	public void setLongitude(String longitude) {
		this.longitude = longitude;
	}

	@Override
	public Date getDeclaredOutDate() {
		return declaredOutDate;
	}

	@Override
	public void setDeclaredOutDate(Date declaredOutDate) {
		this.declaredOutDate = declaredOutDate;
	}

	@Override
	public String getFireCentreCode() {
		return fireCentreCode;
	}

	@Override
	public void setFireCentreCode(String fireCentreCode) {
		this.fireCentreCode = fireCentreCode;
	}

	@Override
	public String getFireCentreName() {
		return fireCentreName;
	}

	@Override
	public void setFireCentreName(String fireCentreName) {
		this.fireCentreName = fireCentreName;
	}

	@Override
	public Integer getFireYear() {
		return fireYear;
	}

	@Override
	public void setFireYear(Integer fireYear) {
		this.fireYear = fireYear;
	}

	@Override
	public String getResponseTypeCode() {
		return this.responseTypeCode;
	}

	@Override
	public void setResponseTypeCode(String responseTypeCode) {
		this.responseTypeCode = responseTypeCode;
	}

	@Override
	public String getResponseTypeDetail() {
		return this.responseTypeDetail;
	}

	@Override
	public void setResponseTypeDetail(String responseTypeDetail) {
		this.responseTypeDetail = responseTypeDetail;
	}
}