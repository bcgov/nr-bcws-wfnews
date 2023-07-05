package ca.bc.gov.nrs.wfone.api.rest.v1.endpoints;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.Assert;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.CoordinateSequence;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.GeometryFactory;
import com.vividsolutions.jts.geom.Point;
import com.vividsolutions.jts.geom.impl.CoordinateArraySequence;

import ca.bc.gov.nrs.wfone.api.rest.client.v1.NotificationService;
import ca.bc.gov.nrs.wfone.api.rest.client.v1.ValidationException;
import ca.bc.gov.nrs.wfone.api.rest.client.v1.WildfireResourceServiceException;
import ca.bc.gov.nrs.wfone.api.rest.client.v1.impl.NotificationServiceImpl;
import ca.bc.gov.nrs.wfone.api.rest.test.EndpointsTest;
import ca.bc.gov.nrs.wfone.api.rest.v1.resource.NotificationRsrc;
import ca.bc.gov.nrs.wfone.api.rest.v1.resource.NotificationSettingsRsrc;
import ca.bc.gov.nrs.wfone.service.api.v1.validation.Errors;

public class NotificationSettingsEndpointsTest extends EndpointsTest { 
	
	private static final Logger logger = LoggerFactory.getLogger( NotificationSettingsEndpointsTest.class );


	private static GeometryFactory factory = new GeometryFactory();

