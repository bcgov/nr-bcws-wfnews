package ca.bc.gov.nrs.wfone.api.rest.v1.resource;

import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.annotation.XmlRootElement;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import ca.bc.gov.nrs.common.wfone.rest.resource.PagedResource;
import ca.bc.gov.nrs.wfone.api.model.v1.NotificationSettingsList;
import ca.bc.gov.nrs.wfone.api.rest.v1.resource.types.ResourceTypes;

import com.fasterxml.jackson.annotation.JsonSubTypes.Type;

@XmlRootElement(namespace = ResourceTypes.NAMESPACE, name = ResourceTypes.NOTIFICATION_SETTINGS_LIST_NAME)
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "@type")
@JsonSubTypes({ @Type(value = NotificationSettingsListRsrc.class, name = ResourceTypes.NOTIFICATION_SETTINGS_LIST) })
public class NotificationSettingsListRsrc extends PagedResource implements NotificationSettingsList<NotificationSettingsRsrc>  {

	private static final long serialVersionUID = -937927457833195110L;
	
	private List<NotificationSettingsRsrc> collection = new ArrayList<NotificationSettingsRsrc>();
	
	public NotificationSettingsListRsrc() {
		collection = new ArrayList<NotificationSettingsRsrc>();
	}
	
	
	@Override
	public List<NotificationSettingsRsrc> getCollection() {
		return collection;
	}

	
	@Override
	public void setCollection(List<NotificationSettingsRsrc> collection) {
		this.collection = collection;
	}



}
