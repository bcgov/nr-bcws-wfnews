package ca.bc.gov.nrs.wfone.api.rest.v1.resource;

import java.util.List;

import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlSeeAlso;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonSubTypes.Type;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import ca.bc.gov.nrs.common.wfone.rest.resource.BaseResource;
import ca.bc.gov.nrs.wfone.api.model.v1.NotificationSettings;
import ca.bc.gov.nrs.wfone.api.rest.v1.resource.types.ResourceTypes;

@XmlRootElement(namespace = ResourceTypes.NAMESPACE, name = ResourceTypes.NOTIFICATION_SETTINGS_NAME)
@XmlSeeAlso({  NotificationSettingsRsrc.class  })
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "@type")
@JsonSubTypes(  { 	@Type(value = NotificationSettingsRsrc.class, name = ResourceTypes.NOTIFICATION_SETTINGS) }	 )

public class NotificationSettingsRsrc extends BaseResource implements NotificationSettings<NotificationRsrc> {
	private static final long serialVersionUID = 1L;
	
	private String subscriberGuid;
	private String subscriberToken;
	private String notificationToken;
	private String deviceType;

	private List<NotificationRsrc> notifications;
	
	@Override
	public String getSubscriberGuid() {
		return subscriberGuid;
	}
	@Override
	public void setSubscriberGuid(String subscriberGuid) {
		this.subscriberGuid = subscriberGuid;
	}
	@Override
	public String getSubscriberToken() {
		return subscriberToken;
	}
	@Override
	public void setSubscriberToken(String subscriberToken) {
		this.subscriberToken = subscriberToken;
	}
	@Override
	public String getNotificationToken() {
		return notificationToken;
	}
	@Override
	public void setNotificationToken(String notificationToken) {
		this.notificationToken = notificationToken;
	}
	@Override
	public String getDeviceType() {
		return deviceType;
	}
	@Override
	public void setDeviceType(String deviceType) {
		this.deviceType = deviceType;
	}
	@Override
	public List<NotificationRsrc> getNotifications() {
		return notifications;
	}
	@Override
	public void setNotifications(List<NotificationRsrc> notifications) {
		this.notifications = notifications;
	}
	
	

	

}
