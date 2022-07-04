package ca.bc.gov.nrs.wfnews.service.api.v1.validation;

public class Errors {
	
	public static final String NOTIFICATION_NAME_NOTBLANK = "errors.notification.name.notblank";
	public static final String NOTIFICATION_NAME_SIZE = "errors.notification.name.size";
	public static final String NOTIFICATION_NAME_DUPLICATED = "errors.notification.name.duplicated";
	public static final String NOTIFICATION_TOKEN_NOTBLANK = "errors.notification.token.notblank";
	public static final String NOTIFICATION_TOKEN_SIZE = "errors.notification.token.size";
	public static final String NOTIFICATION_TYPE_NOTBLANK = "errors.notification.type.notblank";
	public static final String NOTIFICATION_TYPE_SIZE = "errors.notification.type.size";
	public static final String NOTIFICATION_RADIUS_MIN_SIZE = "errors.notification.radius.min.size";
	public static final String NOTIFICATION_RADIUS_MAX_SIZE = "errors.notification.radius.max.size";
	public static final String NOTIFICATION_LONGITUDE_SIZE = "errors.notification.longitude.size";
	public static final String NOTIFICATION_LATITUDE_SIZE = "errors.notification.latitude.size";
	public static final String SUBSCRIBER_GUID_NOTBLANK = "errors.subscriber.guid.notblank";
	public static final String SUBSCRIBER_GUID_SIZE = "errors.subscriber.guid.size";
	public static final String SUBSCRIBER_TOKEN_NOTBLANK = "errors.subscriber.token.notblank";
	public static final String SUBSCRIBER_TOKEN_SIZE = "errors.subscriber.token.size";
	public static final String TOPIC_NOTBLANK = "errors.topic.notblank";
	public static final String TOPIC_VALUE_INVALID = "errors.topic.value.invalid";
	public static final String TOPIC_SIZE = "errors.topic.size";
	public static final String TOPIC_DUPLICATED = "errors.topic.duplicated";
	public static final String DEVICE_TYPE_SIZE = "errors.device.type..size";
	public static final String ROF_CONSENT_NOT_NULL = "cosentToCall cannot be null";
	public static final String ROF_BURNING_NOT_NULL = "burning cannot be null";
	public static final String ROF_SMOKE_COLOUR_NOT_NULL = "smokeColor cannot be null";
	public static final String ROF_WEATHER_NOT_NULL = "weather cannot be null";
	public static final String ROF_ASSETS_NOT_NULL = "assetsAtRisk cannot be null";
	public static final String ROF_SIGNS_NOT_NULL = "signsOfResponse cannot be null";
	public static final String ROF_FIRE_LOCATION_NOT_NULL = "fireLocation cannot be null";
	public static final String ROF_BURNING_SIZE = "Invalid size for burning array";
	public static final String ROF_SMOKE_COLOUR_SIZE = "Invalid size for smokeColor array";
	public static final String ROF_WEATHER_SIZE = "Invalid size for weather array";
	public static final String ROF_ASSETS_SIZE = "Invalid size for assetsAtRisk array";
	public static final String ROF_SIGNS_SIZE = "Invalid size for sigsOfResponse array";
	public static final String ROF_FIRE_LOCATION_SIZE = "Invalid size for fireLocation array";
	public static final String ROF_OTHER_INFO_SIZE = "Invalid size for otherInfo field";
	public static final String ROF_FIRE_SIZE_INVALID = "Invalid RoF fireSize value";
	public static final String ROF_RATE_OF_SPREAD_INVALID = "Invalid RoF rateOfSpread value";
	public static final String ROF_SMOKE_COLOR_INVALID = "Invalid RoF smokeColor value";
	public static final String ROF_BURNING_INVALID = "Invalid RoF burning value";
	
}

