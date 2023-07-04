package ca.bc.gov.nrs.wfnews.persistence.v1.dto;

import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.AttachmentResource;

public class AttachmentDto extends AuditDto<AttachmentDto> {
  private static final long serialVersionUID = 1L;
	private static final Logger logger = LoggerFactory.getLogger(AttachmentDto.class);

  private String attachmentGuid;
	private String sourceObjectUniqueId;
	private String sourceObjectNameCode;
	private String fileName;
	private String fileId;
	private String thumbId;
	private String attachmentDescription;
	private String attachmentTypeCode;
	private boolean archived;
	private boolean privateIndicator;
	private String uploadedBy;
	private Date uploadedTimestamp;
	private Date createdTimestamp;
	private Double latitude;
	private Double longitude;
	private String mimeType;
	private Double azimuth;
	private Double elevation;
	private Double elevationAngle;
	private Integer imageHeight;
	private Integer imageWidth;
	private String attachmentTitle;
	private String imageURL;
	private String thumbnailURL;
	private boolean primary;

  public AttachmentDto() { }
  public AttachmentDto(AttachmentDto dto) {
    this.attachmentGuid = dto.attachmentGuid;
    this.sourceObjectUniqueId = dto.sourceObjectUniqueId;
    this.sourceObjectNameCode = dto.sourceObjectNameCode;
    this.fileName = dto.fileName;
    this.fileId = dto.fileId;
    this.thumbId = dto.thumbId;
    this.attachmentDescription = dto.attachmentDescription;
    this.attachmentTypeCode = dto.attachmentTypeCode;
    this.archived = dto.archived;
    this.privateIndicator = dto.privateIndicator;
    this.uploadedBy = dto.uploadedBy;
    this.uploadedTimestamp = dto.uploadedTimestamp;
    this.createdTimestamp = dto.createdTimestamp;
    this.latitude = dto.latitude;
    this.longitude = dto.longitude;
    this.mimeType = dto.mimeType;
    this.azimuth = dto.azimuth;
    this.elevation = dto.elevation;
    this.elevationAngle = dto.elevationAngle;
    this.imageHeight = dto.imageHeight;
    this.imageWidth = dto.imageWidth;
    this.attachmentTitle = dto.attachmentTitle;
    this.imageURL = dto.imageURL;
    this.thumbnailURL = dto.thumbnailURL;
	  this.primary = dto.primary;
  }

  public AttachmentDto(AttachmentResource resource) { 
    this.attachmentGuid = resource.getAttachmentGuid();
    this.sourceObjectUniqueId = resource.getSourceObjectUniqueId();
    this.sourceObjectNameCode = resource.getSourceObjectNameCode();
    this.fileName = resource.getFileName();
    this.fileId = resource.getFileId();
    this.thumbId = resource.getThumbId();
    this.attachmentDescription = resource.getAttachmentDescription();
    this.attachmentTypeCode = resource.getAttachmentTypeCode();
    this.archived = resource.isArchived();
    this.privateIndicator = resource.isPrivateIndicator();
    this.uploadedBy = resource.getUploadedBy();
    this.uploadedTimestamp = resource.getUploadedTimestamp();
    this.createdTimestamp = resource.getCreatedTimestamp();
    this.latitude = resource.getLatitude();
    this.longitude = resource.getLongitude();
    this.mimeType = resource.getMimeType();
    this.azimuth = resource.getAzimuth();
    this.elevation = resource.getElevation();
    this.elevationAngle = resource.getElevationAngle();
    this.imageHeight = resource.getImageHeight();
    this.imageWidth = resource.getImageWidth();
    this.attachmentTitle = resource.getAttachmentTitle();
    this.imageURL = resource.getImageURL();
    this.thumbnailURL = resource.getThumbnailURL();
	  this.primary = resource.isPrimary();
  }

  @Override
	public boolean equalsAll(AttachmentDto other) {
		boolean result = false;

		if(other != null) {
			result = equals("attachmentGuid", attachmentGuid, other.attachmentGuid);
			result = result && equals("sourceObjectNameCode", sourceObjectNameCode, other.sourceObjectNameCode);
			result = result && equals("sourceObjectUniqueId", sourceObjectUniqueId, other.sourceObjectUniqueId);
			result = result && equals("fileName", fileName, other.fileName);
			result = result && equals("fileId", fileId, other.fileId);
			result = result && equals("thumbId", thumbId, other.thumbId);
			result = result && equals("attachmentDescription", attachmentDescription, other.attachmentDescription);
			result = result && equals("createdTimestamp", createdTimestamp, other.createdTimestamp);
			result = result && equals("attachmentTypeCode", attachmentTypeCode, other.attachmentTypeCode);
			result = result && equals("archived", archived, other.archived);
			result = result && equals("privateIndicator", privateIndicator, other.privateIndicator);
      result = result && equals("primaryInd", privateIndicator, other.privateIndicator);
      result = result && equals("uploadedBy", uploadedBy, other.uploadedBy);
      result = result && equals("uploadedTimestamp", uploadedTimestamp, other.uploadedTimestamp);
      result = result && equals("latitude", latitude, other.latitude, 8);
      result = result && equals("longitude", longitude, other.longitude, 8);
      result = result && equals("mimeType", mimeType, other.mimeType);
      result = result && equals("azimuth", azimuth, other.azimuth, 8);
      result = result && equals("elevation", elevation, other.elevation, 8);
      result = result && equals("elevationAngle", elevationAngle, other.elevationAngle, 8);
      result = result && equals("imageHeight", imageHeight, other.imageHeight);
      result = result && equals("imageWidth", imageWidth, other.imageWidth);
      result = result && equals("imageWidth", imageWidth, other.imageWidth);
      result = result && equals("imageURL", imageURL, other.imageURL);
      result = result && equals("thumbnailURL", thumbnailURL, other.thumbnailURL);
      result = result && equals("primary", primary, other.primary);
      result = result && equals("attachmentTitle", attachmentTitle, other.attachmentTitle);
		}

		return result;
	}

