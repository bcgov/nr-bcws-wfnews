package ca.bc.gov.mof.wfpointid;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;

@Component
@PropertySource({"classpath:application.properties", "classpath:application-secrets.properties"})
public class PointIdServiceParams {
	
	@Value("${wfgs.url}")
	private String wfGeoserverURL;
	
	@Value("${bcgw.url}")
	private String bcgwGeoserverURL;
	
	@Value("${wfArcGis.url}")
	private String wfArcGisURL;
	

	@Value("${wfArcGis.layer.Area.Restrictions}")
	private String wfArcGisLayer_Area_Restrictions;
	
	@Value("${wfArcGis.layer.Bans.Prohibition.Areas}")
	private String wfArcGisLayer_Bans_and_Prohibition_Areas;

	@Value("${wfArcGis.layer.Danger.Rating}")
	private String wfArcGisLayer_Danger_Rating;

	@Value("${wfArcGis.layer.ActiveFires}")
	private String wfArcGisLayer_ActiveFires;

	@Value("${wfArcGis.layer.Evacuation.Orders.Alerts}")
	private String wfArcGisLayer_Evacuation_Orders_Alerts;
	
	@Value("${wfArcGis.layer.Fire.Centre.Boundaries}")
	private String wfArcGisLayer_Fire_Centre_Boundaries;
	
	@Value("${wfArcGis.queueSize}")
	private Integer wfArcGisLayer_queueSize;
	
	@Value("${max.allowed.radius}")
	private String maxAllowedRadius;
	
	@Value("${async.job.interval}")
	private String asyncJobInterval;
	
	@Value("${async.job.ref.lat}")
	private String asyncJobRefLat;
	
	@Value("${async.job.ref.lon}")
	private String asyncJobRefLon;
	
	@Value("${async.job.ref.radius}")
	private String asyncJobRefRadius;
	
	@Value("${database.weather.url}")
	private String weatherJdbcUrl;
	
	@Value("${database.weather.user}")
	private String weatherUser;
	
	@Value("${database.weather.pwd}")
	private String weatherPwd;
	
	@Value("${webade.oauth2.client.id}")
	private String webadeOauth2ClientId;
	
	@Value("${webade.oauth2.client.secret}")
	private String webadeOauth2ClientSecret;
	
	@Value("${webade.oauth2.token.url}")
	private String webadeOauth2TokenUrl;
	
	@Value("${webade.oauth2.client.scopes}")
	private String webadeOauth2ClientScopes;
	
	@Value("${fireweather.baseUrl}")
	private String fireweatherBaseUrl;
	
	@Value("${fireweather.queueSize}")
	private Integer fireweather_queueSize;
	
	@Value("${wfnews.baseUrl}")
	private String wfnewsBaseUrl;
	
	@Value("${wfnews.queueSize}")
	private Integer wfnewsQueueSize;

	@Value("${fireweather.stations.key}")
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