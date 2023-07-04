package ca.bc.gov.nrs.wfone.persistence.v1.dto;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.nrs.wfone.common.persistence.dto.BaseDto;
import ca.bc.gov.nrs.wfone.common.persistence.utils.DtoUtils;

import java.time.LocalDateTime;

public class RoFFormDto extends BaseDto<RoFFormDto> {
	
 	private static final long serialVersionUID = 8046437433239434771L;
 	private static final Logger logger = LoggerFactory.getLogger(RoFImageDto.class);
	
 	private String reportOfFireCacheGuid;
 	private String reportOfFire;
    private LocalDateTime submittedTimestamp;
	
 	public RoFFormDto() {
		
 	}
	
 	public RoFFormDto(RoFFormDto dto) {
 		this.reportOfFireCacheGuid = dto.reportOfFireCacheGuid;
 		this.reportOfFire = dto.reportOfFire;	
        this.submittedTimestamp = dto.submittedTimestamp;	
	}

    public String getReportOfFireCacheGuid() {
        return this.reportOfFireCacheGuid;
    }

    public void setReportOfFireCacheGuid(String reportOfFireCacheGuid) {
        this.reportOfFireCacheGuid = reportOfFireCacheGuid;
    }

    public String getReportOfFire() {
        return this.reportOfFire;
    }


    public LocalDateTime getSubmittedTimestamp() {
        return this.submittedTimestamp;
    }

    public void setSubmittedTimestamp(LocalDateTime submittedTimestamp) {
        this.submittedTimestamp = submittedTimestamp;
    }

	public void setReportOfFire(String reportOfFire) {
		this.reportOfFire = reportOfFire;
	}
	
 	@Override
 	public RoFFormDto copy() {
 		return new RoFFormDto(this);
 	}

 	@Override
 	public Logger getLogger() {
 		return logger;
 	}
	
	@Override
	public boolean equalsBK(RoFFormDto other) {
	boolean result = false;
		
	if(other!=null) {
			
	 		result = true;
	 		DtoUtils dtoUtils = new DtoUtils(getLogger());
	 		result = result&&dtoUtils.equals("reportOfFireCacheGuid", reportOfFireCacheGuid, other.reportOfFireCacheGuid);

	}
		
	return result;

	}

	@Override
	public boolean equalsAll(RoFFormDto other) {
	boolean result = false;
		
	if(other!=null) {
			
	 		result = true;
	 		DtoUtils dtoUtils = new DtoUtils(getLogger());
            result = result&&dtoUtils.equals("reportOfFireCacheGuid", reportOfFireCacheGuid, other.reportOfFireCacheGuid);
			result = result&&dtoUtils.equals("reportOfFire", reportOfFire, other.reportOfFire);
            result = result&&dtoUtils.equals("submittedTimestamp", submittedTimestamp, other.submittedTimestamp);
			
	 	 	}
		
		return result;
	 }
 }
