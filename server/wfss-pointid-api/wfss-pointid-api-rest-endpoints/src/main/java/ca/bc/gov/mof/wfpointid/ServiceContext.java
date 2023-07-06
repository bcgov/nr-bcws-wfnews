package ca.bc.gov.mof.wfpointid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import ca.bc.gov.mof.wfpointid.identify.IdentifyService;
import ca.bc.gov.mof.wfpointid.rest.endpoint.PointIdEndpoints;
import ca.bc.gov.mof.wfpointid.weather.FireweatherWeatherService;
import ca.bc.gov.mof.wfpointid.weather.JdbcWeatherService;
import ca.bc.gov.mof.wfpointid.weather.WeatherService;

@Component
public class ServiceContext {
	
	private static Logger LOG = LoggerFactory.getLogger(PointIdEndpoints.class);
	
	/**
	 * The services are singletons
	 */
	
	private static IdentifyService identifyService;

	private static JdbcWeatherService weatherService;
	
	private static FireweatherWeatherService fireweatherWeatherService;

	@Autowired
	PointIdServiceParams param;
	
	public ServiceContext() {
		
	}

	public synchronized IdentifyService getIdentifyService() {
		
		String wfGeoserverURL = param.getWfGeoserverURL();
		String bcgwGeoserverURL = param.getBcgwGeoserverURL();
		
		if (identifyService == null) {
			
			if((wfGeoserverURL!=null&&wfGeoserverURL.trim().length()>0)&&(bcgwGeoserverURL!=null&&bcgwGeoserverURL.trim().length()>0)) {
				
				identifyService = new IdentifyService(wfGeoserverURL, bcgwGeoserverURL);
			}
		} else {

			LOG.info("wfGeoserverURL="+wfGeoserverURL);
			LOG.info("bcgwGeoserverURL="+bcgwGeoserverURL);
		}
		
		return identifyService;
	}
	
	public WeatherService getWeatherService() {
		return getWildfireFireweatherService();
	}
	
	public synchronized JdbcWeatherService getJdbcWeatherService() {

		String weatherJdbcUrl = param.getWeatherJdbcUrl();
		String weatherUser = param.getWeatherUser();
		String weatherPwd = param.getWeatherPwd();
		
		if (weatherService == null) {
			
			if((weatherJdbcUrl!=null&&weatherJdbcUrl.trim().length()>0)
					&&(weatherUser!=null&&weatherUser.trim().length()>0)
					&&(weatherPwd!=null&&weatherPwd.trim().length()>0)) {
				
				weatherService = new JdbcWeatherService(weatherJdbcUrl, weatherUser, weatherPwd);
			}
		} else {

			LOG.info("weatherHost="+weatherJdbcUrl);
			LOG.info("weatherUser="+weatherUser);
			LOG.info("weatherPwd="+(weatherPwd!=null&&weatherPwd.trim().length()>0));
		}
		
		return weatherService;
	}
	
	public synchronized FireweatherWeatherService getWildfireFireweatherService() {

		String fireweatherBaseUrl = param.getFireweatherBaseURL();
		String webadeOauth2ClientId = param.getWebadeOauth2ClientId();
		String webadeOauth2ClientSecret = param.getWebadeOauth2ClientSecret(); 
		String webadeOauth2TokenUrl = param.getWebadeOauth2TokenUrl(); 
		String scopes = param.getWebadeOauth2ClientScopes();
		
		if (fireweatherWeatherService == null) {
			
			if((webadeOauth2ClientId!=null&&webadeOauth2ClientId.trim().length()>0)
					&&(webadeOauth2ClientSecret!=null&&webadeOauth2ClientSecret.trim().length()>0)
					&&(webadeOauth2TokenUrl!=null&&webadeOauth2TokenUrl.trim().length()>0)) {
				
				fireweatherWeatherService = new FireweatherWeatherService(
						fireweatherBaseUrl,
						webadeOauth2ClientId, 
						webadeOauth2ClientSecret, 
						webadeOauth2TokenUrl, 
						scopes);
			}
		} else {

			LOG.info("webadeOauth2ClientId="+webadeOauth2ClientId);
			LOG.info("webadeOauth2ClientSecret="+(webadeOauth2ClientSecret!=null&&webadeOauth2ClientSecret.trim().length()>0));
			LOG.info("webadeOauth2TokenUrl="+webadeOauth2TokenUrl);
		}
		
		return fireweatherWeatherService;
	}
}
