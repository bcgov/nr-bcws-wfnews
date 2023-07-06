package ca.bc.gov.nrs.wfone.notification.push.service.api.v1.model;

import com.vividsolutions.jts.geom.Geometry;

import java.util.Date;
import java.util.Map;

public class MessageInformation {
	// active-fires
	public static final String FIRE_NUMBER = "incidentNumberLabel";
	public static final String FIRE_YEAR = "fireYear";
	public static final String IGNITION_DATE = "discoveryDate";
	public static final String LONGITUDE = "longitude";
	public static final String LATITUDE = "latitude";
	// area-restrictions
	public static final String NAME = "NAME";
	public static final String FIRE_CENTRE_NAME = "FIRE_CENTRE_NAME";
	public static final String FIRE_ZONE_NAME = "FIRE_ZONE_NAME";
	// evacuation-orders-alerts
	public static final String EVENT_NAME = "EVENT_NAME";
	public static final String ISSUING_AGENCY = "ISSUING_AGENCY";
	// bans-prohibitions, has FIRE_CENTRE_NAME and FIRE_ZONE_NAME too
	public static final String ACCESS_PROHIBITION_DESCRIPTION = "ACCESS_PROHIBITION_DESCRIPTION";
	public static final String TYPE = "TYPE";

	private String messageId;
	private Date messageDate;
	private Geometry geometry;
	private String topic;
	private Map<String, String> eventInformation;

	public MessageInformation(String messageId, Date messageDate, Geometry geometry, String topic,
			Map<String, String> eventInformation) {
		this.messageId = messageId;
		this.messageDate = messageDate;
		this.geometry = geometry;
		this.topic = topic;
		this.eventInformation = eventInformation;
	}

	public String getMessageId() {
		return messageId;
	}

	public void setMessageId(String messageId) {
		this.messageId = messageId;
	}

	public Date getMessageDate() {
		return messageDate;
	}

	public void setMessageDate(Date messageDate) {
		this.messageDate = messageDate;
	}

	public Geometry getGeometry() {
		return geometry;
	}

	public void setGeometry(Geometry geometry) {
		this.geometry = geometry;
	}

	public String getTopic() {
		return topic;
	}

	public void setTopic(String topic) {
		this.topic = topic;
	}

	public Map<String, String> getEventInformation() {
		return eventInformation;
	}

	public void setEventInformation(Map<String, String> eventInformation) {
		this.eventInformation = eventInformation;
	}
}
