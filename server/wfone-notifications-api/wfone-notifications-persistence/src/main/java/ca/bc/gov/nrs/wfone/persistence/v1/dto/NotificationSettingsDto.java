package ca.bc.gov.nrs.wfone.persistence.v1.dto;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.nrs.wfone.common.persistence.dto.BaseDto;
import ca.bc.gov.nrs.wfone.common.persistence.utils.DtoUtils;


public class NotificationSettingsDto extends BaseDto<NotificationSettingsDto> {

	private static final long serialVersionUID = 1L;
	private static final Logger logger = LoggerFactory.getLogger(NotificationSettingsDto.class);
	
	private String subscriberGuid;
	private String subscriberToken;
	private String notificationToken;
	private String deviceType;
	
	private List<NotificationDto> notifications;
	
	
	public NotificationSettingsDto() {
		
	}
	
	public NotificationSettingsDto(NotificationSettingsDto dto) {

		this.subscriberGuid = dto.subscriberGuid;
		this.subscriberToken = dto.subscriberToken;		
		this.notificationToken = dto.notificationToken;
		if (dto.notifications!=null) {
			
			this.notifications = new ArrayList<NotificationDto>();
			
			for ( NotificationDto notification: dto.notifications  ) 
				this.notifications.add(notification.copy());
		}
		
	}
	
	public String getSubscriberGuid() {
		return subscriberGuid;
	}
	public void setSubscriberGuid(String subscriberGuid) {
		this.subscriberGuid = subscriberGuid;
	}
	public String getSubscriberToken() {
		return subscriberToken;
	}
	public void setSubscriberToken(String subscriberToken) {
		this.subscriberToken = subscriberToken;
	}


	public String getNotificationToken() {
		return notificationToken;
	}
	public void setNotificationToken(String notificationToken) {
		this.notificationToken = notificationToken;
	}

	public String getDeviceType() {
		return deviceType;
	}

	public void setDeviceType(String deviceType) {
		this.deviceType = deviceType;
	}

	public List<NotificationDto> getNotifications() {
		return notifications;
	}
	public void setNotifications(List<NotificationDto> notifications) {
		this.notifications = notifications;
	}
	@Override
	public NotificationSettingsDto copy() {
		return new NotificationSettingsDto(this);
	}
	@Override
	public Logger getLogger() {
		return logger;
	}
	@Override
	public boolean equalsBK(NotificationSettingsDto other) {
        throw new UnsupportedOperationException("Not Implemented");
	}
	@Override
	public boolean equalsAll(NotificationSettingsDto other) {
		boolean result = false;
		
		if(other!=null) {
			
			result = true;
			DtoUtils dtoUtils = new DtoUtils(getLogger());
			result = result&&dtoUtils.equals("subscriberGuid", subscriberGuid , other.subscriberGuid );
			result = result&&dtoUtils.equals("subscriberToken", subscriberToken , other.subscriberToken );
			result = result&&dtoUtils.equals("notificationToken", notificationToken, other.notificationToken );
		}
		return result;	
	}
}