  @Override
	public AttachmentDto copy() {
		return new AttachmentDto(this);
	}
	@Override
	public Logger getLogger() {
		return logger;
	}
	@Override
	public boolean equalsBK(AttachmentDto other) {
		boolean result = false;

		if(other != null) {
			result = ((attachmentGuid == null && other.attachmentGuid == null) || (attachmentGuid != null && attachmentGuid.equals(other.attachmentGuid)));
		}	
		
		return result;
	}

  public static long getSerialversionuid() {
    return serialVersionUID;
  }
  public String getAttachmentGuid() {
    return attachmentGuid;
  }
  public void setAttachmentGuid(String attachmentGuid) {
    this.attachmentGuid = attachmentGuid;
  }
  public String getSourceObjectUniqueId() {
    return sourceObjectUniqueId;
  }
  public void setSourceObjectUniqueId(String sourceObjectUniqueId) {
    this.sourceObjectUniqueId = sourceObjectUniqueId;
  }
  public String getSourceObjectNameCode() {
    return sourceObjectNameCode;
  }
  public void setSourceObjectNameCode(String sourceObjectNameCode) {
    this.sourceObjectNameCode = sourceObjectNameCode;
  }
  public String getFileName() {
    return fileName;
  }
  public void setFileName(String fileName) {
    this.fileName = fileName;
  }
  public String getFileId() {
    return fileId;
  }
  public void setFileId(String fileId) {
    this.fileId = fileId;
  }
  public String getThumbId() {
    return thumbId;
  }
  public void setThumbId(String thumbId) {
    this.thumbId = thumbId;
  }
  public String getAttachmentDescription() {
    return attachmentDescription;
  }
  public void setAttachmentDescription(String attachmentDescription) {
    this.attachmentDescription = attachmentDescription;
  }
  public String getAttachmentTypeCode() {
    return attachmentTypeCode;
  }
  public void setAttachmentTypeCode(String attachmentTypeCode) {
    this.attachmentTypeCode = attachmentTypeCode;
  }
  public boolean isArchived() {
    return archived;
  }
  public void setArchived(boolean archived) {
    this.archived = archived;
  }
  public boolean isPrivateIndicator() {
    return privateIndicator;
  }
  public void setPrivateIndicator(boolean privateIndicator) {
    this.privateIndicator = privateIndicator;
  }
  public String getUploadedBy() {
    return uploadedBy;
  }
  public void setUploadedBy(String uploadedBy) {
    this.uploadedBy = uploadedBy;
  }
  public Date getUploadedTimestamp() {
    return uploadedTimestamp;
  }
  public void setUploadedTimestamp(Date uploadedTimestamp) {
    this.uploadedTimestamp = uploadedTimestamp;
  }
  public Date getCreatedTimestamp() {
    return createdTimestamp;
  }
  public void setCreatedTimestamp(Date createdTimestamp) {
    this.createdTimestamp = createdTimestamp;
  }
  public Double getLatitude() {
    return latitude;
  }
  public void setLatitude(Double latitude) {
    this.latitude = latitude;
  }
  public Double getLongitude() {
    return longitude;
  }
  public void setLongitude(Double longitude) {
    this.longitude = longitude;
  }
  public String getMimeType() {
    return mimeType;
  }
  public void setMimeType(String mimeType) {
    this.mimeType = mimeType;
  }
  public Double getAzimuth() {
    return azimuth;
  }
  public void setAzimuth(Double azimuth) {
    this.azimuth = azimuth;
  }
  public Double getElevation() {
    return elevation;
  }
  public void setElevation(Double elevation) {
    this.elevation = elevation;
  }
  public Double getElevationAngle() {
    return elevationAngle;
  }
  public void setElevationAngle(Double elevationAngle) {
    this.elevationAngle = elevationAngle;
  }
  public Integer getImageHeight() {
    return imageHeight;
  }
  public void setImageHeight(Integer imageHeight) {
    this.imageHeight = imageHeight;
  }
  public Integer getImageWidth() {
    return imageWidth;
  }
  public void setImageWidth(Integer imageWidth) {
    this.imageWidth = imageWidth;
  }
  public String getAttachmentTitle() {
    return attachmentTitle;
  }
  public void setAttachmentTitle(String attachmentTitle) {
    this.attachmentTitle = attachmentTitle;
  }
  public String getImageURL() {
    return imageURL;
  }
  public void setImageURL(String imageURL) {
    this.imageURL = imageURL;
  }
  public String getThumbnailURL() {
    return thumbnailURL;
  }
  public void setThumbnailURL(String thumbnailURL) {
    this.thumbnailURL = thumbnailURL;
  }
  public boolean isPrimary() {
    return primary;
  }
  public void setPrimary(boolean primary) {
    this.primary = primary;
  }
}
