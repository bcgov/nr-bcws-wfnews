package ca.bc.gov.nrs.wfnews.service.api.v1.validation.constraints;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

import ca.bc.gov.nrs.wfnews.service.api.v1.validation.Errors;

public interface NotificationSettingsConstraints {
	
	@NotBlank(message=Errors.SUBSCRIBER_GUID_NOTBLANK, groups=NotificationSettingsConstraints.class)

	@Size(min=1, max=64, message=Errors.SUBSCRIBER_GUID_SIZE, groups=NotificationSettingsConstraints.class)
	String getSubscriberGuid();
	
	@NotBlank(message=Errors.SUBSCRIBER_TOKEN_NOTBLANK, groups=NotificationSettingsConstraints.class)
	@Size(min=1, max=256, message=Errors.SUBSCRIBER_TOKEN_SIZE, groups=NotificationSettingsConstraints.class)
	String getSubscriberToken();
	
	@NotBlank(message=Errors.NOTIFICATION_TOKEN_NOTBLANK, groups=NotificationSettingsConstraints.class)
	@Size(min=1, max=256, message=Errors.NOTIFICATION_TOKEN_SIZE, groups=NotificationSettingsConstraints.class)
	String getNotificationToken();
	
	@Size(min=0, max=20, message=Errors.DEVICE_TYPE_SIZE, groups=NotificationSettingsConstraints.class)
	String getDeviceType();
}
