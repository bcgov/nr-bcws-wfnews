package ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dto;

import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.nrs.wfone.common.persistence.dto.BaseDto;
import ca.bc.gov.nrs.wfone.common.persistence.utils.DtoUtils;

public class NotificationPushItemDto  extends BaseDto<NotificationPushItemDto> {

	private static final long serialVersionUID = 804643743323944771L;
	private static final Logger logger = LoggerFactory.getLogger(NotificationPushItemDto.class);
	
	private String notificationPushItemGuid;
	private String notificationGuid;
	private Date pushTimestamp;
	private Date itemExpiryTimestamp;
	private String itemIdentifier;
	
	
	public NotificationPushItemDto() {
		
	}

	public NotificationPushItemDto(NotificationPushItemDto other) {
		this.notificationPushItemGuid = other.notificationPushItemGuid;
		this.notificationGuid =  other.notificationGuid;
		this.pushTimestamp =  other.pushTimestamp;
		this.itemExpiryTimestamp = other.itemExpiryTimestamp;
		this.itemIdentifier = other.itemIdentifier;
		
	}

	public String getNotificationPushItemGuid() {
		return notificationPushItemGuid;
	}
	public void setNotificationPushItemGuid(String notificationPushItemGuid) {
		this.notificationPushItemGuid = notificationPushItemGuid;
	}
	public String getNotificationGuid() {
		return notificationGuid;
	}
	public void setNotificationGuid(String notificationGuid) {
		this.notificationGuid = notificationGuid;
	}
	public Date getPushTimestamp() {
		return pushTimestamp;
	}
	public void setPushTimestamp(Date pushTimestamp) {
		this.pushTimestamp = pushTimestamp;
	}
	public Date getItemExpiryTimestamp() {
		return itemExpiryTimestamp;
	}
	public void setItemExpiryTimestamp(Date itemExpiryTimestamp) {
		this.itemExpiryTimestamp = itemExpiryTimestamp;
	}
	public String getItemIdentifier() {
		return itemIdentifier;
	}
	public void setItemIdentifier(String itemIdentifier) {
		this.itemIdentifier = itemIdentifier;
	}
	@Override
	public NotificationPushItemDto copy() {
		return new NotificationPushItemDto(this);
	}
	@Override
	public Logger getLogger() {
		return logger;
	}
	@Override
	public boolean equalsBK(NotificationPushItemDto other) {
		boolean result = false;
		
		if(other!=null) {
			
			result = true;
			DtoUtils dtoUtils = new DtoUtils(getLogger());
			result = result&&dtoUtils.equals("notificationGuid", notificationGuid, other. notificationGuid );
			result = result&&dtoUtils.equals("itemIdentifier", itemIdentifier, other.itemIdentifier );
		}
		
		return result;
	}
	@Override
	public boolean equalsAll(NotificationPushItemDto other) {
		boolean result = false;
		
		if(other!=null) {
			
			result = true;
			DtoUtils dtoUtils = new DtoUtils(getLogger());
			result = result&&dtoUtils.equals("notificationPushItemGuid", notificationPushItemGuid, other.notificationPushItemGuid );
			result = result&&dtoUtils.equals("notificationGuid", notificationGuid, other. notificationGuid );
			result = result&&dtoUtils.equals("pushTimestamp", pushTimestamp, other.pushTimestamp );
			result = result&&dtoUtils.equals("itemExpiryTimestamp", itemExpiryTimestamp, other.itemExpiryTimestamp );
			result = result&&dtoUtils.equals("itemIdentifier", itemIdentifier, other.itemIdentifier );
		}
		
		return result;
	}
	
}
