package ca.bc.gov.nrs.wfone.api.rest.v1.endpoints.impl;

import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import ca.bc.gov.nrs.common.wfone.rest.resource.MessageListRsrc;
import ca.bc.gov.nrs.wfone.api.rest.v1.endpoints.NotificationSettingsEndpoint;
import ca.bc.gov.nrs.wfone.api.rest.v1.resource.NotificationSettingsRsrc;
import ca.bc.gov.nrs.wfone.api.rest.v1.utils.SqlUtil;
import ca.bc.gov.nrs.wfone.common.rest.endpoints.BaseEndpointsImpl;
import ca.bc.gov.nrs.wfone.common.service.api.ConflictException;
import ca.bc.gov.nrs.wfone.common.service.api.ForbiddenException;
import ca.bc.gov.nrs.wfone.common.service.api.NotFoundException;
import ca.bc.gov.nrs.wfone.common.service.api.ValidationFailureException;
import ca.bc.gov.nrs.wfone.service.api.v1.NotificationService;
import ca.bc.gov.nrs.wfone.api.rest.client.v1.exception.ValidationException;

public class NotificationSettingsEndpointImpl  extends BaseEndpointsImpl implements NotificationSettingsEndpoint{
	
	private static final Logger logger = LoggerFactory.getLogger(NotificationSettingsEndpointImpl.class);
	
	@Autowired
	private NotificationService notificationService;

	@Override
	public Response getNotificationSettings(String subscriberGuid) {
		
		logger.debug("<getNotificationSettings");

		Response response = null;
		
		logRequest();
		
		try {

			NotificationSettingsRsrc result = (NotificationSettingsRsrc) notificationService.getNotificationSettings(subscriberGuid, getFactoryContext());

			response = Response.ok(result).tag(result.getUnquotedETag()).build();

		} catch (NotFoundException e) {
			response = Response.status(Status.NOT_FOUND).build();

		} catch (Throwable t) {
			response = getInternalServerErrorResponse(t);
		}
		
		logResponse(response); 
		
		logger.debug("<getNotificationSettings");
		
		return response;
	}
	
	@Override
	public Response updateNotificationSettings(String subscriberGuid, NotificationSettingsRsrc notificationSettings) {

		logger.debug("<updateNotificationSettings");

		Response response = null;

		String[] sqlKeywords = SqlUtil.sqlKeywords;
		
		logRequest();
		
				
		try {

			String settingsAsString = notificationSettings.toString();

			for (String keyword : sqlKeywords) {
				if (settingsAsString.contains(keyword)) {
					throw new ValidationException("Potential use of eval statement detected");
				}
			}
			
			String optimisticLock = getIfMatchHeader(); 

			NotificationSettingsRsrc result = (NotificationSettingsRsrc) this.notificationService.updateNotificationSettings(subscriberGuid, optimisticLock, notificationSettings, getFactoryContext());

			response = Response.ok(result).tag(result.getUnquotedETag()).build();
			
		} catch (ForbiddenException e) {
			
			response = Response.status(Status.FORBIDDEN).build();
		} catch(ValidationFailureException e) {

			response = Response.status(Status.BAD_REQUEST).entity(new MessageListRsrc(e.getValidationErrors())).build();
		} catch (ConflictException e) {

			response = Response.status(Status.CONFLICT).entity(e.getMessage()).build();
		} catch (NotFoundException e) {

			response = Response.status(Status.NOT_FOUND).build();
		} catch (Throwable t) {

			response = getInternalServerErrorResponse(t);
		}
		response.getHeaders().add("Access-Control-Allow-Origin", "*");
		response.getHeaders().add("Access-Control-Allow-Methods", "GET, OPTIONS, HEAD, PUT, POST");
		response.getHeaders().add("Access-Control-Allow-Headers","apikey");
		
		logResponse(response);

		logger.debug(">updateNotificationSettings " + response.getStatus());
		return response;
	}

}
