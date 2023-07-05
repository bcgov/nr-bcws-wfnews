package ca.bc.gov.nrs.wfone.api.rest.v1.resource.types;

import ca.bc.gov.nrs.common.wfone.rest.resource.types.BaseResourceTypes;

public class ResourceTypes extends BaseResourceTypes {
	
	public static final String NAMESPACE = "http://notifications.wfone.nrs.gov.bc.ca/v1/";

	public static final String ENDPOINTS_NAME = "endpoints";
	public static final String ENDPOINTS = NAMESPACE + ENDPOINTS_NAME;
	
	public static final String NOTIFICATION_NAME = "notification";
	public static final String NOTIFICATION = NAMESPACE + NOTIFICATION_NAME;

	public static final String NOTIFICATION_SETTINGS_LIST_NAME = "notificationSettingsList";
	public static final String NOTIFICATION_SETTINGS_LIST = NAMESPACE + NOTIFICATION_SETTINGS_LIST_NAME;
	
	public static final String NOTIFICATION_SETTINGS_NAME = "notificationSettings";
	public static final String NOTIFICATION_SETTINGS = NAMESPACE + NOTIFICATION_SETTINGS_NAME;
	public static final String UPDATE_NOTIFICATION_SETTINGS = NAMESPACE + "updateNotificationSettings";
	public static final String DELETE_NOTIFICATION_SETTINGS = NAMESPACE + "deleteNotificationSettings";
	
	public static final String PARTY_USAGE_NAME = "partyUsage";
	public static final String PARTY_USAGE = NAMESPACE + PARTY_USAGE_NAME;
	
	public static final String WILDFIRE_PARTY_NAME = "wildfireParty";
	public static final String WILDFIRE_PARTY = NAMESPACE + WILDFIRE_PARTY_NAME;
	
	public static final String FOREST_FUEL_NAME = "forestFuel";
	public static final String FOREST_FUEL = NAMESPACE + FOREST_FUEL_NAME;
	
	public static final String INCIDENT_MESSAGE_NAME = "incidentMessage";
	public static final String INCIDENT_MESSAGE = NAMESPACE + INCIDENT_MESSAGE_NAME;
	
	public static final String REPORT_OF_FIRE_NAME = "reportOfFire";
	public static final String REPORT_OF_FIRE_MESSAGE = NAMESPACE + REPORT_OF_FIRE_NAME;
	
	public static final String ATTACHMENT_NAME = "attachment";
	public static final String ATTACHMENT = NAMESPACE + ATTACHMENT_NAME;

}