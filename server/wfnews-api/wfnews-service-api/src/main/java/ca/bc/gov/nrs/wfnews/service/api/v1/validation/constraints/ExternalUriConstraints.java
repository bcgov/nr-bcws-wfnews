package ca.bc.gov.nrs.wfnews.service.api.v1.validation.constraints;

import javax.validation.constraints.NotNull;

import ca.bc.gov.nrs.wfnews.service.api.v1.validation.Errors;

public interface ExternalUriConstraints {
		
	@NotNull(message=Errors.EXTERNAL_SOURCE_OBJECT_NOTBLANK, groups=ExternalUriConstraints.class)
	public String getSourceObjectNameCode();
	
	@NotNull(message=Errors.EXTERNAL_SOURCE_GUID_NOTBLANK, groups=ExternalUriConstraints.class)
	public String getSourceObjectUniqueId();
	
	@NotNull(message=Errors.EXTERNAL_URI_CATEGORY_TAG_NOTBLANK, groups=ExternalUriConstraints.class)
	public String getExternalUriCategoryTag();

	@NotNull(message=Errors. EXTERNAL_URI_DISPLAY_LABEL_NOTBLANK, groups=ExternalUriConstraints.class)
	public String getExternalUriDisplayLabel();
	
	@NotNull(message=Errors.EXTERNAL_PRIVATE_IND_NOTBLANK, groups=ExternalUriConstraints.class)
	public Boolean getPrivateInd();
	
	@NotNull(message=Errors.EXTERNAL_ARCHIVED_IND_NOTBLANK, groups=ExternalUriConstraints.class)
	public Boolean getArchivedInd();
	
	@NotNull(message=Errors.EXTERNAL_PUBLISHED_IND_NOTBLANK, groups=ExternalUriConstraints.class)
	public Boolean getPublishedInd();
	
	@NotNull(message=Errors.EXTERNAL_PRIMARY_IND_NOTBLANK, groups=ExternalUriConstraints.class)
	public Boolean getPrimaryInd();
	
}