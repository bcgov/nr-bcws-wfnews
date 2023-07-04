package ca.bc.gov.nrs.wfone.api.model.v1;

import java.util.List;


public interface NotificationSettings<N extends Notification> {

	String getSubscriberGuid();

	void setSubscriberGuid(String subscriberGuid);
	
	String getSubscriberToken();

	void setSubscriberToken(String subscriberToken);

	String getNotificationToken();

	void setNotificationToken(String notificationToken);

	List<N> getNotifications();

	void setNotifications(List<N> notifications);

	void setDeviceType(String deviceType);

	String getDeviceType();


}
