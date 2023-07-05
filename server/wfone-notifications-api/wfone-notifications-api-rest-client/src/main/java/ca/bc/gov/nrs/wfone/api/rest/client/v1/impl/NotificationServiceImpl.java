package ca.bc.gov.nrs.wfone.api.rest.client.v1.impl;

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
import ca.bc.gov.nrs.common.wfone.rest.resource.CodeHierarchyListRsrc;
import ca.bc.gov.nrs.common.wfone.rest.resource.CodeHierarchyRsrc;
import ca.bc.gov.nrs.common.wfone.rest.resource.CodeTableListRsrc;
import ca.bc.gov.nrs.common.wfone.rest.resource.CodeTableRsrc;
import ca.bc.gov.nrs.common.wfone.rest.resource.RelLink;
import ca.bc.gov.nrs.wfone.api.rest.client.v1.NotificationService;
import ca.bc.gov.nrs.wfone.api.rest.client.v1.ValidationException;
import ca.bc.gov.nrs.wfone.api.rest.client.v1.WildfireResourceServiceException;
import ca.bc.gov.nrs.wfone.api.rest.v1.resource.EndpointsRsrc;
import ca.bc.gov.nrs.wfone.api.rest.v1.resource.NotificationSettingsRsrc;
import ca.bc.gov.nrs.wfone.api.rest.v1.resource.types.ResourceTypes;
import ca.bc.gov.nrs.wfone.common.rest.client.BadRequestException;
import ca.bc.gov.nrs.wfone.common.rest.client.BaseRestServiceClient;
import ca.bc.gov.nrs.wfone.common.rest.client.GenericRestDAO;
import ca.bc.gov.nrs.wfone.common.rest.client.Response;
import ca.bc.gov.nrs.wfone.common.rest.client.RestDAOException;

public class NotificationServiceImpl extends BaseRestServiceClient implements NotificationService {

	private static final Logger logger = LoggerFactory.getLogger(NotificationServiceImpl.class);
	
	public static final String CLIENT_VERSION = "2";

	private static final String Scopes = "WEBADE-REST.*";
	
	/**
	 * Constructor used for making OAuth2 Client Credentials requests
	 * @param webadeOauth2ClientId
	 * @param webadeOauth2ClientSecret
	 * @param webadeOauth2TokenUrl
	 */
	public NotificationServiceImpl(String webadeOauth2ClientId, String webadeOauth2ClientSecret, String webadeOauth2TokenUrl, String scopes) {
		super(webadeOauth2ClientId, webadeOauth2ClientSecret, webadeOauth2TokenUrl, Scopes);
		logger.debug("<NotificationServiceImpl");
		
		logger.debug(">NotificationServiceImpl");
	}
	
	/**
	 * Constructor used for making requests with basic credentials
	 * 
	 * @param headerValue
	 */
	public NotificationServiceImpl(String webadeOauth2ClientId, String webadeOauth2ClientSecret) {
		super(webadeOauth2ClientId, webadeOauth2ClientSecret);
		logger.debug("<NotificationServiceImpl");
		
		logger.debug(">NotificationServiceImpl");
	}
	
	/**
	 * Constructor used for making requests with basic credentials
	 * 
	 * @param webadeOauth2ClientId
	 * @param webadeOauth2ClientSecret
	 */
	public NotificationServiceImpl(String headerValue) {
		super(headerValue);
		logger.debug("<NotificationServiceImpl");
		
		logger.debug(">NotificationServiceImpl");
	}
	
	/**
	 * Constructor used for making requests using the authorization header of the current HttpServletRequest
	 * 
	 */
	public NotificationServiceImpl() {
		super();
		logger.debug("<NotificationServiceImpl");
		
		logger.debug(">NotificationServiceImpl");
	}

	@Override
	public NotificationSettingsRsrc getNotificationSettings(String subscriberGuid) 	throws WildfireResourceServiceException {

		GenericRestDAO<NotificationSettingsRsrc> dao = this.getRestDAOFactory().getGenericRestDAO(NotificationSettingsRsrc.class);
		
		try {
			Response<NotificationSettingsRsrc> response = dao.Process(ResourceTypes.NOTIFICATION_SETTINGS , this.getTransformer(), new BaseResource() {

				private static final long serialVersionUID = 1L;

				@Override
				public List<RelLink> getLinks() {
					List<RelLink> links = new ArrayList<RelLink>();
					links.add(new RelLink(ResourceTypes.NOTIFICATION_SETTINGS, 
							getTopLevelRestURL()+"notificationSettings/"+subscriberGuid, 
							"GET"));
					return links;
				}
			}, getWebClient());
			return response.getResource();
			
		} catch (RestDAOException rde) {
			throw new WildfireResourceServiceException(rde);
		}
	}
		
