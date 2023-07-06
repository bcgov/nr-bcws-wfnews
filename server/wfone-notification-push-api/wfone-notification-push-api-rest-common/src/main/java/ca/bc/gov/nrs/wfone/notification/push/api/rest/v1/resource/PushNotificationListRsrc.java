package ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.resource;

import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.annotation.XmlRootElement;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonSubTypes.Type;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import ca.bc.gov.nrs.common.wfone.rest.resource.TypedResource;
import ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.resource.types.ResourceTypes;
import ca.bc.gov.nrs.wfone.notification.push.model.v1.PushNotificationList;

@XmlRootElement(namespace = ResourceTypes.NAMESPACE, name = ResourceTypes.PUSH_NOTIFICATION_LIST_NAME)
@JsonSubTypes({ @Type(value = PushNotificationListRsrc.class, name = ResourceTypes.PUSH_NOTIFICATION_LIST) })
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "@type")
public class PushNotificationListRsrc extends TypedResource implements PushNotificationList<PushNotificationRsrc> {
	private static final long serialVersionUID = 1L;

	private List<PushNotificationRsrc> collection = new ArrayList<PushNotificationRsrc>(0);

	public PushNotificationListRsrc() {
		collection = new ArrayList<PushNotificationRsrc>();
	}

	@Override
	public List<PushNotificationRsrc> getCollection() {
		return collection;
	}

	@Override
	public void setCollection(List<PushNotificationRsrc> collection) {
		this.collection = collection;
	}
}