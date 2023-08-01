package ca.bc.gov.mof.wfpointid;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;

@Component
public class PointIdServiceParams {
	
	@Value("${WFGS_URL}}")
	private String wfGeoserverURL;
	
	@Value("${BCGW_URL}")
	private String bcgwGeoserverURL;
	
	@Value("${WFARCGIS_URL}")
	private String wfArcGisURL;
	
	@Value("${WFARCGIS_LAYER_AREA_RESTRICTIONS}")
	private String wfArcGisLayer_Area_Restrictions;
	
	@Value("${WFARCGIS_LAYER_BANS_PROHIBITION_AREAS}")
	private String wfArcGisLayer_Bans_and_Prohibition_Areas;

	@Value("${WFARCGIS_LAYER_DANGER_RATING}")
	private String wfArcGisLayer_Danger_Rating;

	@Value("${WFARCGIS_LAYER_ACTIVE_FIRES}")
	private String wfArcGisLayer_ActiveFires;

	@Value("${WFARCGIS_LAYER_EVACUATION_ORDERS_ALERTS}")
	private String wfArcGisLayer_Evacuation_Orders_Alerts;
	
	@Value("${WFARCGIS_LAYER_FIRE_CENTRE_BOUNDARIES}")
	private String wfArcGisLayer_Fire_Centre_Boundaries;
	
	@Value("${WFARCGIS_QUEUESIZE}")
	private Integer wfArcGisLayer_queueSize;
	
	@Value("${MAX_ALLOWED_RADIUS}")
	private String maxAllowedRadius;
	
	@Value("${ASYNC_JOB_INTERVAL}")
	private String asyncJobInterval;
	
	@Value("${ASYNC_JOB_REF_LAT}")
	private String asyncJobRefLat;
	
	@Value("${ASYNC_JOB_REF_LONG}")
	private String asyncJobRefLon;
	
	@Value("${ASYNC_JOB_REF_RADIUS}")
	private String asyncJobRefRadius;
	
	@Value("${DATABASE_WEATHER_URL}")
	private String weatherJdbcUrl;
	
	@Value("${DATABASE_WEATHER_USER}")
	private String weatherUser;
	
	@Value("${DATABASE_WEATHER_PWD}")
	private String weatherPwd;
	
	@Value("${WEBADE_OAUTH2_CLIENT_ID}")
	private String webadeOauth2ClientId;
	
	@Value("${WEBADE_OAUTH2_CLIENT_SECRET}")
	private String webadeOauth2ClientSecret;
	
	@Value("${WEBADE_OAUTH2_TOKEN_URL}")
	private String webadeOauth2TokenUrl;
	
	@Value("${WEBADE_OAUTH2_CLIENT_SCOPES}")
	private String webadeOauth2ClientScopes;
	
	@Value("${FIREWEATHER_BASEURL}")
	private String fireweatherBaseUrl;
	
	@Value("${FIREWEATHER_QUEUESIZE}")
	private Integer fireweather_queueSize;
	
	@Value("${WFNEWS_BASEURL}")
	private String wfnewsBaseUrl;
	
	@Value("${WFNEWS_QUEUESIZE}")
	private Integer wfnewsQueueSize;

	@Value("${FIREWEATHER_STATIONS_KEY}")
	private String fireweatherStationsKey;

	public PointIdServiceParams() {
	}

	public String getWfGeoserverURL() {
		return wfGeoserverURL==null?null:wfGeoserverURL.trim();
	}

	public String getBcgwGeoserverURL() {
		return bcgwGeoserverURL==null?null:bcgwGeoserverURL.trim();
	}

	public String getWfArcGisURL() {
		return wfArcGisURL==null?null:wfArcGisURL.trim();
	}

	public String getWeatherJdbcUrl() {
		return weatherJdbcUrl==null?null:weatherJdbcUrl.trim();
	}
	
	public String getWeatherUser() {
		return weatherUser==null?null:weatherUser.trim();
	}

	public String getWeatherPwd() {
		return weatherPwd==null?null:weatherPwd.trim();
	}

	public String getMaxAllowedRadius() {
		return maxAllowedRadius==null?null:maxAllowedRadius.trim();
	}

	public String getAsyncJobInterval() {
		return asyncJobInterval==null?null:asyncJobInterval.trim();
	}

	public String getAsyncJobRefLat() {
		return asyncJobRefLat==null?null:asyncJobRefLat.trim();
	}

	public String getAsyncJobRefLon() {
		return asyncJobRefLon==null?null:asyncJobRefLon.trim();
	}

	public String getAsyncJobRefRadius() {
		return asyncJobRefRadius==null?null:asyncJobRefRadius.trim();
	}

	public String getWfArcGisLayer_Bans_and_Prohibition_Areas() {
		return wfArcGisLayer_Bans_and_Prohibition_Areas;
	}

	public String getWfArcGisLayer_ActiveFires() {
		return wfArcGisLayer_ActiveFires;
	}

	public String getWfArcGisLayer_Danger_Rating() {
		return wfArcGisLayer_Danger_Rating;
	}

	public String getWfArcGisLayer_Evacuation_Orders_Alerts() {
		return wfArcGisLayer_Evacuation_Orders_Alerts;
	}

	public String getWfArcGisLayer_Area_Restrictions() {
		return wfArcGisLayer_Area_Restrictions;
	}

	public String getWfArcGisLayer_Fire_Centre_Boundaries() {
		return wfArcGisLayer_Fire_Centre_Boundaries;
	}

	public String getWebadeOauth2ClientId() {
		return webadeOauth2ClientId;
	}

	public String getWebadeOauth2ClientSecret() {
		return webadeOauth2ClientSecret;
	}

	public String getWebadeOauth2TokenUrl() {
		return webadeOauth2TokenUrl;
	}

	public String getFireweatherBaseURL() {
		return fireweatherBaseUrl;
	}

	public String getWebadeOauth2ClientScopes() {
		return webadeOauth2ClientScopes;
	}

	public String getFireweatherStationsKey() {
		return fireweatherStationsKey;
	}

	public Integer getWfArcGisLayerQueueSize() {
		return wfArcGisLayer_queueSize;
	}

	public Integer getFireweatherQueueSize() {
		return fireweather_queueSize;
	}

	public String getWfNewsBaseURL() {
		return wfnewsBaseUrl;
	}

	public Integer getWfNewsQueueSize() {
		return wfnewsQueueSize;
	}


}