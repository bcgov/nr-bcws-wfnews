package ca.bc.gov.nrs.wfone.notification.push.api.rest.client.v1.impl;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AuthorizationServiceException;

import ca.bc.gov.nrs.common.wfone.rest.resource.BaseResource;
import ca.bc.gov.nrs.common.wfone.rest.resource.RelLink;
import ca.bc.gov.nrs.wfone.common.rest.client.BaseRestServiceClient;
import ca.bc.gov.nrs.wfone.common.rest.client.GenericRestDAO;
import ca.bc.gov.nrs.wfone.common.rest.client.Response;
import ca.bc.gov.nrs.wfone.common.rest.client.RestDAOException;
import ca.bc.gov.nrs.wfone.notification.push.api.rest.client.v1.WildfireNotificationPushService;
import ca.bc.gov.nrs.wfone.notification.push.api.rest.client.v1.WildfireNotificationPushServiceException;
import ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.resource.EndpointsRsrc;
import ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.resource.PushNotificationListRsrc;
import ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.resource.types.ResourceTypes;

public class WildfireNotificationPushServiceImpl extends BaseRestServiceClient implements WildfireNotificationPushService {

	private static final Logger logger = LoggerFactory.getLogger(WildfireNotificationPushServiceImpl.class);
	
	public static final String CLIENT_VERSION = "1";

	private static final String Scopes = "WFONE.*";
	
	/**
	 * Constructor used for making OAuth2 Client Credentials requests
	 * @param webadeOauth2ClientId
	 * @param webadeOauth2ClientSecret
	 * @param webadeOauth2TokenUrl
	 */
	public WildfireNotificationPushServiceImpl(String webadeOauth2ClientId, String webadeOauth2ClientSecret, String webadeOauth2TokenUrl, String scopes) {
		super(webadeOauth2ClientId, webadeOauth2ClientSecret, webadeOauth2TokenUrl, Scopes);
		logger.debug("<WildfireChipsSyncServiceImpl");
		
		logger.debug(">WildfireChipsSyncServiceImpl");
	}
	
	/**
	 * Constructor used for making requests with basic credentials
	 * 
	 * @param headerValue
	 */
	public WildfireNotificationPushServiceImpl(String webadeOauth2ClientId, String webadeOauth2ClientSecret) {
		super(webadeOauth2ClientId, webadeOauth2ClientSecret);
		logger.debug("<WildfireChipsSyncServiceImpl");
		
		logger.debug(">WildfireChipsSyncServiceImpl");
	}
	
	/**
	 * Constructor used for making requests with basic credentials
	 * 
	 * @param webadeOauth2ClientId
	 * @param webadeOauth2ClientSecret
	 */
	public WildfireNotificationPushServiceImpl(String headerValue) {
		super(headerValue);
		logger.debug("<WildfireChipsSyncServiceImpl");
		
		logger.debug(">WildfireChipsSyncServiceImpl");
	}
	
	/**
	 * Constructor used for making requests using the authorization header of the current HttpServletRequest
	 * 
	 */
	public WildfireNotificationPushServiceImpl() {
		super();
		logger.debug("<WildfireChipsSyncServiceImpl");
		
		logger.debug(">WildfireChipsSyncServiceImpl");
	}

	@Override
	public String getClientVersion() {
		return CLIENT_VERSION;
	}

	@Override
	public PushNotificationListRsrc pushNearMeNotifications(EndpointsRsrc parent, String message, String isTest)
			throws WildfireNotificationPushServiceException, UnsupportedEncodingException {
		
		GenericRestDAO<PushNotificationListRsrc> dao = this.getRestDAOFactory().getGenericRestDAO(PushNotificationListRsrc.class);
		
		Map<String, String> queryParams = new HashMap<String, String>();
		putQueryParam(queryParams, "message", toQueryParam(message));
		putQueryParam(queryParams, "test", toQueryParam(isTest));
		
		try {

			Response<PushNotificationListRsrc> response = dao.Process(ResourceTypes.PUSH_NEAR_ME_NOTIFICATIONS, this.getTransformer(), parent,  queryParams, getWebClient());
			
			return response.getResource();

		} catch (RestDAOException e) {
			throw new WildfireNotificationPushServiceException(e);
		}
	}

	public EndpointsRsrc getTopLevelEndpoints() throws WildfireNotificationPushServiceException {
		EndpointsRsrc result = null;

		try {
			GenericRestDAO<EndpointsRsrc> dao = this.getRestDAOFactory().getGenericRestDAO(EndpointsRsrc.class);
			Response<EndpointsRsrc> response = dao.Process(
				ResourceTypes.ENDPOINTS, this.getTransformer(), new BaseResource() {

					private static final long serialVersionUID = 1L;

					@Override
					public List<RelLink> getLinks() {
						List<RelLink> links = new ArrayList<RelLink>();
						links.add(new RelLink(ResourceTypes.ENDPOINTS, getTopLevelRestURL(), "GET"));
						return links;
					}
				}, getWebClient());

			if (404 == response.getResponseCode()) {
				throw new AuthorizationServiceException("Failed to find toplevel at '" + getTopLevelRestURL() + "'");
			}

			result = response.getResource();

		} catch (RestDAOException e) {
			throw new WildfireNotificationPushServiceException(e);
			
		} catch (Throwable t) {
			t.printStackTrace();
			throw new WildfireNotificationPushServiceException(t);
		}

		return result;
	}

	@Override
	public <T> T getPreviousPage(T pagedResource, Class<T> clazz) throws WildfireNotificationPushServiceException {
		logger.debug("<getPreviousPage");

		T result = null;

		try {

			GenericRestDAO<T> dao = this.getRestDAOFactory().getGenericRestDAO(clazz);
			Response<T> response = dao.Process(
					ResourceTypes.PREV, this.getTransformer(), (BaseResource)pagedResource, getWebClient());

			result = response.getResource();

		} catch (RestDAOException e) {
			logger.error(e.getMessage(), e);
			throw new WildfireNotificationPushServiceException(e);
		}

		logger.debug(">getPreviousPage");
		return result;
	}

	@Override
	public <T> T getNextPage(T pagedResource, Class<T> clazz) throws WildfireNotificationPushServiceException {
		logger.debug("<getNextPage");

		T result = null;

		try {

			GenericRestDAO<T> dao = this.getRestDAOFactory().getGenericRestDAO(clazz);
			Response<T> response = dao.Process(
					ResourceTypes.NEXT, this.getTransformer(), (BaseResource)pagedResource, getWebClient());

			result = response.getResource();

		} catch (RestDAOException e) {
			logger.error(e.getMessage(), e);
			throw new WildfireNotificationPushServiceException(e);
		}

		logger.debug(">getNextPage");
		return result;
	}
	
	protected static String toQueryParam(String value) throws UnsupportedEncodingException {
		String result = null;
		if(value != null) {
			result = URLEncoder.encode(value, "UTF-8");
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
