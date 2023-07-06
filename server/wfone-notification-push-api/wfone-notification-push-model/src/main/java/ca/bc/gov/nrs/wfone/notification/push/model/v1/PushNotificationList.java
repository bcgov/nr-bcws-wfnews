package ca.bc.gov.nrs.wfone.notification.push.model.v1;

import java.io.Serializable;
import java.util.List;

public interface PushNotificationList<E extends PushNotification> extends Serializable {
	public List<E> getCollection();
	public void setCollection(List<E> collection);
}