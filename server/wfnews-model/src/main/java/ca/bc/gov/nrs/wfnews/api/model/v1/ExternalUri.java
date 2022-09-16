package ca.bc.gov.nrs.wfnews.api.model.v1;

import java.io.Serializable;
import java.util.Date;

public interface ExternalUri extends Serializable {

	public String getExternalUriGuid();
	public void setExternalUriGuid(String externalUriGuid);
	public String getSourceObjectNameCode();
	public void setSourceObjectNameCode(String sourceObjectNameCode);
	public String getSourceObjectUniqueId();
	public void setSourceObjectUniqueId(String sourceObjectUniqueId);
	public String getExternalUriCategoryTag();
	public void setExternalUriCategoryTag(String externalUriCategoryTag);
	public String getExternalUriDisplayLabel();
	public void setExternalUriDisplayLabel(String externalUriDisplayLabel);
	public String getExternalUri();
	public void setExternalUri(String externalUri);
	public Date getCreatedTimestamp();
	public void setCreatedTimestamp(Date createdTimestamp);
	public String getPrivateInd();
	public void setPrivateInd(String privateInd);
	public String getArchivedInd();
	public void setArchivedInd(String archivedInd);
	public String getPrimaryInd();
	public void setPrimaryInd(String primaryInd);
	public String getPublishedInd();
	public void setPublishedInd(String publishedInd);
	public Long getRevisionCount();
	public void setRevisionCount(Long externalUriRevisionCount);
	public Date getCreateDate();
	public void setCreateDate(Date createDate);
	public String getCreateUser();
	public void setCreateUser(String createUser);
	public Date getUpdateDate();
	public void setUpdateDate(Date updateDate);
	public String getUpdateUser();
	public void setUpdateUser(String updateUser);
}