	@Test
	public void testNotifications() throws WildfireResourceServiceException {
		logger.debug("<testNoAuthorization");
		
		if(skipTests) {
			logger.warn("Skipping tests");
			return;
		}

		NotificationService service = new NotificationServiceImpl();
		
		(( NotificationServiceImpl ) service).setTopLevelRestURL(topLevelRestURL);
		
			String subscriberGuid = EndpointsTest.getRandomString(64).replace(" " , "");
		
			testCreateNotificationSettings(service, subscriberGuid );
			
			testUpdateNotificationSettings(service, subscriberGuid);
			
			testValidateNotificationSettings(service, subscriberGuid);
			
			testUpdateNotificationSettings(service, subscriberGuid);
			
		
		logger.debug(">testNoAuthorization");
	}

private static String testCreateNotificationSettings(NotificationService service, String subscriberGuid) throws WildfireResourceServiceException {
	
	logger.debug("<testGetNotificationSettings");
	
	try {
		
		NotificationSettingsRsrc notificationSettings  = service.getNotificationSettings( subscriberGuid );
		Assert.assertNotNull(notificationSettings);
		
		notificationSettings.setSubscriberToken(EndpointsTest.getRandomString(65).replace(" " , ""));
		notificationSettings.setNotificationToken( EndpointsTest.getRandomString(65).replace(" " , ""));
		notificationSettings.setDeviceType("iphone");
		
		List<NotificationRsrc>  notifications = new ArrayList<NotificationRsrc>();
		
		NotificationRsrc notification1 =  new NotificationRsrc();
		notification1.setNotificationName("@bcgovfireinfo");
		notification1.setNotificationType("news");
		notification1.setRadius(null);
		notification1.setActiveIndicator(Boolean.FALSE);
		
		Coordinate[] pointCoordinate = { new Coordinate(0.0, 0.0) };  
		CoordinateSequence coordinateSequence = new CoordinateArraySequence(pointCoordinate);
		Geometry point =  new Point(coordinateSequence, factory);
		
		notification1.setPoint(point);
		
		List<String> topics = new ArrayList<String>();
		topics.add("#fires");
		topics.add("#kamloops");
		
		notification1.setTopics(topics);
		
		notifications.add(notification1);
		
		NotificationRsrc notification2 =  new NotificationRsrc();
		notification2.setNotificationName("My House");
		notification2.setNotificationType("nearme");
		notification2.setPoint(point);
		notification2.setActiveIndicator(Boolean.FALSE);
		topics = new ArrayList<String>();
		topics.add("British_Columbia_Bans_and_Prohibition_Areas");
		topics.add("British_Columbia_Area_Restrictions");

		notification2.setTopics(topics);
		
		notifications.add(notification2);
		
		notificationSettings.setNotifications(notifications);

		NotificationSettingsRsrc createdNotificationSettings  =  service.updateNotificationSettings(notificationSettings);
		
		Assert.assertNotNull(createdNotificationSettings);
		assertNotNull( createdNotificationSettings.getSubscriberGuid());
		
		compareNotificationSettings(notificationSettings, createdNotificationSettings);
		
		
		NotificationSettingsRsrc updatedNotificationSettings   = service.getNotificationSettings( createdNotificationSettings.getSubscriberGuid() );
		
		assertEquals(updatedNotificationSettings.getSubscriberToken(), createdNotificationSettings.getSubscriberToken() );
		
		compareNotificationSettings(updatedNotificationSettings, createdNotificationSettings);
		
		subscriberGuid = createdNotificationSettings.getSubscriberGuid();
		
			
	} catch (ValidationException e) {
		e.printStackTrace();
	}
	
	
	logger.debug(">testGetNotificationSettings");
	
	return subscriberGuid;
}		

private static void compareNotificationSettings( NotificationSettingsRsrc first, NotificationSettingsRsrc second) {

	
	assertEquals(first.getSubscriberToken(), second.getSubscriberToken() );
	assertEquals(first.getSubscriberGuid(), second.getSubscriberGuid());
	assertEquals(first.getNotificationToken(), second.getNotificationToken());
	assertEquals(first.getDeviceType(), second.getDeviceType() );
	
	assertEquals(first.getNotifications().size(), second.getNotifications().size() );
	
	Map<String, NotificationRsrc> firstMap = new HashMap<String, NotificationRsrc>();
	Map<String, NotificationRsrc> secondMap = new HashMap<String, NotificationRsrc>();
	
	for (int i=0; i<first.getNotifications().size(); i++ ) {
		firstMap.put(first.getNotifications().get(i).getNotificationName(), first.getNotifications().get(i));
		secondMap.put(second.getNotifications().get(i).getNotificationName(), second.getNotifications().get(i));
	}
	
	for (int i=0; i<first.getNotifications().size(); i++ ) {
		
		NotificationRsrc secondNotification = secondMap.get( first.getNotifications().get(i).getNotificationName() );
		assertNotNull(  secondNotification  );
		
		assertEquals( first.getNotifications().get(i).getNotificationName() , 	secondNotification.getNotificationName() );
		assertEquals( first.getNotifications().get(i).getNotificationType() , 	secondNotification.getNotificationType() );
		assertEquals( first.getNotifications().get(i).getRadius(), 				secondNotification.getRadius());
		assertEquals(first.getNotifications().get(i).getPoint(), 				secondNotification.getPoint());
		assertEquals(first.getNotifications().get(i).getActiveIndicator(), 		secondNotification.getActiveIndicator());
		assertEquals( first.getNotifications().get(i).getTopics().size() , 		secondNotification.getTopics().size() );
		
		Map<String, String> firstTopicSet = new HashMap<String, String>();
		Map<String, String> secondTopicSet = new HashMap<String, String>();
		
		assertEquals( first.getNotifications().get(i).getTopics().size() , secondNotification.getTopics().size() );
		
		for (int j=0; j<first.getNotifications().get(i).getTopics().size(); j++) {
			firstTopicSet.put(first.getNotifications().get(i).getTopics().get(j), first.getNotifications().get(i).getTopics().get(j));
			secondTopicSet.put( secondNotification.getTopics().get(j), secondNotification.getTopics().get(j) );
		}
		
		for (int j=0; j<first.getNotifications().get(i).getTopics().size(); j++)  {
			String secondTopic = secondTopicSet.get( first.getNotifications().get(i).getTopics().get(j)  );
			assertEquals( first.getNotifications().get(i).getTopics().get(j) , secondTopic );
		}	

	}
	
}

private final static String notificationToken = "fbrNye1ORN-2vWMudeyEMR:APA91bFG0N88uzp7czAJzxuRzzD8C8wCZQ2yKEpoLpg1KOuwQ0asVCwWehxthOGC3PUt0Gecrfjdxq2nx86J1Rdj_k6o_XJhhxeTYoY6yLzxH8TE-LMAAyzdDLunpLC7aHdvzkMrP1gS";

private static void testUpdateNotificationSettings(NotificationService service, String subscriberGuid) throws WildfireResourceServiceException {
	
	logger.debug("<testUpdateNotificationSettings");

	try {
		
		NotificationSettingsRsrc notificationSettings  = service.getNotificationSettings( subscriberGuid );
		
		notificationSettings.setNotificationToken(notificationToken);
		notificationSettings.setDeviceType("iphone");
		
		NotificationRsrc notification1 =  notificationSettings.getNotifications().get(0);
		notification1.setNotificationName("@bcgovfireinfo");
		notification1.setNotificationType("news");
		notification1.setRadius(Double.valueOf(29.0));
		notification1.setActiveIndicator(Boolean.TRUE);
		
		Coordinate[] pointCoordinate1 = { new Coordinate(-121.52689, 49.5686998) };
		CoordinateSequence coordinateSequence1 = new CoordinateArraySequence(pointCoordinate1);
		Geometry point =  new Point(coordinateSequence1, factory);
		notification1.setPoint(point);
		
		List<String> topics = new ArrayList<String>();

		topics.add("#fires");
		topics.add("#kamloops");


		notification1.setTopics(topics);
				
		
		NotificationRsrc notification2 =  notificationSettings.getNotifications().get(1);
		notification2.setNotificationName("My House");
		notification2.setNotificationType("nearme");
		notification2.setRadius(Double.valueOf(35.0));
		notification2.setActiveIndicator(Boolean.TRUE);
		
		Coordinate[] pointCoordinate2 = { new Coordinate(-127.6476, 53.7267) };
		CoordinateSequence coordinateSequence2 = new CoordinateArraySequence(pointCoordinate2);
		Geometry point2 =  new Point(coordinateSequence2, factory);
		notification2.setPoint(point2);
		
		
		topics = new ArrayList<String>();
		topics.add("British_Columbia_Area_Restrictions");
		topics.add("British_Columbia_Bans_and_Prohibition_Areas");
		topics.add("BCWS_ActiveFires_PublicView");
		topics.add("Evacuation_Orders_and_Alerts");
		
		

		notification2.setTopics(topics);
	
		NotificationRsrc notification3 = new NotificationRsrc();
		
		if (notificationSettings.getNotifications().size()==3)
			notification3 = notificationSettings.getNotifications().get(2);
		else {
			notificationSettings.getNotifications().add(notification3);
		}
			
		notification3.setNotificationName("My Cabin");
		notification3.setNotificationType("nearme");
		notification3.setRadius(Double.valueOf(500.0));
		notification3.setActiveIndicator(Boolean.TRUE);
		
		Coordinate[] pointCoordinate3 = { new Coordinate(-127.6476, 53.7267) };
		CoordinateSequence coordinateSequence3 = new CoordinateArraySequence(pointCoordinate3);
		Geometry point3 =  new Point(coordinateSequence3, factory);
		notification3.setPoint(point3);
		
		topics = new ArrayList<String>();
		topics.add("British_Columbia_Area_Restrictions");
		topics.add("British_Columbia_Bans_and_Prohibition_Areas");
		topics.add("BCWS_ActiveFires_PublicView");
		

		notification3.setTopics(topics);
		
		
		
		NotificationSettingsRsrc updatedNotificationSettings  =  service.updateNotificationSettings(notificationSettings);
		
		assertNotNull(updatedNotificationSettings);
		
		compareNotificationSettings(notificationSettings, updatedNotificationSettings);
		
		
	} catch (ValidationException e) {
		checkMessages(e);
	}

}

private static void testValidateNotificationSettings(NotificationService service, String subscriberGuid) throws WildfireResourceServiceException {
   try { 
		NotificationSettingsRsrc notificationSettings  = service.getNotificationSettings( subscriberGuid );
		
		notificationSettings.setSubscriberGuid(null);
		notificationSettings.setSubscriberToken(null);
		notificationSettings.setNotificationToken(null);
		notificationSettings.setDeviceType(null);
		
		NotificationRsrc notification1 =  notificationSettings.getNotifications().get(0);
		notification1.setNotificationName(  EndpointsTest.getRandomString(65) ); // very big name
		notification1.setNotificationType( EndpointsTest.getRandomString(65)  );
		notification1.setRadius(Double.valueOf(0.0));
		
		Coordinate[] pointCoordinate4 = { new Coordinate(1.0, 1.0) };
		CoordinateSequence coordinateSequence4 = new CoordinateArraySequence(pointCoordinate4);
		Geometry point4 =  new Point(coordinateSequence4, factory);
		notification1.setPoint(point4);

		
		
		NotificationRsrc notification2 =  notificationSettings.getNotifications().get(1);
		notification2.setNotificationName(  null ); // empty name
		
		
		NotificationSettingsRsrc updatedNotificationSettings  =  service.updateNotificationSettings(notificationSettings);
		assertNotNull(updatedNotificationSettings);
		
	} catch (ValidationException e) {
		checkMessages(e, 	Errors.SUBSCRIBER_GUID_NOTBLANK,
							Errors.SUBSCRIBER_TOKEN_NOTBLANK,
							Errors.NOTIFICATION_TOKEN_NOTBLANK,
							Errors.NOTIFICATION_NAME_SIZE, 
							Errors.NOTIFICATION_NAME_NOTBLANK,
							Errors.NOTIFICATION_TYPE_SIZE,
							Errors.NOTIFICATION_RADIUS_MIN_SIZE,
							Errors.NOTIFICATION_LONGITUDE_SIZE
							);
	}
		
   try { 
		NotificationSettingsRsrc notificationSettings  = service.getNotificationSettings( subscriberGuid );
		
		notificationSettings.setSubscriberGuid(EndpointsTest.getRandomString( 65  ));
		notificationSettings.setSubscriberToken(EndpointsTest.getRandomString(257));
		notificationSettings.setNotificationToken( EndpointsTest.getRandomString(257) );
		notificationSettings.setDeviceType( EndpointsTest.getRandomString(65) );
		
		NotificationRsrc notification1 =  notificationSettings.getNotifications().get(0);
		notification1.getTopics().add(EndpointsTest.getRandomString(65));
		
		NotificationSettingsRsrc updatedNotificationSettings  =  service.updateNotificationSettings(notificationSettings);
		assertNotNull(updatedNotificationSettings);
		
	} catch (ValidationException e) {
		checkMessages(e, 	Errors.SUBSCRIBER_GUID_SIZE,  
							Errors.SUBSCRIBER_TOKEN_SIZE, 
							Errors.NOTIFICATION_TOKEN_SIZE,
							Errors.DEVICE_TYPE_SIZE,
							Errors.TOPIC_SIZE);
	}
	
	logger.debug(">testUpdateNotificationSettings");
}		

}
