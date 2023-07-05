package ca.bc.gov.nrs.wfone.api.rest.v1.resource.factory;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.core.UriBuilder;

import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.CoordinateSequence;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.GeometryFactory;
import com.vividsolutions.jts.geom.Point;
import com.vividsolutions.jts.geom.impl.CoordinateArraySequence;

import ca.bc.gov.nrs.common.wfone.rest.resource.RelLink;
import ca.bc.gov.nrs.wfone.api.model.v1.Notification;
import ca.bc.gov.nrs.wfone.api.model.v1.NotificationSettings;
import ca.bc.gov.nrs.wfone.api.rest.v1.endpoints.NotificationSettingsEndpoint;
import ca.bc.gov.nrs.wfone.api.rest.v1.resource.NotificationRsrc;
import ca.bc.gov.nrs.wfone.api.rest.v1.resource.NotificationSettingsRsrc;
import ca.bc.gov.nrs.wfone.api.rest.v1.resource.types.ResourceTypes;
import ca.bc.gov.nrs.wfone.common.rest.endpoints.resource.factory.BaseResourceFactory;
import ca.bc.gov.nrs.wfone.common.service.api.model.factory.FactoryContext;
import ca.bc.gov.nrs.wfone.common.service.api.model.factory.FactoryException;
import ca.bc.gov.nrs.wfone.persistence.v1.dto.NotificationDto;
import ca.bc.gov.nrs.wfone.persistence.v1.dto.NotificationSettingsDto;
import ca.bc.gov.nrs.wfone.persistence.v1.dto.NotificationTopicDto;
import ca.bc.gov.nrs.wfone.service.api.v1.model.factory.NotificationSettingsFactory;

public class NotificationSettingsRsrcFactory extends BaseResourceFactory implements NotificationSettingsFactory {

	private static GeometryFactory geomFactory = new GeometryFactory();
	
	@Override
	public NotificationSettingsRsrc getNotificationSettings(
			NotificationSettingsDto dto, 
			FactoryContext context) throws FactoryException {
		
		URI baseUri = getBaseURI(context);
		int resourceDepth = getResourceDepth(context);

		NotificationSettingsRsrc result = getInstance(dto);
		
		populate(result, dto, baseUri, resourceDepth);

		String eTag = getEtag(result);
		
		result.setETag(eTag);

		setSelfLink(dto.getSubscriberGuid(), result, baseUri);

		setLinks(dto.getSubscriberGuid(), result, baseUri);

		return result;
	}
		
	@Override
	public void applyModel(NotificationSettings<? extends Notification> notificationSettings, NotificationSettingsDto dto) {
		
		dto.setSubscriberToken(notificationSettings.getSubscriberToken());
		dto.setNotificationToken(notificationSettings.getNotificationToken());
		dto.setDeviceType(notificationSettings.getDeviceType());
		
		List<NotificationDto> notificationDtos = new ArrayList<NotificationDto>();
		
		if (notificationSettings.getNotifications()!=null) {

			for (Notification notification: notificationSettings.getNotifications() ) {
				
				NotificationDto notificationDto = new NotificationDto();
				
				notificationDto.setNotificationName( notification.getNotificationName() );
				
				notificationDto.setNotificationType(notification.getNotificationType());
				
				notificationDto.setRadius(notification.getRadius());
				
				notificationDto.setActiveIndicator(notification.getActiveIndicator());
				
				if (notification.getPoint()!=null) {
					
					notificationDto.setLatitude(Double.valueOf(notification.getPoint().getCoordinate().y));
				
					notificationDto.setLongitude(Double.valueOf(notification.getPoint().getCoordinate().x));
				} else {
					notificationDto.setLatitude( null );
					
					notificationDto.setLongitude( null );
				}
				
				List<NotificationTopicDto> topicDtos = new ArrayList<>();
				
				if (notification.getTopics()!=null) {
					
					for (String topic: notification.getTopics()) {
					   
						NotificationTopicDto notificationTopicDto = new NotificationTopicDto();
						notificationTopicDto.setNotificationTopicName(topic);
						topicDtos.add(notificationTopicDto);
					}
				}
				
				notificationDto.setTopics(topicDtos);
				
				notificationDtos.add(notificationDto);
			}
		}

		dto.setNotifications(notificationDtos);
	}
		
	private static NotificationSettingsRsrc getInstance(NotificationSettingsDto dto) {
		
		NotificationSettingsRsrc result = new NotificationSettingsRsrc();

		return result;	
	}
		
	static void populate(NotificationSettingsRsrc resource, NotificationSettingsDto dto, URI baseUri, int resourceDepth) throws FactoryException {
		
		resource.setSubscriberGuid(dto.getSubscriberGuid() );
		resource.setSubscriberToken( dto.getSubscriberToken() );
		resource.setNotificationToken(dto.getNotificationToken());
		resource.setDeviceType(dto.getDeviceType());
		
		List<NotificationRsrc> notifications =   new ArrayList<NotificationRsrc>();
		
		if (dto.getNotifications()!=null) {
			
			for (NotificationDto notificationDto: dto.getNotifications()) {
				
				NotificationRsrc notificationRsrc = new NotificationRsrc();
				
				notificationRsrc.setNotificationName(notificationDto.getNotificationName());
				
				notificationRsrc.setNotificationType(notificationDto.getNotificationType());
				
				if (notificationDto.getLatitude()!=null && notificationDto.getLongitude()!=null) {
					Coordinate[] pointCoordinate = { new Coordinate ( notificationDto.getLongitude().doubleValue(), notificationDto.getLatitude().doubleValue()) };
					CoordinateSequence coordinateSequence = new CoordinateArraySequence(pointCoordinate);
					Geometry point =  new Point(coordinateSequence, geomFactory);
			 		
					notificationRsrc.setPoint( point );
				} else 
					notificationRsrc.setPoint( null );
				
				notificationRsrc.setRadius(notificationDto.getRadius());
				
				notificationRsrc.setActiveIndicator(notificationDto.getActiveIndicator());
				
				List<String> topics = new ArrayList<String>();
				
				if (notificationDto.getTopics()!=null) {
					
					for ( NotificationTopicDto  notificationTopicDto: notificationDto.getTopics()) {
						
						topics.add(notificationTopicDto.getNotificationTopicName());
					}
				}
				
				notificationRsrc.setTopics(topics);
				
				notifications.add(notificationRsrc);
			}
		}
		
		resource.setNotifications( notifications );
	}
	
	public static String geNotificationSettingsSelfUri(String subscriberGuid, URI baseUri) {
		
		String result = UriBuilder.fromUri(baseUri)
		.path(NotificationSettingsEndpoint.class)
		.build(subscriberGuid).toString();
		
		return result;
	}
	
	static void setSelfLink(String subscriberGuid, NotificationSettingsRsrc resource, URI baseUri) {
		
		if(subscriberGuid!=null) {
			
			String selfUri = geNotificationSettingsSelfUri(subscriberGuid, baseUri);
			
			resource.getLinks().add(new RelLink(ResourceTypes.SELF, selfUri, "GET"));
		}
	}
	
	private static void setLinks(
			String subscriberGuid, 
			NotificationSettingsRsrc resource, 
			URI baseUri) {

			{
				String result = UriBuilder
						.fromUri(baseUri)
						.path(NotificationSettingsEndpoint.class)
						.build(subscriberGuid).toString();
				resource.getLinks().add(new RelLink(ResourceTypes.UPDATE_NOTIFICATION_SETTINGS, result, "PUT"));
			}

	}
	
}