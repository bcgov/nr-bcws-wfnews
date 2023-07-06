package ca.bc.gov.nrs.wfone.notification.push.service.api.v1;

import ca.bc.gov.nrs.wfone.common.service.api.ServiceException;
import ca.bc.gov.nrs.wfone.common.service.api.model.factory.FactoryContext;
import ca.bc.gov.nrs.wfone.notification.push.model.v1.PushNotification;
import ca.bc.gov.nrs.wfone.notification.push.model.v1.PushNotificationList;
import com.amazonaws.services.sqs.model.Message;

public interface WildfirePushNotificationServiceV2 {
	// Get new incident message from aws sqs and push notification to subscribers
	PushNotificationList<? extends PushNotification> pushNearMeNotifications(Message message, boolean isTest,
			FactoryContext factoryContext) throws ServiceException;
}
