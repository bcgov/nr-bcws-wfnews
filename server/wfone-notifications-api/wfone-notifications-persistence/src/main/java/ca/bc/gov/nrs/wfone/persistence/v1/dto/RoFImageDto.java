package ca.bc.gov.nrs.wfone.persistence.v1.dto;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.nrs.wfone.common.persistence.dto.BaseDto;
import ca.bc.gov.nrs.wfone.common.persistence.utils.DtoUtils;

public class RoFImageDto extends BaseDto<RoFImageDto> {
	
 	private static final long serialVersionUID = 8046437433239434771L;
 	private static final Logger logger = LoggerFactory.getLogger(RoFImageDto.class);
	
	private String reportOfFireAttachmentCacheGuid;
 	private String reportOfFireCacheGuid;
 	private Object attachment;
	
 	public RoFImageDto() {
		
 	}
	
 	public RoFImageDto(RoFImageDto dto) {
 		this.reportOfFireAttachmentCacheGuid = dto.reportOfFireAttachmentCacheGuid;
 		this.reportOfFireCacheGuid = dto.reportOfFireCacheGuid;
        this.attachment = dto.attachment;	
	}

	public String getReportOfFireAttachmentCacheGuid() {
		return this.reportOfFireAttachmentCacheGuid;
	}

	public void setReportOfFireAttachmentCacheGuid(String reportOfFireAttachmentCacheGuid) {
		this.reportOfFireAttachmentCacheGuid = reportOfFireAttachmentCacheGuid;
	}

	public String getReportOfFireCacheGuid() {
		return this.reportOfFireCacheGuid;
	}

	public void setReportOfFireCacheGuid(String reportOfFireCacheGuid) {
		this.reportOfFireCacheGuid = reportOfFireCacheGuid;
	}

	public Object getAttachment() {
		return this.attachment;
	}

	public void setAttachment(Object attachment) {
		this.attachment = attachment;
	}


 	@Override
 	public RoFImageDto copy() {
 		return new RoFImageDto(this);
 	}

 	@Override
 	public Logger getLogger() {
 		return logger;
 	}
	
	@Override
	public boolean equalsBK(RoFImageDto other) {
	boolean result = false;
		
	if(other!=null) {
	 		result = true;
	 		DtoUtils dtoUtils = new DtoUtils(getLogger());
	 		result = result&&dtoUtils.equals("reportOfFireAttachmentCacheGuid", reportOfFireAttachmentCacheGuid, other.reportOfFireAttachmentCacheGuid);
	}
		
	return result;

	}

	@Override
	public boolean equalsAll(RoFImageDto other) {
	boolean result = false;
		
	if(other!=null) {	
	 		result = true;
	 		DtoUtils dtoUtils = new DtoUtils(getLogger());
			result = result&&dtoUtils.equals("reportOfFireAttachmentCacheGuid", reportOfFireAttachmentCacheGuid, other.reportOfFireAttachmentCacheGuid);
	 		result = result&&dtoUtils.equals("reportOfFireCacheGuid", reportOfFireCacheGuid, other.reportOfFireCacheGuid);
			result = result&&dtoUtils.equals("attachment", attachment, other.attachment);
	 	 	}
		
		return result;
	 }
 }
