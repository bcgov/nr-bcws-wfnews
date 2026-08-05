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

import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.io.geojson.GeoJsonWriter;

import ca.bc.gov.mof.wfpointid.rest.resource.transformers.JsonTransformer;
import ca.bc.gov.mof.wfpointid.rest.resource.transformers.Transformer;

import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.util.MultiValueMap;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import java.io.IOException;

public abstract class BaseRestServiceClient {

	private static final Logger logger = LoggerFactory.getLogger(BaseRestServiceClient.class);

	private RestTemplate restTemplate;
	
	private Transformer transformer;

	private RestDAOFactory restDAOFactory;
	
	private String topLevelRestURL;
	
	public BaseRestServiceClient(String clientId, String clientSecret, String accessTokenUri, String scopes) {
		this(BaseRestServiceClient.createClientCredentialsRestTemplate(clientId, clientSecret, accessTokenUri, scopes));
	}

	public BaseRestServiceClient() {
		this(BaseRestServiceClient.getBasicRestTemplate());
	}

	private static RestTemplate createClientCredentialsRestTemplate(String clientId, String clientSecret, String accessTokenUri, String scopes) {
		RestTemplate restTemplate = new RestTemplate();
		restTemplate.getInterceptors().add(new ClientHttpRequestInterceptor() {
			private String token;
			private long tokenExpirationTime;

			private synchronized String getToken() {
				if (token == null || System.currentTimeMillis() > tokenExpirationTime) {
					fetchToken();
				}
				return token;
			}

			private synchronized void invalidateToken() {
				token = null;
				tokenExpirationTime = 0;
			}

			private void fetchToken() {
				RestTemplate tokenTemplate = new RestTemplate();
				HttpHeaders headers = new HttpHeaders();
				headers.setBasicAuth(clientId, clientSecret);
				headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

				MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
				map.add("grant_type", "client_credentials");
				if (scopes != null && !scopes.isEmpty()) {
					map.add("scope", scopes);
				}

				HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

				ResponseEntity<Map> response;
				try {
					response = tokenTemplate.postForEntity(accessTokenUri, request, Map.class);
				} catch (RestClientException e) {
					logger.error("Failed to obtain OAuth2 client_credentials token from " + accessTokenUri, e);
					throw e;
				}

				Map<String, Object> body = response.getBody();
				if (body == null || body.get("access_token") == null) {
					throw new IllegalStateException("OAuth2 token endpoint " + accessTokenUri + " returned no access_token (status " + response.getStatusCode() + ")");
				}

				token = (String) body.get("access_token");
				Number expiresIn = (Number) body.get("expires_in");
				long expiresInSeconds = expiresIn != null ? expiresIn.longValue() : 3600L;
				tokenExpirationTime = System.currentTimeMillis() + (expiresInSeconds * 1000L) - 60000L;
			}

			@Override
			public ClientHttpResponse intercept(HttpRequest request, byte[] body, ClientHttpRequestExecution execution) throws IOException {
				request.getHeaders().setBearerAuth(getToken());
				ClientHttpResponse response = execution.execute(request, body);
				if (response.getStatusCode().value() == 401) {
					invalidateToken();
				}
				return response;
			}
		});
		return restTemplate;
	}
	
	private static RestTemplate getBasicRestTemplate() {
		
		return new RestTemplate();
	}
	
	public BaseRestServiceClient(RestTemplate restTemplate) {
		logger.debug("<BaseRestServiceClient");
		
		this.restDAOFactory = new RestDAOFactory(getClientVersion());
		
		this.transformer = new JsonTransformer();
		

		
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
