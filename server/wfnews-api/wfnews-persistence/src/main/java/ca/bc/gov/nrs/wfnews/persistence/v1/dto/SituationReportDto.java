package ca.bc.gov.nrs.wfnews.persistence.v1.dto;

import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.SituationReportResource;

public class SituationReportDto extends AuditDto<SituationReportDto> {

  private static final long serialVersionUID = 1L;
	private static final Logger logger = LoggerFactory.getLogger(SituationReportDto.class);

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
	private Date createdTimestamp;
  
  public SituationReportDto() {

	}
	
	public SituationReportDto(SituationReportDto dto) {
		this.reportGuid = dto.reportGuid;
    this.incidentTeamCount = dto.incidentTeamCount;
    this.crewCount = dto.crewCount;
    this.aviationCount = dto.aviationCount;
    this.heavyEquipmentCount = dto.heavyEquipmentCount;
    this.structureProtectionCount = dto.structureProtectionCount;
    this.situationOverview = dto.situationOverview;
    this.situationReportDate = dto.situationReportDate;
    this.publishedInd = dto.publishedInd;
    this.archivedInd = dto.archivedInd;
    this.createdTimestamp = dto.createdTimestamp;
	}
	

	public SituationReportDto(SituationReportResource resource) {
    this.reportGuid = resource.getReportGuid();
    this.incidentTeamCount = resource.getIncidentTeamCount();
    this.crewCount = resource.getCrewCount();
    this.aviationCount = resource.getAviationCount();
    this.heavyEquipmentCount = resource.getHeavyEquipmentCount();
    this.structureProtectionCount = resource.getStructureProtectionCount();
    this.situationOverview = resource.getSituationOverview();
    this.situationReportDate = resource.getSituationReportDate();
    this.publishedInd = resource.getPublishedInd();
    this.archivedInd = resource.getArchivedInd();
    this.createdTimestamp = resource.getCreatedTimestamp();
	}
	
	@Override
	public boolean equalsAll(SituationReportDto other) {
		boolean result = false;

		if(other==null) {
			logger.info("other SituationReportDto is null");
		} else {

			result = true;
			result = result&&equals("reportGuid", reportGuid, other.reportGuid);
			result = result&&equals("incidentTeamCount", incidentTeamCount, other.incidentTeamCount);
			result = result&&equals("crewCount", crewCount, other.crewCount);
			result = result&&equals("aviationCount", aviationCount, other.aviationCount);
			result = result&&equals("heavyEquipmentCount", heavyEquipmentCount, other.heavyEquipmentCount);
			result = result&&equals("structureProtectionCount", structureProtectionCount, other.structureProtectionCount);
			result = result&&equals("publishedInd", publishedInd, other.publishedInd);
			result = result&&equals("createdTimestamp", createdTimestamp, other.createdTimestamp);
			result = result&&equals("situationOverview", situationOverview, other.situationOverview);
			result = result&&equals("situationReportDate", situationReportDate, other.situationReportDate);
			result = result&&equals("archivedInd", archivedInd, other.archivedInd);
		}

		return result;
	}

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
  public Date getCreatedTimestamp() {
    return createdTimestamp;
  }
  public void setCreatedTimestamp(Date createdTimestamp) {
    this.createdTimestamp = createdTimestamp;
  }

  @Override
	public SituationReportDto copy() {
		return new SituationReportDto(this);
	}
	@Override
	public Logger getLogger() {
		return logger;
	}
	@Override
	public boolean equalsBK(SituationReportDto other) {
		boolean result = false;

		if(other!=null) {
			result = true;
			result = result&&((reportGuid==null&&other.reportGuid==null)||(reportGuid!=null&&reportGuid.equals(other.reportGuid)));
		}	
		
		return result;
	}
}
