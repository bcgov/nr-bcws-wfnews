package ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.resource.types;

import ca.bc.gov.nrs.common.wfone.rest.resource.types.BaseResourceTypes;

public class ResourceTypes extends BaseResourceTypes {
	
	public static final String NAMESPACE = "http://notification.push.wfone.nrs.gov.bc.ca/v1/";

	public static final String ENDPOINTS_NAME = "endpoints";
	public static final String ENDPOINTS = NAMESPACE + ENDPOINTS_NAME;
	
	public static final String PUSH_NEAR_ME_NOTIFICATIONS_NAME = "pushNearMeNotifications";
	public static final String PUSH_NEAR_ME_NOTIFICATIONS = NAMESPACE + PUSH_NEAR_ME_NOTIFICATIONS_NAME;
	
	public static final String PUSH_NOTIFICATION_LIST_NAME = "pushNotificationList";
	public static final String PUSH_NOTIFICATION_LIST = NAMESPACE + PUSH_NOTIFICATION_LIST_NAME;
	
	public static final String PUSH_NOTIFICATION_NAME = "pushNotification";
	public static final String PUSH_NOTIFICATION = NAMESPACE + PUSH_NOTIFICATION_NAME;
}