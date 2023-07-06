package ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.endpoints;

import org.easymock.EasyMock;
import org.easymock.IMocksControl;
import org.easymock.MockType;
import org.junit.Assert;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.firebase.messaging.FirebaseMessaging;
import org.quartz.Scheduler;

import ca.bc.gov.nrs.wfone.common.model.Message;
import ca.bc.gov.nrs.wfone.notification.push.api.rest.client.v1.WildfireNotificationPushService;
import ca.bc.gov.nrs.wfone.notification.push.api.rest.client.v1.WildfireNotificationPushServiceException;
import ca.bc.gov.nrs.wfone.notification.push.api.rest.client.v1.impl.WildfireNotificationPushServiceImpl;
import ca.bc.gov.nrs.wfone.notification.push.api.rest.test.EndpointsTest;
import ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.resource.EndpointsRsrc;
import ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.resource.PushNotificationListRsrc;
import ca.bc.gov.nrs.wfone.notification.push.aws.client.QueueService;
import ca.bc.gov.nrs.wfone.notification.push.quartz.scheduler.SchedulerConstants;
import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.WildfirePushNotificationServiceV2;
import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.impl.WildfirePushNotificationServiceV2Impl;

import java.io.UnsupportedEncodingException;
import java.util.Arrays;

public class PushNearMeNotificationEndpointsTest extends EndpointsTest {

	private static final Logger logger = LoggerFactory.getLogger(PushNearMeNotificationEndpointsTest.class);

	static IMocksControl control;
	static FirebaseMessaging firebase;
	
	@BeforeClass 
	static public void injectMockFirebaseMessaging() throws Exception {
		control = EasyMock.createControl(MockType.NICE);
		control.makeThreadSafe(true);
		firebase = control.createMock(FirebaseMessaging.class);
		control.replay();
		((WildfirePushNotificationServiceV2Impl)webApplicationContext.getBean(WildfirePushNotificationServiceV2.class)).setFirebaseMessaging(firebase);
	}
	

	@Test
	public void testNoAuthorization() throws WildfireNotificationPushServiceException, UnsupportedEncodingException {
		logger.debug("<testNoAuthorization");

		if(skipTests) {
			logger.warn("Skipping tests");
			return;
		}

		WildfireNotificationPushService service = new WildfireNotificationPushServiceImpl();
		((WildfireNotificationPushServiceImpl) service).setTopLevelRestURL(topLevelRestURL);

		testPushNearMeNotifications(service);

		logger.debug(">testNoAuthorization");
	}

	private static void testPushNearMeNotifications(WildfireNotificationPushService service)
			throws WildfireNotificationPushServiceException, UnsupportedEncodingException {
		logger.debug("<testPushNearMeNotifications");
		
		EndpointsRsrc topLevel = service.getTopLevelEndpoints();

		String testMessage = "{\n" +
			"            \"cacheExpiresMillis\": null,\n" +
			"            \"links\": [\n" +
			"                {\n" +
			"                    \"rel\": \"self\",\n" +
			"                    \"href\": \"http://wfnews-server.pp93w9-dev.nimbus.cloud.gov.bc.ca/publishedIncident\",\n" +
			"                    \"method\": \"GET\",\n" +
			"                    \"_type\": null\n" +
			"                }\n" +
			"            ],\n" +
			"            \"publishedIncidentDetailGuid\": \"667e7803-8d0e-49b8-a745-977d9f28test\",\n" +
			"            \"incidentGuid\": \"7A4E08E98F3C4D78B8DA5169AE3DTEST\",\n" +
			"            \"incidentNumberLabel\": \"Test12345\",\n" +
			"            \"newsCreatedTimestamp\": 1676490600000,\n" +
			"            \"stageOfControlCode\": \"OUT_CNTRL\",\n" +
			"            \"generalIncidentCauseCatId\": 3,\n" +
			"            \"newsPublicationStatusCode\": \"PUBLISHED\",\n" +
			"            \"discoveryDate\": 1676332800000,\n" +
			"            \"declaredOutDate\": null,\n" +
			"            \"fireCentreCode\": \"50\",\n" +
			"            \"fireCentreName\": \"Coastal Fire Centre\",\n" +
			"            \"fireOfNoteInd\": true,\n" +
			"            \"incidentName\": \"Sharon P M TEST\",\n" +
			"            \"incidentLocation\": \"Langley St\",\n" +
			"            \"traditionalTerritoryDetail\": \"EXAMPLE\",\n" +
			"            \"incidentSizeEstimatedHa\": 5,\n" +
			"            \"incidentSizeMappedHa\": 5,\n" +
			"            \"incidentSizeDetail\": \"Fire size is based on most current information available.\",\n" +
			"            \"incidentCauseDetail\": \"Wildfire investigations often take time and can be very complex. Investigations may be carried out by one or more agencies, including the BC Wildfire Service, the Compliance and Enforcement Branch, the RCMP, or other law enforcement agencies, and may be cross jurisdictional.\",\n" +
			"            \"wildfireCrewResourcesInd\": true,\n" +
			"            \"wildfireAviationResourceInd\": true,\n" +
			"            \"heavyEquipmentResourcesInd\": true,\n" +
			"            \"incidentMgmtCrewRsrcInd\": true,\n" +
			"            \"structureProtectionRsrcInd\": true,\n" +
			"            \"publishedTimestamp\": 1677601215387,\n" +
			"            \"lastUpdatedTimestamp\": 1677601215386,\n" +
			"            \"createDate\": 1677601216067,\n" +
			"            \"updateDate\": 1677601216067,\n" +
			"            \"latitude\": \"52.197133000312334\",\n" +
			"            \"longitude\": \"-124.07858300065146\",\n" +
			"            \"fireYear\": 2022,\n" +
			"            \"responseTypeCode\": null,\n" +
			"            \"responseTypeDetail\": null,\n" +
			"            \"selfLink\": \"http://wfnews-server.pp93w9-dev.nimbus.cloud.gov.bc.ca/publishedIncident\",\n" +
			"            \"quotedETag\": null,\n" +
			"            \"unquotedETag\": null,\n" +
			"            \"_type\": null\n" +
			"        }";

		PushNotificationListRsrc updateResultList = service.pushNearMeNotifications(topLevel, testMessage, "False");
		Assert.assertNotNull(updateResultList);

		logger.debug(">testPushNearMeNotifications");
	}

}
