package ca.bc.gov.nrs.wfnews.persistence.v1.dto;

import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.ExternalUriResource;


public class ExternalUriDto extends AuditDto<ExternalUriDto> {
	
	private static final long serialVersionUID = 1L;
	private static final Logger logger = LoggerFactory.getLogger(ExternalUriDto.class);
	private String externalUriGuid;
	private String sourceObjectNameCode;
	private String sourceObjectUniqueId;
	private String externalUriCategoryTag;
	private String externalUriDisplayLabel;
	private String externalUri;
	private Boolean publishedInd;
	private Date createdTimestamp;
	private Boolean privateInd;
	private Boolean archivedInd;
	private Boolean primaryInd;
	
	public ExternalUriDto() {

	}
	
	public ExternalUriDto(ExternalUriDto dto) {
		this.externalUriGuid = dto.externalUriGuid;
		this.sourceObjectNameCode = dto.sourceObjectNameCode;
		this.sourceObjectUniqueId = dto.sourceObjectUniqueId;
		this.externalUriCategoryTag = dto.externalUriCategoryTag;
		this.externalUriDisplayLabel = dto.externalUriDisplayLabel;
		this.externalUri = dto.externalUri;
		this.publishedInd = dto.publishedInd;
		this.createdTimestamp = dto.createdTimestamp;
		this.privateInd = dto.privateInd;
		this.archivedInd = dto.archivedInd;
		this.primaryInd = dto.primaryInd;
	}
	

	public ExternalUriDto(ExternalUriResource resource) {
		this.externalUriGuid = resource.getExternalUriGuid();
		this.sourceObjectNameCode = resource.getSourceObjectNameCode();
		this.sourceObjectUniqueId = resource.getSourceObjectUniqueId();
		this.externalUriCategoryTag = resource.getExternalUriCategoryTag();
		this.externalUriDisplayLabel = resource.getExternalUriDisplayLabel();
		this.externalUri = resource.getExternalUri();
		this.publishedInd = resource.getPublishedInd();
		this.createdTimestamp = resource.getCreatedTimestamp();
		this.privateInd = resource.getPrivateInd();
		this.archivedInd = resource.getArchivedInd();
		this.primaryInd = resource.getPrimaryInd();
	}
	
	@Override
	public boolean equalsAll(ExternalUriDto other) {
		boolean result = false;

		if(other==null) {
			logger.info("other ExternalUriDto is null");
		} else {

			result = true;
			result = result&&equals("externalUriGuid", externalUriGuid, other.externalUriGuid);
			result = result&&equals("sourceObjectNameCode", sourceObjectNameCode, other.sourceObjectNameCode);
			result = result&&equals("sourceObjectUniqueId", sourceObjectUniqueId, other.sourceObjectUniqueId);
			result = result&&equals("externalUriCategoryTag", externalUriCategoryTag, other.externalUriCategoryTag);
			result = result&&equals("externalUriDisplayLabel", externalUriDisplayLabel, other.externalUriDisplayLabel);
			result = result&&equals("externalUri", externalUri, other.externalUri);
			result = result&&equals("publishedInd", publishedInd, other.publishedInd);
			result = result&&equals("createdTimestamp", createdTimestamp, other.createdTimestamp);
			result = result&&equals("privateInd", privateInd, other.privateInd);
			result = result&&equals("archivedInd", archivedInd, other.archivedInd);
			result = result&&equals("primaryInd", primaryInd, other.primaryInd);
		}

		return result;
	}
	
	public String getExternalUriGuid() {
		return externalUriGuid;
	}
	public void setExternalUriGuid(String externalUriGuid) {
		this.externalUriGuid = externalUriGuid;
	}
	public String getSourceObjectNameCode() {
		return sourceObjectNameCode;
	}
	public void setSourceObjectNameCode(String sourceObjectNameCode) {
		this.sourceObjectNameCode = sourceObjectNameCode;
	}
	public String getSourceObjectUniqueId() {
		return sourceObjectUniqueId;
	}
	public void setSourceObjectUniqueId(String sourceObjectUniqueId) {
		this.sourceObjectUniqueId = sourceObjectUniqueId;
	}
	public String getExternalUriCategoryTag() {
		return externalUriCategoryTag;
	}
	public void setExternalUriCategoryTag(String externalUriCategoryTag) {
		this.externalUriCategoryTag = externalUriCategoryTag;
	}
	public String getExternalUriDisplayLabel() {
		return externalUriDisplayLabel;
	}
	public void setExternalUriDisplayLabel(String externalUriDisplayLabel) {
		this.externalUriDisplayLabel = externalUriDisplayLabel;
	}
	public String getExternalUri() {
		return externalUri;
	}
	public void setExternalUri(String externalUri) {
		this.externalUri = externalUri;
	}
	public Date getCreatedTimestamp() {
		return createdTimestamp;
	}
	public void setCreatedTimestamp(Date createdTimestamp) {
		this.createdTimestamp = createdTimestamp;
	}
	public Boolean getPrivateInd() {
		return privateInd;
	}
	public void setPrivateInd(Boolean privateInd) {
		this.privateInd = privateInd;
	}
	public Boolean getArchivedInd() {
		return archivedInd;
	}
	public void setArchivedInd(Boolean archivedInd) {
		this.archivedInd = archivedInd;
	}
	public Boolean getPublishedInd() {
		return publishedInd;
	}
	public void setPublishedInd(Boolean publishedInd) {
		this.publishedInd = publishedInd;
	}
	public Boolean getPrimaryInd() {
		return primaryInd;
	}
	public void setPrimaryInd(Boolean primaryInd) {
		this.primaryInd = primaryInd;
	}
	
	@Override
	public ExternalUriDto copy() {
		return new ExternalUriDto(this);
	}
	@Override
	public Logger getLogger() {
		return logger;
	}
	@Override
	public boolean equalsBK(ExternalUriDto other) {
		boolean result = false;

		if(other!=null) {
			result = true;
			result = result&&((externalUriGuid==null&&other.externalUriGuid==null)||(externalUriGuid!=null&&externalUriGuid.equals(other.externalUriGuid)));
		}	
		
		return result;
	}
	
}