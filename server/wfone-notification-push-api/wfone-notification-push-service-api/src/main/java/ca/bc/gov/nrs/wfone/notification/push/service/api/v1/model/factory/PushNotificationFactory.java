package ca.bc.gov.nrs.wfone.notification.push.service.api.v1.model.factory;

import java.util.List;

import ca.bc.gov.nrs.wfone.common.model.Message;
import ca.bc.gov.nrs.wfone.common.service.api.model.factory.FactoryContext;
import ca.bc.gov.nrs.wfone.common.service.api.model.factory.FactoryException;
import ca.bc.gov.nrs.wfone.notification.push.model.v1.PushNotification;
import ca.bc.gov.nrs.wfone.notification.push.model.v1.PushNotificationList;

public interface PushNotificationFactory {

	PushNotificationList<? extends PushNotification> getPushNotificationList(List<PushNotification> pushNotifications,
			FactoryContext context) throws FactoryException;

	PushNotification getPushNotification(Object resource, FactoryContext context) throws FactoryException;

	PushNotification getPushNotification(Throwable t, FactoryContext context) throws FactoryException;

	PushNotification getPushNotification(String resourceId, Throwable t, FactoryContext context)
			throws FactoryException;

	PushNotification getPushNotification(String resourceId, Object resource, List<Message> messages,
			FactoryContext context) throws FactoryException;

	PushNotification getPushNotification(Object resource, String token, FactoryContext context) throws FactoryException;
}
