package ca.bc.gov.mof.wfpointid.wfnews.rest.v1.resource;

import java.util.Date;

import javax.xml.bind.annotation.XmlRootElement;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonTypeName;

import ca.bc.gov.nrs.common.rest.resource.BaseResource;
import ca.bc.gov.mof.wfpointid.wfnews.rest.v1.resource.types.ResourceTypes;

@XmlRootElement(namespace = ResourceTypes.NAMESPACE, name = ResourceTypes.EXTERNAL_URI_NAME)
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "@type")
@JsonTypeName(ResourceTypes.EXTERNAL_URI)
public class ExternalUriResource extends BaseResource {
	
	private static final long serialVersionUID = 1L;
	private String externalUriGuid;
	private String sourceObjectNameCode;
	private String sourceObjectUniqueId;
	private String externalUriCategoryTag;
	private String externalUriDisplayLabel;
	private String externalUri;
	private Boolean publishedInd;
	private Long revisionCount;
	private Date createdTimestamp;
	private Boolean privateInd;
	private Boolean archivedInd;
	private Boolean primaryInd;
	private Date createDate;
	private String createUser;
	private Date updateDate;
	private String updateUser;
	
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
	public Long getRevisionCount() {
		return revisionCount;
	}
	public void setRevisionCount(Long revisionCount) {
		this.revisionCount = revisionCount;
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