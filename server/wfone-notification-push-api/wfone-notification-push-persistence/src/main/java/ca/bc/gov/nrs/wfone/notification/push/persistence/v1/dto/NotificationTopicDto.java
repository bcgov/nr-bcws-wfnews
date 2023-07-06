package ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dto;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.nrs.wfone.common.persistence.dto.BaseDto;
import ca.bc.gov.nrs.wfone.common.persistence.utils.DtoUtils;

public class NotificationTopicDto extends BaseDto<NotificationTopicDto> {
	
	private static final long serialVersionUID = 8046437433239434771L;
	private static final Logger logger = LoggerFactory.getLogger(NotificationTopicDto.class);
	
	private String notificationTopicGuid;
	private String notificationGuid;
	private String notificationTopicName;

	public NotificationTopicDto() {
	}
	
	public NotificationTopicDto(NotificationTopicDto dto) {
		this.notificationTopicGuid = dto.notificationTopicGuid;
		this.notificationGuid = dto.notificationGuid;
		this.notificationTopicName = dto.notificationTopicName;
	}
	
	public String getNotificationTopicGuid() {
		return notificationTopicGuid;
	}
	public void setNotificationTopicGuid(String notificationTopicGuid) {
		this.notificationTopicGuid = notificationTopicGuid;
	}
	public String getNotificationGuid() {
		return notificationGuid;
	}
	public void setNotificationGuid(String notificationGuid) {
		this.notificationGuid = notificationGuid;
	}
	public String getNotificationTopicName() {
		return notificationTopicName;
	}
	public void setNotificationTopicName(String notificationTopicName) {
		this.notificationTopicName = notificationTopicName;
	}
	@Override
	public NotificationTopicDto copy() {
		return new NotificationTopicDto(this);
	}
	@Override
	public Logger getLogger() {
		return logger;
	}
	@Override
	public boolean equalsBK(NotificationTopicDto other) {
		boolean result = false;
		
		if(other!=null) {
			
			result = true;
			DtoUtils dtoUtils = new DtoUtils(getLogger());
			result = result&&dtoUtils.equals("notificationGuid", notificationGuid, other.notificationGuid);
			result = result&&dtoUtils.equals("notificationTopicName", notificationTopicName, other.notificationTopicName);
		}
		
		return result;

	}
	
	@Override
	public boolean equalsAll(NotificationTopicDto other) {
		boolean result = false;
		
		if(other!=null) {
			
			result = true;
			DtoUtils dtoUtils = new DtoUtils(getLogger());
			result = result&&dtoUtils.equals("notificationTopicGuid", notificationTopicGuid, other.notificationTopicGuid);
			result = result&&dtoUtils.equals("notificationGuid", notificationGuid, other.notificationGuid);
			result = result&&dtoUtils.equals("notificationTopicName", notificationTopicName, other.notificationTopicName);
		}
		
		return result;
	}
}
