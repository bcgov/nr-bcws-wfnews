package ca.bc.gov.mof.wfpointid.wfnews.rest.v1.resource;

import java.util.Date;

import javax.xml.bind.annotation.XmlRootElement;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonTypeName;

import ca.bc.gov.mof.wfpointid.wfnews.rest.v1.resource.types.ResourceTypes;
import ca.bc.gov.nrs.common.rest.resource.BaseResource;

@XmlRootElement(namespace = ResourceTypes.NAMESPACE, name = ResourceTypes.PUBLISHED_INCIDENT_NAME)
@JsonTypeInfo(use = JsonTypeInfo.Id.NONE,  // Fix for WFNEWS returning the wrong key and with a null value
	include = JsonTypeInfo.As.PROPERTY, property = "_type")
@JsonTypeName(ResourceTypes.PUBLISHED_INCIDENT)
@JsonIgnoreProperties(value={"links", "selfLink"},ignoreUnknown=true) // Fix for WFNEWS returning the wrong key and with a null value
public class SimplePublishedIncidentResource extends BaseResource {
	
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
	private Boolean fireOfNoteInd;
	private String incidentName;
	private String incidentLocation;
	private String traditionalTerritoryDetail;
	private Integer incidentSizeEstimatedHa;
	private Integer incidentSizeMappedHa;
	private String incidentSizeDetail;
	private String incidentCauseDetail;
	private Boolean wildfireCrewResourcesInd;
	private Boolean wildfireAviationResourceInd;
	private Boolean heavyEquipmentResourcesInd;
	private Boolean incidentMgmtCrewRsrcInd;
	private Boolean structureProtectionRsrcInd;
	private Date publishedTimestamp;
	private Date lastUpdatedTimestamp;
	private Date createDate;
	private Date updateDate;
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

	public String getTraditionalTerritoryDetail() {
		return traditionalTerritoryDetail;
	}

	public void setTraditionalTerritoryDetail(String traditionalTerritoryDetail) {
		this.traditionalTerritoryDetail = traditionalTerritoryDetail;
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

	public Boolean getWildfireCrewResourcesInd() {
		return wildfireCrewResourcesInd;
	}

	public void setWildfireCrewResourcesInd(Boolean wildfireCrewResourcesInd) {
		this.wildfireCrewResourcesInd = wildfireCrewResourcesInd;
	}

	public Boolean getWildfireAviationResourceInd() {
		return wildfireAviationResourceInd;
	}

	public void setWildfireAviationResourceInd(Boolean wildfireAviationResourceInd) {
		this.wildfireAviationResourceInd = wildfireAviationResourceInd;
	}

	public Boolean getHeavyEquipmentResourcesInd() {
		return heavyEquipmentResourcesInd;
	}

	public void setHeavyEquipmentResourcesInd(Boolean heavyEquipmentResourcesInd) {
		this.heavyEquipmentResourcesInd = heavyEquipmentResourcesInd;
	}

	public Boolean getIncidentMgmtCrewRsrcInd() {
		return incidentMgmtCrewRsrcInd;
	}

	public void setIncidentMgmtCrewRsrcInd(Boolean incidentMgmtCrewRsrcInd) {
		this.incidentMgmtCrewRsrcInd = incidentMgmtCrewRsrcInd;
	}

	public Boolean getStructureProtectionRsrcInd() {
		return structureProtectionRsrcInd;
	}

	public void setStructureProtectionRsrcInd(Boolean structureProtectionRsrcInd) {
		this.structureProtectionRsrcInd = structureProtectionRsrcInd;
	}

	public Date getPublishedTimestamp() {
		return publishedTimestamp;
	}

	public void setPublishedTimestamp(Date publishedTimestamp) {
		this.publishedTimestamp = publishedTimestamp;
	}

	public Date getLastUpdatedTimestamp() {
		return lastUpdatedTimestamp;
	}

	public void setLastUpdatedTimestamp(Date lastUpdatedTimestamp) {
		this.lastUpdatedTimestamp = lastUpdatedTimestamp;
	}

	public Date getCreateDate() {
		return createDate;
	}

	public void setCreateDate(Date createDate) {
		this.createDate = createDate;
	}

	public Date getUpdateDate() {
		return updateDate;
	}

	public void setUpdateDate(Date updateDate) {
		this.updateDate = updateDate;
	}

	public String getIncidentNumberLabel() {
		return incidentNumberLabel;
	}

	public void setIncidentNumberLabel(String incidentNumberLabel) {
		this.incidentNumberLabel = incidentNumberLabel;
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