	@Override
	public NotificationSettingsRsrc updateNotificationSettings(NotificationSettingsRsrc resource) throws WildfireResourceServiceException, ValidationException {
		
		GenericRestDAO<NotificationSettingsRsrc> dao = this.getRestDAOFactory().getGenericRestDAO(NotificationSettingsRsrc.class);
		
		try {
			
			String subscriberGuid = URLEncoder.encode(resource.getSubscriberGuid()==null?"null":resource.getSubscriberGuid(), "UTF-8");
			
			Response<NotificationSettingsRsrc> response = dao.Process(ResourceTypes.UPDATE_NOTIFICATION_SETTINGS, this.getTransformer(), new BaseResource() {

				private static final long serialVersionUID = 1L;

				@Override
				public List<RelLink> getLinks() {
					List<RelLink> links = new ArrayList<RelLink>();
					links.add(new RelLink(ResourceTypes.UPDATE_NOTIFICATION_SETTINGS, 
							getTopLevelRestURL()+"notificationSettings/"+subscriberGuid, 
							"PUT"));
					return links;
				}
			}, resource, getWebClient());
			return response.getResource();
			
		} catch(BadRequestException e) {
			throw new ValidationException(e.getMessages());

		} catch (RestDAOException rde) {
			throw new WildfireResourceServiceException(rde);
		} catch (UnsupportedEncodingException e) {
			throw new WildfireResourceServiceException(e);
		}
	}
	
	@Override
	public CodeTableListRsrc getCodeTables(
			EndpointsRsrc parent,
			String codeTableName, 
			LocalDate effectiveAsOfDate) throws WildfireResourceServiceException {
		logger.debug("<getCodeTables");

		CodeTableListRsrc result = null;

		try {

			Map<String, String> queryParams = new HashMap<String, String>();
			putQueryParam(queryParams, "codeTableName", codeTableName);
			putQueryParam(queryParams, "effectiveAsOfDate", toQueryParam(effectiveAsOfDate));

			GenericRestDAO<CodeTableListRsrc> dao = this.getRestDAOFactory()
					.getGenericRestDAO(CodeTableListRsrc.class);
			Response<CodeTableListRsrc> response = dao.Process(
					ResourceTypes.CODE_TABLE_LIST, this.getTransformer(), parent, queryParams,
					getWebClient());

			result = response.getResource();

		} catch (RestDAOException e) {
			logger.error(e.getMessage(), e);
			throw new WildfireResourceServiceException(e);
		}

		logger.debug(">getCodeTables");
		return result;
	}

	@Override
	public CodeTableRsrc getCodeTable(CodeTableRsrc codeTable, LocalDate effectiveAsOfDate) throws WildfireResourceServiceException {
		logger.debug("<getCodeTable");

		CodeTableRsrc result = null;

		try {

			Map<String, String> queryParams = new HashMap<String, String>();
			putQueryParam(queryParams, "effectiveAsOfDate", toQueryParam(effectiveAsOfDate));

			GenericRestDAO<CodeTableRsrc> dao = this.getRestDAOFactory()
					.getGenericRestDAO(CodeTableRsrc.class);
			Response<CodeTableRsrc> response = dao.Process(
					ResourceTypes.SELF, this.getTransformer(), codeTable, queryParams, getWebClient());

			result = response.getResource();

		} catch (RestDAOException e) {
			logger.error(e.getMessage(), e);
			throw new WildfireResourceServiceException(e);
		}

		logger.debug(">getCodeTable");
		return result;
	}

	@Override
	public CodeTableRsrc updateCodeTable(CodeTableRsrc codeTable)
			throws WildfireResourceServiceException, ValidationException {

		GenericRestDAO<CodeTableRsrc> dao = this.getRestDAOFactory().getGenericRestDAO(CodeTableRsrc.class);
		
		try {
			Response<CodeTableRsrc> response = dao.Process(ResourceTypes.UPDATE_CODE_TABLE, this.getTransformer(), codeTable, getWebClient());
			return response.getResource();
			
		} catch(BadRequestException e) {
			throw new ValidationException(e.getMessages());
		} catch (RestDAOException rde) {
			logger.error(rde.getMessage(), rde);
			throw new WildfireResourceServiceException(rde);
		}
	}

