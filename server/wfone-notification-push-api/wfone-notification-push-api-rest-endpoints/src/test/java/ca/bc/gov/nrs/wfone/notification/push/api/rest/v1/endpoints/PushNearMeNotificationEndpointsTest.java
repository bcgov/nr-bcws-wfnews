package ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.endpoints;

import org.easymock.EasyMock;
import org.easymock.IMocksControl;
import org.easymock.MockType;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
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

	@BeforeAll
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

		String testMessage = """
			{
			            "cacheExpiresMillis": null,
			            "links": [
			                {
			                    "rel": "self",
			                    "href": "http://wfnews-server.d6797f-dev.stratus.cloud.gov.bc.ca/publishedIncident",
			                    "method": "GET",
			                    "_type": null
			                }
			            ],
			            "publishedIncidentDetailGuid": "667e7803-8d0e-49b8-a745-977d9f28test",
			            "incidentGuid": "7A4E08E98F3C4D78B8DA5169AE3DTEST",
			            "incidentNumberLabel": "Test12345",
			            "newsCreatedTimestamp": 1676490600000,
			            "stageOfControlCode": "OUT_CNTRL",
			            "generalIncidentCauseCatId": 3,
			            "newsPublicationStatusCode": "PUBLISHED",
			            "discoveryDate": 1676332800000,
			            "declaredOutDate": null,
			            "fireCentreCode": "50",
			            "fireCentreName": "Coastal Fire Centre",
			            "fireOfNoteInd": true,
			            "incidentName": "Sharon P M TEST",
			            "incidentLocation": "Langley St",
			            "traditionalTerritoryDetail": "EXAMPLE",
			            "incidentSizeEstimatedHa": 5,
			            "incidentSizeMappedHa": 5,
			            "incidentSizeDetail": "Fire size is based on most current information available.",
			            "incidentCauseDetail": "Wildfire investigations often take time and can be very complex. Investigations may be carried out by one or more agencies, including the BC Wildfire Service, the Compliance and Enforcement Branch, the RCMP, or other law enforcement agencies, and may be cross jurisdictional.",
			            "wildfireCrewResourcesInd": true,
			            "wildfireAviationResourceInd": true,
			            "heavyEquipmentResourcesInd": true,
			            "incidentMgmtCrewRsrcInd": true,
			            "structureProtectionRsrcInd": true,
			            "publishedTimestamp": 1677601215387,
			            "lastUpdatedTimestamp": 1677601215386,
			            "createDate": 1677601216067,
			            "updateDate": 1677601216067,
			            "latitude": "52.197133000312334",
			            "longitude": "-124.07858300065146",
			            "fireYear": 2022,
			            "responseTypeCode": null,
			            "responseTypeDetail": null,
			            "selfLink": "http://wfnews-server.d6797f-dev.stratus.cloud.gov.bc.ca/publishedIncident",
			            "quotedETag": null,
			            "unquotedETag": null,
			            "_type": null
			        }\
			""";

		PushNotificationListRsrc updateResultList = service.pushNearMeNotifications(topLevel, testMessage, "False");
		Assertions.assertNotNull(updateResultList);

		logger.debug(">testPushNearMeNotifications");
	}

}
