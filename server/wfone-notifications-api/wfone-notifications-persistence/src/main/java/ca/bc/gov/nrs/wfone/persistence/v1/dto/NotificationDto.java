package ca.bc.gov.nrs.wfone.persistence.v1.dto;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.nrs.wfone.common.persistence.dto.BaseDto;
import ca.bc.gov.nrs.wfone.common.persistence.utils.DtoUtils;

public class NotificationDto extends BaseDto<NotificationDto> {
	
	private static final long serialVersionUID = 8046437433239434771L;
	private static final Logger logger = LoggerFactory.getLogger(NotificationDto.class);
	
	private String notificationGuid;
	private String subscriberGuid;
	private String notificationName;
	private String notificationType;
	private Double radius;
	private Double latitude;
	private Double longitude;
	private Boolean activeIndicator;
	private List<NotificationTopicDto> topics;
	
	public NotificationDto() {
		
	}
	
	public NotificationDto(NotificationDto dto) {
		this.notificationGuid = dto.notificationGuid;
		this.subscriberGuid = dto.subscriberGuid;
		this.notificationName = dto.notificationName;
		this.notificationType = dto.notificationType;
		this.radius = dto.radius;
		this.latitude = dto.latitude;
		this.longitude = dto.longitude;
		this.activeIndicator = dto.activeIndicator;

		if (dto.topics!=null) {
			
			this.topics = new ArrayList<NotificationTopicDto>();
			
			for ( NotificationTopicDto topic: dto.topics  ) 
				this.topics.add(topic.copy());
		}
	}
	
	public String getSubscriberGuid() {
		return subscriberGuid;
	}
	public void setSubscriberGuid(String subscriberGuid) {
		this.subscriberGuid = subscriberGuid;
	}
	public String getNotificationGuid() {
		return notificationGuid;
	}
	public void setNotificationGuid(String notificationGuid) {
		this.notificationGuid = notificationGuid;
	}
	public String getNotificationName() {
		return notificationName;
	}
	public void setNotificationName(String notificationName) {
		this.notificationName = notificationName;
	}
	public String getNotificationType() {
		return notificationType;
	}
	public void setNotificationType(String notificationType) {
		this.notificationType = notificationType;
	}
	public Double getRadius() {
		return radius;
	}
	public void setRadius(Double radius) {
		this.radius = radius;
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
	
	public Boolean getActiveIndicator() {
		return activeIndicator;
	}

	public void setActiveIndicator(Boolean activeIndicator) {
		this.activeIndicator = activeIndicator;
	}

	public List<NotificationTopicDto> getTopics() {
		return topics;
	}
	public void setTopics(List<NotificationTopicDto> topics) {
		this.topics = topics;
	}
	
	@Override
	public NotificationDto copy() {
		return new NotificationDto(this);
	}
	@Override
	public Logger getLogger() {
		return logger;
	}
	
	@Override
	public boolean equalsBK(NotificationDto other) {
		boolean result = false;
		
		if(other!=null) {
			
			result = true;
			DtoUtils dtoUtils = new DtoUtils(getLogger());
			result = result&&dtoUtils.equals("notificationName", notificationName, other.notificationName );

		}
		
		return result;

	}
	@Override
	public boolean equalsAll(NotificationDto other) {
		boolean result = false;
		
		if(other!=null) {
			
			result = true;
			DtoUtils dtoUtils = new DtoUtils(getLogger());
			result = result&&dtoUtils.equals("notificationGuid", notificationGuid, other.notificationGuid );
			result = result&&dtoUtils.equals("subscriberGuid", subscriberGuid, other.subscriberGuid );
			result = result&&dtoUtils.equals("notificationName", notificationName, other.notificationName );
			result = result&&dtoUtils.equals("notificationType", notificationType, other.notificationType );
			result = result&&dtoUtils.equals("radius", radius, other.radius, 8 );
			result = result&&dtoUtils.equals("latitude", latitude, other.latitude, 8 );
			result = result&&dtoUtils.equals("longitude", longitude, other.longitude, 8 );
			result = result&&dtoUtils.equals("activeIndicator", activeIndicator, other.activeIndicator );
			
		}
		
		return result;
	}
}
