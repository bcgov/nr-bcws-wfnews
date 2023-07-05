package ca.bc.gov.nrs.wfnews.api.model.v1;

import java.io.Serializable;
import java.util.Date;

public interface Attachment extends Serializable {

    public String getAttachmentGuid();
    public void setAttachmentGuid(String attachmentGuid);

    public String getSourceObjectUniqueId();
    public void setSourceObjectUniqueId(String sourceObjectUniqueId);
    
    public String getSourceObjectNameCode();
    public void setSourceObjectNameCode(String sourceObjectNameCode);

    public String getFileName();
    public void setFileName(String fileName);
    
    public String getFileId();
    public void setFileId(String fileId);

    public String getAttachmentTypeCode();
    public void setAttachmentTypeCode(String attachmentTypeCode);
    
    public String getAttachmentDescription();
    public void setAttachmentDescription(String attachmentDescription);

    public String getUploadedBy();
    public void setUploadedBy(String uploadedBy);
    
    public Date getUploadedTimestamp();
    public void setUploadedTimestamp(Date uploadedTimestamp);

    public String getThumbId();
    public void setThumbId(String thumbId);

    public Double getLatitude();
    public void setLatitude(Double t);

    public Double getLongitude();
    public void setLongitude(Double t);

    public Date getCreatedTimestamp();
    public void setCreatedTimestamp(Date t);

    public String getMimeType();
    public void setMimeType(String mimeType);

    public boolean isArchived();
    public void setArchived(boolean archived);

    public boolean isPrimary();
    public void setPrimary(boolean primary);

    public Double getAzimuth();
    public void setAzimuth(Double t);

    public Double getElevation();
    public void setElevation(Double t);
    
    public Double getElevationAngle();
    public void setElevationAngle(Double t);

    public Integer getImageWidth();
    public void setImageWidth(Integer t);

    public Integer getImageHeight();
    public void setImageHeight(Integer t);
	
    boolean isPrivateIndicator();
	void setPrivateIndicator(boolean privateIndicator);

	String getAttachmentTitle();
	void setAttachmentTitle(String attachmentTitle);
	
    public String getImageURL();
    public void setImageURL(String imageURL);
    
    public String getThumbnailURL();
    public void setThumbnailURL(String thumbnailURL);

}