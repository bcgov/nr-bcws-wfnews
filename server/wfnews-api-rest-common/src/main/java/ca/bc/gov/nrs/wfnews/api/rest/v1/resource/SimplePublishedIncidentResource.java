package ca.bc.gov.nrs.wfnews.api.rest.v1.resource;

import java.util.Date;

import javax.xml.bind.annotation.XmlRootElement;

import org.codehaus.jackson.annotate.JsonTypeInfo;
import org.codehaus.jackson.annotate.JsonTypeName;

import ca.bc.gov.nrs.common.rest.resource.BaseResource;
import ca.bc.gov.nrs.wfnews.api.model.v1.SimplePublishedIncident;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.types.ResourceTypes;

@XmlRootElement(namespace = ResourceTypes.NAMESPACE, name = ResourceTypes.PUBLISHED_INCIDENT_NAME)
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "@type")
@JsonTypeName(ResourceTypes.PUBLISHED_INCIDENT)
public class SimplePublishedIncidentResource extends BaseResource implements SimplePublishedIncident {
	
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

	@Override
	public String getPublishedIncidentDetailGuid() {
		return publishedIncidentDetailGuid;
	}

	@Override
	public void setPublishedIncidentDetailGuid(String publishedIncidentDetailGuid) {
		this.publishedIncidentDetailGuid = publishedIncidentDetailGuid;
	}

	@Override
	public String getIncidentGuid() {
		return incidentGuid;
	}

	@Override
	public void setIncidentGuid(String incidentGuid) {
		this.incidentGuid = incidentGuid;
	}

	@Override
	public Date getNewsCreatedTimestamp() {
		return newsCreatedTimestamp;
	}

	@Override
	public void setNewsCreatedTimestamp(Date newsCreatedTimestamp) {
		this.newsCreatedTimestamp = newsCreatedTimestamp;
	}

	@Override
	public String getStageOfControlCode() {
		return stageOfControlCode;
	}

	@Override
	public void setStageOfControlCode(String stageOfControlCode) {
		this.stageOfControlCode = stageOfControlCode;
	}

	@Override
	public Integer getGeneralIncidentCauseCatId() {
		return generalIncidentCauseCatId;
	}

	@Override
	public void setGeneralIncidentCauseCatId(Integer generalIncidentCauseCatId) {
		this.generalIncidentCauseCatId = generalIncidentCauseCatId;
	}

	@Override
	public String getNewsPublicationStatusCode() {
		return newsPublicationStatusCode;
	}

	@Override
	public void setNewsPublicationStatusCode(String newsPublicationStatusCode) {
		this.newsPublicationStatusCode = newsPublicationStatusCode;
	}

	@Override
	public Date getDiscoveryDate() {
		return discoveryDate;
	}

	@Override
	public void setDiscoveryDate(Date discoveryDate) {
		this.discoveryDate = discoveryDate;
	}

	@Override
	public Boolean getFireOfNoteInd() {
		return fireOfNoteInd;
	}

	@Override
	public void setFireOfNoteInd(Boolean fireOfNoteInd) {
		this.fireOfNoteInd = fireOfNoteInd;
	}

	@Override
	public String getIncidentName() {
		return incidentName;
	}

	@Override
	public void setIncidentName(String incidentName) {
		this.incidentName = incidentName;
	}

	@Override
	public String getIncidentLocation() {
		return incidentLocation;
	}

	@Override
	public void setIncidentLocation(String incidentLocation) {
		this.incidentLocation = incidentLocation;
	}

	@Override
	public String getTraditionalTerritoryDetail() {
		return traditionalTerritoryDetail;
	}

	@Override
	public void setTraditionalTerritoryDetail(String traditionalTerritoryDetail) {
		this.traditionalTerritoryDetail = traditionalTerritoryDetail;
	}

	@Override
	public Integer getIncidentSizeEstimatedHa() {
		return incidentSizeEstimatedHa;
	}

	@Override
	public void setIncidentSizeEstimatedHa(Integer incidentSizeEstimatedHa) {
		this.incidentSizeEstimatedHa = incidentSizeEstimatedHa;
	}

	@Override
	public Integer getIncidentSizeMappedHa() {
		return incidentSizeMappedHa;
	}

	@Override
	public void setIncidentSizeMappedHa(Integer incidentSizeMappedHa) {
		this.incidentSizeMappedHa = incidentSizeMappedHa;
	}

	@Override
	public String getIncidentSizeDetail() {
		return incidentSizeDetail;
	}

	@Override
	public void setIncidentSizeDetail(String incidentSizeDetail) {
		this.incidentSizeDetail = incidentSizeDetail;
	}

	@Override
	public String getIncidentCauseDetail() {
		return incidentCauseDetail;
	}

	@Override
	public void setIncidentCauseDetail(String incidentCauseDetail) {
		this.incidentCauseDetail = incidentCauseDetail;
	}

	@Override
	public Boolean getWildfireCrewResourcesInd() {
		return wildfireCrewResourcesInd;
	}

	@Override
	public void setWildfireCrewResourcesInd(Boolean wildfireCrewResourcesInd) {
		this.wildfireCrewResourcesInd = wildfireCrewResourcesInd;
	}

	@Override
	public Boolean getWildfireAviationResourceInd() {
		return wildfireAviationResourceInd;
	}

	@Override
	public void setWildfireAviationResourceInd(Boolean wildfireAviationResourceInd) {
		this.wildfireAviationResourceInd = wildfireAviationResourceInd;
	}

	@Override
	public Boolean getHeavyEquipmentResourcesInd() {
		return heavyEquipmentResourcesInd;
	}

	@Override
	public void setHeavyEquipmentResourcesInd(Boolean heavyEquipmentResourcesInd) {
		this.heavyEquipmentResourcesInd = heavyEquipmentResourcesInd;
	}

	@Override
	public Boolean getIncidentMgmtCrewRsrcInd() {
		return incidentMgmtCrewRsrcInd;
	}

	@Override
	public void setIncidentMgmtCrewRsrcInd(Boolean incidentMgmtCrewRsrcInd) {
		this.incidentMgmtCrewRsrcInd = incidentMgmtCrewRsrcInd;
	}

	@Override
	public Boolean getStructureProtectionRsrcInd() {
		return structureProtectionRsrcInd;
	}

	@Override
	public void setStructureProtectionRsrcInd(Boolean structureProtectionRsrcInd) {
		this.structureProtectionRsrcInd = structureProtectionRsrcInd;
	}

	@Override
	public Date getPublishedTimestamp() {
		return publishedTimestamp;
	}

	@Override
	public void setPublishedTimestamp(Date publishedTimestamp) {
		this.publishedTimestamp = publishedTimestamp;
	}

	@Override
	public Date getLastUpdatedTimestamp() {
		return lastUpdatedTimestamp;
	}

	@Override
	public void setLastUpdatedTimestamp(Date lastUpdatedTimestamp) {
		this.lastUpdatedTimestamp = lastUpdatedTimestamp;
	}

	@Override
	public Date getCreateDate() {
		return createDate;
	}

	@Override
	public void setCreateDate(Date createDate) {
		this.createDate = createDate;
	}

	@Override
	public Date getUpdateDate() {
		return updateDate;
	}

	@Override
	public void setUpdateDate(Date updateDate) {
		this.updateDate = updateDate;
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