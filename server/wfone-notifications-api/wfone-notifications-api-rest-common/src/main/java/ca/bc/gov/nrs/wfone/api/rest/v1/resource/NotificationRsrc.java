package ca.bc.gov.nrs.wfone.api.rest.v1.resource;

import java.util.List;

import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlSeeAlso;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonSubTypes.Type;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.vividsolutions.jts.geom.Geometry;

import ca.bc.gov.nrs.common.wfone.rest.resource.BaseResource;
import ca.bc.gov.nrs.common.wfone.rest.resource.transformers.GeoJsonJAXBAdapter;
import ca.bc.gov.nrs.common.wfone.rest.resource.transformers.GeoJsonJacksonDeserializer;
import ca.bc.gov.nrs.common.wfone.rest.resource.transformers.GeoJsonJacksonSerializer;
import ca.bc.gov.nrs.wfone.api.model.v1.Notification;
import ca.bc.gov.nrs.wfone.api.rest.v1.resource.types.ResourceTypes;
import io.swagger.v3.oas.annotations.media.Schema;

@XmlRootElement(namespace = ResourceTypes.NAMESPACE, name = ResourceTypes.NOTIFICATION_NAME)
@XmlSeeAlso({  NotificationRsrc.class  })
@JsonSubTypes({ @Type(value = NotificationRsrc.class, name = ResourceTypes.NOTIFICATION) })
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "@type")

public class NotificationRsrc extends BaseResource implements Notification {

	private static final long serialVersionUID = 1361578642568580082L;
	
	private String notificationName;
	private String notificationType;
	private Double radius;
	private Geometry point;
	private Boolean activeIndicator;
	private List<String> topics;	

	@Override
	public Double getRadius() {
		return radius;
	}
	@Override
	public void setRadius(Double radius) {
		this.radius = radius;
	}
	@Override
	@JsonSerialize(using=GeoJsonJacksonSerializer.class)
	@JsonDeserialize(using=GeoJsonJacksonDeserializer.class)
	@XmlJavaTypeAdapter(GeoJsonJAXBAdapter.class)
	@Schema(type="Object")
	public Geometry getPoint() {
		return point;
	}
	@Override
	public void setPoint(Geometry point) {
		this.point = point;
	}
	
	@Override
	public String getNotificationName() {
		return notificationName;
	}
	@Override
	public void setNotificationName(String notificationName) {
		this.notificationName = notificationName;
	}
	@Override
	public String getNotificationType() {
		return notificationType;
	}
	@Override
	public void setNotificationType(String notificationType) {
		this.notificationType = notificationType;
	}
	@Override
	public List<String> getTopics() {
		return topics;
	}
	@Override
	public void setTopics(List<String> topics) {
		this.topics = topics;
	}
	@Override
	public Boolean getActiveIndicator() {
		return activeIndicator;
	}
	@Override
	public void setActiveIndicator(Boolean activeIndicator) {
		this.activeIndicator = activeIndicator;
	}
	

}