	@Override
	public CodeHierarchyListRsrc getCodeHierarchys(
			EndpointsRsrc parent,
			String codeHierarchyName, 
			LocalDate effectiveAsOfDate) throws WildfireResourceServiceException {
		logger.debug("<getCodeHierarchys");

		CodeHierarchyListRsrc result = null;

		try {

			Map<String, String> queryParams = new HashMap<String, String>();
			putQueryParam(queryParams, "codeHierarchyName", codeHierarchyName);
			putQueryParam(queryParams, "effectiveAsOfDate", toQueryParam(effectiveAsOfDate));

			GenericRestDAO<CodeHierarchyListRsrc> dao = this.getRestDAOFactory()
					.getGenericRestDAO(CodeHierarchyListRsrc.class);
			Response<CodeHierarchyListRsrc> response = dao.Process(
					ResourceTypes.CODE_HIERARCHY_LIST, this.getTransformer(), parent, queryParams,
					getWebClient());

			result = response.getResource();

		} catch (RestDAOException e) {
			logger.error(e.getMessage(), e);
			throw new WildfireResourceServiceException(e);
		}

		logger.debug(">getCodeHierarchys");
		return result;
	}

	@Override
	public CodeHierarchyRsrc getCodeHierarchy(CodeHierarchyRsrc codeHierarchy, LocalDate effectiveAsOfDate) throws WildfireResourceServiceException {
		logger.debug("<getCodeHierarchy");

		CodeHierarchyRsrc result = null;

		try {

			Map<String, String> queryParams = new HashMap<String, String>();
			putQueryParam(queryParams, "effectiveAsOfDate", toQueryParam(effectiveAsOfDate));

			GenericRestDAO<CodeHierarchyRsrc> dao = this.getRestDAOFactory()
					.getGenericRestDAO(CodeHierarchyRsrc.class);
			Response<CodeHierarchyRsrc> response = dao.Process(
					ResourceTypes.SELF, this.getTransformer(), codeHierarchy, queryParams, getWebClient());

			result = response.getResource();

		} catch (RestDAOException e) {
			logger.error(e.getMessage(), e);
			throw new WildfireResourceServiceException(e);
		}

		logger.debug(">getCodeHierarchy");
		return result;
	}

	@Override
	public CodeHierarchyRsrc updateCodeHierarchy(CodeHierarchyRsrc codeHierarchy)
			throws WildfireResourceServiceException, ValidationException {

		GenericRestDAO<CodeHierarchyRsrc> dao = this.getRestDAOFactory().getGenericRestDAO(CodeHierarchyRsrc.class);
		
		try {
			Response<CodeHierarchyRsrc> response = dao.Process(ResourceTypes.UPDATE_CODE_HIERARCHY, this.getTransformer(), codeHierarchy, getWebClient());
			return response.getResource();
			
		} catch(BadRequestException e) {
			throw new ValidationException(e.getMessages());
		} catch (RestDAOException rde) {
			logger.error(rde.getMessage(), rde);
			throw new WildfireResourceServiceException(rde);
		}
	}
	
	public EndpointsRsrc getTopLevelEndpoints() throws WildfireResourceServiceException {
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
			throw new WildfireResourceServiceException(e);
			
		} catch (Throwable t) {
			t.printStackTrace();
			throw new WildfireResourceServiceException(t);
		}

		return result;
	}

	@Override
	public <T> T getPreviousPage(T pagedResource, Class<T> clazz) throws WildfireResourceServiceException {
		logger.debug("<getPreviousPage");

		T result = null;

		try {

			GenericRestDAO<T> dao = this.getRestDAOFactory().getGenericRestDAO(clazz);
			Response<T> response = dao.Process(
					ResourceTypes.PREV, this.getTransformer(), (BaseResource)pagedResource, getWebClient());

			result = response.getResource();

		} catch (RestDAOException e) {
			logger.error(e.getMessage(), e);
			throw new WildfireResourceServiceException(e);
		}

		logger.debug(">getPreviousPage");
		return result;
	}

	@Override
	public <T> T getNextPage(T pagedResource, Class<T> clazz) throws WildfireResourceServiceException {
		logger.debug("<getNextPage");

		T result = null;

		try {

			GenericRestDAO<T> dao = this.getRestDAOFactory().getGenericRestDAO(clazz);
			Response<T> response = dao.Process(
					ResourceTypes.NEXT, this.getTransformer(), (BaseResource)pagedResource, getWebClient());

			result = response.getResource();

		} catch (RestDAOException e) {
			logger.error(e.getMessage(), e);
			throw new WildfireResourceServiceException(e);
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

	@Override
	protected String getClientVersion() {
		return null;
	}
}
