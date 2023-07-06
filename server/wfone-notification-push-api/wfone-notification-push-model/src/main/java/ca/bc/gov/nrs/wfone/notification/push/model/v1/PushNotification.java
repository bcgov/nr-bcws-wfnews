package ca.bc.gov.nrs.wfone.notification.push.model.v1;

import java.io.Serializable;
import java.util.Map;

public interface PushNotification extends Serializable {

	public PushEventType getPushEventType();
	public void setPushEventType(PushEventType pushEventType);

	public String getDescription();
	public void setDescription(String description);
	
	public Map<String, String> getProperties();
	public void setProperties(Map<String, String> properties);
}
