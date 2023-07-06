package ca.bc.gov.nrs.wfone.notification.push.api.rest.client.v1;

import ca.bc.gov.nrs.common.wfone.rest.resource.HealthCheckResponseRsrc;
import ca.bc.gov.nrs.wfone.common.rest.client.RestClientServiceException;
import ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.resource.EndpointsRsrc;
import ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.resource.PushNotificationListRsrc;
import com.amazonaws.services.sqs.model.Message;

import java.io.UnsupportedEncodingException;

public interface WildfireNotificationPushService {
	
	EndpointsRsrc getTopLevelEndpoints() throws WildfireNotificationPushServiceException;

	String getSwaggerString() throws RestClientServiceException;

	HealthCheckResponseRsrc getHealthCheck(String callstack) throws RestClientServiceException;
	
	PushNotificationListRsrc pushNearMeNotifications(EndpointsRsrc parent, String message, String isTest) throws WildfireNotificationPushServiceException, UnsupportedEncodingException;

	<T> T getPreviousPage(T pagedResource, Class<T> clazz) throws WildfireNotificationPushServiceException;

	<T> T getNextPage(T pagedResource, Class<T> clazz) throws WildfireNotificationPushServiceException;
}
