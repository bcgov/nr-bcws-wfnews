package ca.bc.gov.mof.wfpointid.rest.client;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Date;
import java.util.Iterator;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.client.DefaultOAuth2ClientContext;
import org.springframework.security.oauth2.client.OAuth2ClientContext;
import org.springframework.security.oauth2.client.OAuth2RestTemplate;
import org.springframework.security.oauth2.client.token.grant.client.ClientCredentialsResourceDetails;
import org.springframework.web.client.RestTemplate;

import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.io.geojson.GeoJsonWriter;

import ca.bc.gov.mof.wfpointid.rest.resource.transformers.JsonTransformer;
import ca.bc.gov.mof.wfpointid.rest.resource.transformers.Transformer;

public abstract class BaseRestServiceClient {

	private static final Logger logger = LoggerFactory.getLogger(BaseRestServiceClient.class);

	private RestTemplate restTemplate;
	
	private Transformer transformer;

	private RestDAOFactory restDAOFactory;
	
	private String topLevelRestURL;
	
	public BaseRestServiceClient(String clientId, String clientSecret, String accessTokenUri, String scopes) {
		this(BaseRestServiceClient.getOAuth2RestTemplate(clientId, clientSecret, accessTokenUri, scopes)); 
	}
	
	public BaseRestServiceClient() {
		this(BaseRestServiceClient.getBasicRestTemplate()); 
	}
	
	private static OAuth2RestTemplate getOAuth2RestTemplate(String clientId, String clientSecret, String accessTokenUri, String scopes) {
		ClientCredentialsResourceDetails resource = new ClientCredentialsResourceDetails();
		resource.setClientId(clientId);
		resource.setClientSecret(clientSecret);
		resource.setAccessTokenUri(accessTokenUri);
		
		OAuth2ClientContext context = new DefaultOAuth2ClientContext();
		
		return new OAuth2RestTemplate(resource, context);
	}
	
	private static RestTemplate getBasicRestTemplate() {
		
		return new RestTemplate();
	}
	
	public BaseRestServiceClient(RestTemplate restTemplate) {
		logger.debug("<BaseRestServiceClient");
		
		this.restDAOFactory = new RestDAOFactory(getClientVersion());
		
		this.transformer = new JsonTransformer();
		
		OAuth2ClientContext context = new DefaultOAuth2ClientContext();
		
		this.restTemplate = restTemplate;
		
		logger.debug(">BaseRestServiceClient");
	}	
	
	public abstract String getClientVersion();

	protected RestDAOFactory getRestDAOFactory() {
		return restDAOFactory;
	}

	protected Transformer getTransformer() {
		return transformer;
	}

	protected RestTemplate getRestTemplate() {
		return restTemplate;
	}
	
	public String getTopLevelRestURL() {
		return topLevelRestURL;
	}

	public void setTopLevelRestURL(String topLevelRestURL) {
		this.topLevelRestURL = topLevelRestURL;
	}

	protected static String toQueryParam(String value) throws UnsupportedEncodingException {
		String result = null;
		if(value != null) {
			result = URLEncoder.encode(value, "UTF-8");
		}
		return result;
	}
	
	protected static String toQueryParam(Date value) {
		String result = null;
		if(value != null) {
			result = Long.toString(value.getTime());
		}
		return result;
	}
	
	protected static String toQueryParam(LocalDate value) {
		String result = null;
		if(value != null) {
			result = value.format(DateTimeFormatter.ISO_LOCAL_DATE);
		}
		return result;
	}
	
	protected String toQueryParam(Geometry value) {
		String result = null;
		
		if (value != null) {
			
			try {
				
				GeoJsonWriter geoJsonWriter = new GeoJsonWriter();

				result = geoJsonWriter.write(value);

				result = URLEncoder.encode(result, "UTF-8");
			} catch (UnsupportedEncodingException e) {
				throw new RuntimeException(e);
			}
		}
		
		return result;
	}

	protected static String toQueryParam(Number value) {
		String result = null;
		
		if(value!=null) {
			result = value.toString();
		}
		
		return result;
	}

	protected static String toQueryParam(Boolean value) {
		String result = null;
		
		if(value!=null) {
			result = value.toString();
		}
		
		return result;
	}
	
	protected void putQueryParam(Map<String, String> queryParams, String key, Long... values) {
		String result = "";
		
		if(values!=null) {
			
			for(Iterator<Long> iter = Arrays.asList(values).iterator();iter.hasNext();) {
				Long value = iter.next();
				if(value!=null) {
					
					result += value;
					if(iter.hasNext()) {
						result += ",";
					}
				}
			}
		}
		
		queryParams.put(key, result);
	}
	
	protected void putQueryParam(Map<String, String> queryParams, String key, String... values) {
		String result = "";
		
		if(values!=null) {
			
			for(Iterator<String> iter = Arrays.asList(values).iterator();iter.hasNext();) {
				String value = iter.next();
				if(value!=null) {
					
					result += value;
					if(iter.hasNext()) {
						result += ",";
					}
				}
			}
		}
		
		queryParams.put(key, result);
	}

}
