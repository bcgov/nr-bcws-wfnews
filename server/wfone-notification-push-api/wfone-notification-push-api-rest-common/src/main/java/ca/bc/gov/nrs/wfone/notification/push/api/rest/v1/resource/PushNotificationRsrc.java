package ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.resource;

import java.util.Map;

import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlSeeAlso;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonSubTypes.Type;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import ca.bc.gov.nrs.common.wfone.rest.resource.TypedResource;
import ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.resource.types.ResourceTypes;
import ca.bc.gov.nrs.wfone.notification.push.model.v1.PushEventType;
import ca.bc.gov.nrs.wfone.notification.push.model.v1.PushNotification;

@XmlRootElement(namespace = ResourceTypes.NAMESPACE, name = ResourceTypes.PUSH_NOTIFICATION_NAME)
@XmlSeeAlso({ PushNotificationRsrc.class })
@JsonSubTypes({ @Type(value = PushNotificationRsrc.class, name = ResourceTypes.PUSH_NOTIFICATION) })
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "@type")
public class PushNotificationRsrc extends TypedResource implements PushNotification {

	private static final long serialVersionUID = 1L;

	private PushEventType pushEventType;
	private String description;
	private Map<String, String> properties;

	public PushEventType getPushEventType() {
		return pushEventType;
	}

	public void setPushEventType(PushEventType pushEventType) {
		this.pushEventType = pushEventType;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public Map<String, String> getProperties() {
		return properties;
	}

	public void setProperties(Map<String, String> properties) {
		this.properties = properties;
	}
}
