package ca.bc.gov.mof.wfpointid.wfnews.rest.v1.resource;

import java.util.Date;

import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlSeeAlso;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonSubTypes.Type;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import ca.bc.gov.nrs.common.wfone.rest.resource.BaseResource;
import ca.bc.gov.mof.wfpointid.wfnews.rest.v1.resource.types.ResourceTypes;

@XmlRootElement(namespace = ResourceTypes.NAMESPACE, name = ResourceTypes.ATTACHMENT_NAME)
@XmlSeeAlso({ AttachmentResource.class })
@JsonSubTypes({ @Type(value = AttachmentResource.class, name = ResourceTypes.ATTACHMENT) })
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "@type")
public class AttachmentResource extends BaseResource {

	private static final long serialVersionUID = 1L;
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

	public String getSourceObjectUniqueId() {
		return sourceObjectUniqueId;
	}

	public void setSourceObjectUniqueId(String sourceObjectUniqueId) {
		this.sourceObjectUniqueId = sourceObjectUniqueId;
	}

	public String getAttachmentGuid() {
		return attachmentGuid;
	}
	
	public void setAttachmentGuid(String attachmentGuid) {
		this.attachmentGuid = attachmentGuid;
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

	public String getAttachmentTypeCode() {
		return attachmentTypeCode;
	}

	public void setAttachmentTypeCode(String attachmentTypeCode) {
		this.attachmentTypeCode = attachmentTypeCode;
	}

	public String getAttachmentDescription() {
		return attachmentDescription;
	}

	public void setAttachmentDescription(String attachmentDescription) {
		this.attachmentDescription = attachmentDescription;
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

	public boolean isArchived() {
		return archived;
	}

	public void setArchived(boolean archived) {
		this.archived = archived;
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

	public boolean isPrivateIndicator() {
		return privateIndicator;
	}
	
	public void setPrivateIndicator(boolean privateIndicator) {
		this.privateIndicator = privateIndicator;
	}

	public Double getElevationAngle() {
		return elevationAngle;
	}

	public void setElevationAngle(Double elevationAngle) {
		this.elevationAngle = elevationAngle;
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
		return this.primary;
	}

	public void setPrimary(boolean primary) {
		this.primary = primary;
	}
}