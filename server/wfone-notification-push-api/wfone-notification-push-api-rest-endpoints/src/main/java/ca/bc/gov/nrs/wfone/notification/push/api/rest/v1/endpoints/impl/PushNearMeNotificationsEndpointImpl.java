package ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.endpoints.impl;

import javax.ws.rs.core.Response;

import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.WildfirePushNotificationServiceV2;
import com.amazonaws.services.sqs.model.Message;
import com.amazonaws.services.sqs.model.MessageAttributeValue;
import org.springframework.beans.factory.annotation.Autowired;

import ca.bc.gov.nrs.wfone.common.rest.endpoints.BaseEndpointsImpl;
import ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.endpoints.PushNearMeNotificationsEndpoint;
import ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.resource.PushNotificationListRsrc;

import java.net.URLDecoder;
import java.util.HashMap;
import java.util.Map;

public class PushNearMeNotificationsEndpointImpl extends BaseEndpointsImpl implements PushNearMeNotificationsEndpoint {
	
	@Autowired
	private WildfirePushNotificationServiceV2 wildfirePushNotificationServiceV2;

	@Override
	public Response pushNearMeNotifications(String message, String test) {
		Response response = null;
		
		logRequest();
		
		Boolean isTest = toBoolean(test);

		try {
			String decodedMessage = null;
			if (message != null) {
				decodedMessage = URLDecoder.decode(message, "UTF-8");
			}
			
			// Create a sqs message for unit test
			Message sqsMessage = new Message();
			if (decodedMessage != null) {
				sqsMessage.setBody(decodedMessage);
			} else {
				sqsMessage.setBody("");
			}
			Map<String, MessageAttributeValue> messageAttributes = new HashMap<>();
			MessageAttributeValue messageAttributeValue = new MessageAttributeValue();
			messageAttributeValue.setStringValue("active-fires");
			messageAttributes.put("monitorType", messageAttributeValue);
			sqsMessage.setMessageAttributes(messageAttributes);
			
			PushNotificationListRsrc result = (PushNotificationListRsrc) wildfirePushNotificationServiceV2
					.pushNearMeNotifications(sqsMessage, Boolean.TRUE.equals(isTest), getFactoryContext());

			response = Response.ok().entity(result).build();
		} catch (Throwable t) {
			response = getInternalServerErrorResponse(t);
		}
		
		logResponse(response);

		return response;
	}

	public void setWildfirePushNotificationServiceV2(WildfirePushNotificationServiceV2 wildfirePushNotificationServiceV2) {
		this.wildfirePushNotificationServiceV2 = wildfirePushNotificationServiceV2;
	}
}
