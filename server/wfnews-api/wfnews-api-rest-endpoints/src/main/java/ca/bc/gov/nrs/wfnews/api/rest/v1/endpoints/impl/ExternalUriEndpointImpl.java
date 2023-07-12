package ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.impl;

import java.net.URI;
import java.util.Date;

import javax.ws.rs.core.EntityTag;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.ResponseBuilder;
import javax.ws.rs.core.Response.Status;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import ca.bc.gov.nrs.common.persistence.dao.DaoException;
import ca.bc.gov.nrs.wfone.common.rest.endpoints.BaseEndpointsImpl;
import ca.bc.gov.nrs.common.rest.resource.Messages;
import ca.bc.gov.nrs.common.service.ConflictException;
import ca.bc.gov.nrs.common.service.ForbiddenException;
import ca.bc.gov.nrs.common.service.NotFoundException;
import ca.bc.gov.nrs.common.service.ValidationFailureException;
import ca.bc.gov.nrs.wfnews.service.api.v1.IncidentsService;
import ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.ExternalUriEndpoint;
import ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.security.Scopes;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.ExternalUriResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.PublishedIncidentResource;

public class ExternalUriEndpointImpl extends BaseEndpointsImpl implements ExternalUriEndpoint {
	
	private static final Logger logger = LoggerFactory.getLogger(ExternalUriEndpointImpl.class);
	
	@Autowired
	private IncidentsService incidentsService;
	
	@Override
	public Response createExternalUri(ExternalUriResource resource)
			throws NotFoundException, ForbiddenException, ConflictException {
		Response response = null;
		
		logRequest();
		
		if(!hasAuthority(Scopes.CREATE_EXTERNAL_URI)) {
			return Response.status(Status.FORBIDDEN).build();
		}
		
		try {
			ExternalUriResource result = incidentsService.createExternalUri(resource, getFactoryContext());
			
			URI createdUri = URI.create(result.getSelfLink());
			
			response = Response.created(createdUri).entity(result).tag(result.getUnquotedETag()).build();
			
			// Now we should also update the Incident
			// This will ensure we fetch this on update checks
			PublishedIncidentResource incident = incidentsService.getPublishedIncident(result.getSourceObjectUniqueId(), null, getWebAdeAuthentication(), getFactoryContext());
			incident.setUpdateDate(new Date());
			incident.setLastUpdatedTimestamp(new Date());
			incidentsService.updatePublishedWildfireIncident(incident, getFactoryContext());
		} catch(ValidationFailureException e) {
			response = Response.status(Status.BAD_REQUEST).entity(new Messages(e.getValidationErrors())).build();
		} catch (Throwable t) {
			response = getInternalServerErrorResponse(t);
		}
		
		logResponse(response);

		return response;
	}


	@Override
	public Response updateExternalUri(ExternalUriResource resource, String externalResourceGuid)
			throws NotFoundException, ForbiddenException, ConflictException {
		Response response = null;
		
		logRequest();
		
		if(!hasAuthority(Scopes.UPDATE_EXTERNAL_URI)) {
			return Response.status(Status.FORBIDDEN).build();
		}
		
		try {
			ExternalUriResource result = incidentsService.updateExternalUri(resource, getFactoryContext());
			
			URI createdUri = URI.create(result.getSelfLink());
			
			response = Response.created(createdUri).entity(result).tag(result.getUnquotedETag()).build();
			
			// Now we should also update the Incident
			// This will ensure we fetch this on update checks
			PublishedIncidentResource incident = incidentsService.getPublishedIncident(result.getSourceObjectUniqueId(), null, getWebAdeAuthentication(), getFactoryContext());
			incident.setUpdateDate(new Date());
			incident.setLastUpdatedTimestamp(new Date());
			incidentsService.updatePublishedWildfireIncident(incident, getFactoryContext());
		} catch(ValidationFailureException e) {
			response = Response.status(Status.BAD_REQUEST).entity(new Messages(e.getValidationErrors())).build();
		} catch (Throwable t) {
			response = getInternalServerErrorResponse(t);
		}
		
		logResponse(response);

		return response;
	}

	@Override
	public Response deleteExternalUri(String externalUriGuid) throws NotFoundException, ConflictException, DaoException {
		Response response = null;
		
		logRequest();
		
		if(!hasAuthority(Scopes.DELETE_EXTERNAL_URI)) {
			return Response.status(Status.FORBIDDEN).build();
		}
		
		try{
			ExternalUriResource current = incidentsService.getExternalUri(externalUriGuid, getWebAdeAuthentication(), getFactoryContext());
			EntityTag currentTag = EntityTag.valueOf(current.getQuotedETag());
			
			ResponseBuilder responseBuilder = this.evaluatePreconditions(currentTag);

			if (responseBuilder == null) {
				// Preconditions Are Met

				incidentsService.deleteExternalUri(externalUriGuid, getFactoryContext());

				response = Response.status(204).build();
			} else {
				// Preconditions Are NOT Met
				response = responseBuilder.tag(currentTag).build();
			}
		} catch (ConflictException e) {
			response = Response.status(Status.CONFLICT).entity(e.getMessage()).build();
		} catch (NotFoundException e) {
			response = Response.status(Status.NOT_FOUND).build();
		} catch (Throwable t) {
			response = getInternalServerErrorResponse(t);
		}
		
		logResponse(response);

		logger.debug(">deletePublishedIncident " + response.getStatus());
		
		return response;
	}
	
	
}