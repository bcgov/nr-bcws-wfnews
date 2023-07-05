package ca.bc.gov.nrs.wfnews.api.rest.v1.resource;

import java.util.Date;

import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlSeeAlso;

import org.codehaus.jackson.annotate.JsonSubTypes;
import org.codehaus.jackson.annotate.JsonSubTypes.Type;
import org.codehaus.jackson.annotate.JsonTypeInfo;

import ca.bc.gov.nrs.common.wfone.rest.resource.BaseResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.types.ResourceTypes;
import ca.bc.gov.nrs.wfnews.api.model.v1.Attachment;

@XmlRootElement(namespace = ResourceTypes.NAMESPACE, name = ResourceTypes.ATTACHMENT_NAME)
@XmlSeeAlso({ AttachmentResource.class })
@JsonSubTypes({ @Type(value = AttachmentResource.class, name = ResourceTypes.ATTACHMENT) })
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "@type")
public class AttachmentResource extends BaseResource implements Attachment {

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

	@Override
	public String getSourceObjectUniqueId() {
		return sourceObjectUniqueId;
	}

	@Override
	public void setSourceObjectUniqueId(String sourceObjectUniqueId) {
		this.sourceObjectUniqueId = sourceObjectUniqueId;
	}

	@Override
	public String getAttachmentGuid() {
		return attachmentGuid;
	}
	
	@Override
	public void setAttachmentGuid(String attachmentGuid) {
		this.attachmentGuid = attachmentGuid;
	}

	@Override
	public String getSourceObjectNameCode() {
		return sourceObjectNameCode;
	}

	@Override
	public void setSourceObjectNameCode(String sourceObjectNameCode) {
		this.sourceObjectNameCode = sourceObjectNameCode;
	}

	@Override
	public String getFileName() {
		return fileName;
	}

	@Override
	public void setFileName(String fileName) {
		this.fileName = fileName;
	}

	@Override
	public String getFileId() {
		return fileId;
	}

	@Override
	public void setFileId(String fileId) {
		this.fileId = fileId;
	}

	@Override
	public String getThumbId() {
		return thumbId;
	}

	@Override
	public void setThumbId(String thumbId) {
		this.thumbId = thumbId;
	}

	@Override
	public String getAttachmentTypeCode() {
		return attachmentTypeCode;
	}

	@Override
	public void setAttachmentTypeCode(String attachmentTypeCode) {
		this.attachmentTypeCode = attachmentTypeCode;
	}

	@Override
	public String getAttachmentDescription() {
		return attachmentDescription;
	}

	@Override
	public void setAttachmentDescription(String attachmentDescription) {
		this.attachmentDescription = attachmentDescription;
	}


	@Override
	public String getUploadedBy() {
		return uploadedBy;
	}

	@Override
	public void setUploadedBy(String uploadedBy) {
		this.uploadedBy = uploadedBy;
	}

	@Override
	public Date getUploadedTimestamp() {
		return uploadedTimestamp;
	}

	@Override
	public void setUploadedTimestamp(Date uploadedTimestamp) {
		this.uploadedTimestamp = uploadedTimestamp;
	}

	@Override
	public Date getCreatedTimestamp() {
		return createdTimestamp;
	}

	@Override
	public void setCreatedTimestamp(Date createdTimestamp) {
		this.createdTimestamp = createdTimestamp;
	}

	@Override
	public Double getLatitude() {
		return latitude;
	}

	@Override
	public void setLatitude(Double latitude) {
		this.latitude = latitude;
	}

	@Override
	public Double getLongitude() {
		return longitude;
	}

	@Override
	public void setLongitude(Double longitude) {
		this.longitude = longitude;
	}

	@Override
	public String getMimeType() {
		return mimeType;
	}

	@Override
	public void setMimeType(String mimeType) {
		this.mimeType = mimeType;
	}

	@Override
	public boolean isArchived() {
		return archived;
	}

	@Override
	public void setArchived(boolean archived) {
		this.archived = archived;
	}

	@Override
	public Double getAzimuth() {
		return azimuth;
	}

	@Override
	public void setAzimuth(Double azimuth) {
		this.azimuth = azimuth;
	}

	@Override
	public Double getElevation() {
		return elevation;
	}

	@Override
	public void setElevation(Double elevation) {
		this.elevation = elevation;
	}

	@Override
	public Integer getImageHeight() {
		return imageHeight;
	}

	@Override
	public void setImageHeight(Integer imageHeight) {
		this.imageHeight = imageHeight;
	}

	@Override
	public Integer getImageWidth() {
		return imageWidth;
	}

	@Override
	public void setImageWidth(Integer imageWidth) {
		this.imageWidth = imageWidth;
	}

	@Override	
	public boolean isPrivateIndicator() {
		return privateIndicator;
	}
	
	@Override
	public void setPrivateIndicator(boolean privateIndicator) {
		this.privateIndicator = privateIndicator;
	}

	@Override
	public Double getElevationAngle() {
		return elevationAngle;
	}

	@Override
	public void setElevationAngle(Double elevationAngle) {
		this.elevationAngle = elevationAngle;
	}

	
	@Override
	public String getAttachmentTitle() {
		return attachmentTitle;
	}
	
	@Override
	public void setAttachmentTitle(String attachmentTitle) {
		this.attachmentTitle = attachmentTitle;
	}
	
	@Override
	public String getImageURL() {
		return imageURL;
	}
	
	@Override
	public void setImageURL(String imageURL) {
		this.imageURL = imageURL;
	}
	
	@Override
	public String getThumbnailURL() {
		return thumbnailURL;
	}
	@Override
	public void setThumbnailURL(String thumbnailURL) {
		this.thumbnailURL = thumbnailURL;
	}
	
	@Override
	public boolean isPrimary() {
		return this.primary;
	}

	@Override
	public void setPrimary(boolean primary) {
		this.primary = primary;
	}
}