package ca.bc.gov.nrs.wfnews.api.rest.v1.resource;

import java.util.Date;

import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlSeeAlso;

import org.codehaus.jackson.annotate.JsonSubTypes;
import org.codehaus.jackson.annotate.JsonSubTypes.Type;
import org.codehaus.jackson.annotate.JsonTypeInfo;

import ca.bc.gov.nrs.common.wfone.rest.resource.BaseResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.types.ResourceTypes;
import ca.bc.gov.nrs.wfnews.api.model.v1.SituationReport;

@XmlRootElement(namespace = ResourceTypes.NAMESPACE, name = ResourceTypes.SITUATION_REPORT_NAME)
@XmlSeeAlso({ SituationReportResource.class })
@JsonSubTypes({ @Type(value = SituationReportResource.class, name = ResourceTypes.SITUATION_REPORT) })
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "@type")
public class SituationReportResource extends BaseResource implements SituationReport {

  private String reportGuid;
  private Long incidentTeamCount;
  private Long crewCount;
  private Long aviationCount;
  private Long heavyEquipmentCount;
  private Long structureProtectionCount;
  private String situationOverview;
  private Date situationReportDate;
  private Boolean publishedInd;
  private Boolean archivedInd;
	private Long revisionCount;
	private Date createdTimestamp;
	private Date createDate;
	private String createUser;
	private Date updateDate;
	private String updateUser;
  
  public String getReportGuid() {
    return reportGuid;
  }
  public void setReportGuid(String reportGuid) {
    this.reportGuid = reportGuid;
  }
  public Long getIncidentTeamCount() {
    return incidentTeamCount;
  }
  public void setIncidentTeamCount(Long incidentTeamCount) {
    this.incidentTeamCount = incidentTeamCount;
  }
  public Long getCrewCount() {
    return crewCount;
  }
  public void setCrewCount(Long crewCount) {
    this.crewCount = crewCount;
  }
  public Long getAviationCount() {
    return aviationCount;
  }
  public void setAviationCount(Long aviationCount) {
    this.aviationCount = aviationCount;
  }
  public Long getHeavyEquipmentCount() {
    return heavyEquipmentCount;
  }
  public void setHeavyEquipmentCount(Long heavyEquipmentCount) {
    this.heavyEquipmentCount = heavyEquipmentCount;
  }
  public Long getStructureProtectionCount() {
    return structureProtectionCount;
  }
  public void setStructureProtectionCount(Long structureProtectionCount) {
    this.structureProtectionCount = structureProtectionCount;
  }
  public String getSituationOverview() {
    return situationOverview;
  }
  public void setSituationOverview(String situationOverview) {
    this.situationOverview = situationOverview;
  }
  public Date getSituationReportDate() {
    return situationReportDate;
  }
  public void setSituationReportDate(Date situationReportDate) {
    this.situationReportDate = situationReportDate;
  }
  public Boolean getPublishedInd() {
    return publishedInd;
  }
  public void setPublishedInd(Boolean publishedInd) {
    this.publishedInd = publishedInd;
  }
  public Boolean getArchivedInd() {
    return archivedInd;
  }
  public void setArchivedInd(Boolean archivedInd) {
    this.archivedInd = archivedInd;
  }
  public Long getRevisionCount() {
    return revisionCount;
  }
  public void setRevisionCount(Long revisionCount) {
    this.revisionCount = revisionCount;
  }
  public Date getCreatedTimestamp() {
    return createdTimestamp;
  }
  public void setCreatedTimestamp(Date createdTimestamp) {
    this.createdTimestamp = createdTimestamp;
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
}
