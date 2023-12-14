package ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.impl;

import java.net.URI;

import javax.ws.rs.core.EntityTag;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.ResponseBuilder;
import javax.ws.rs.core.Response.Status;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import ca.bc.gov.nrs.common.persistence.dao.DaoException;
import ca.bc.gov.nrs.common.rest.resource.Messages;
import ca.bc.gov.nrs.common.service.ConflictException;
import ca.bc.gov.nrs.common.service.ForbiddenException;
import ca.bc.gov.nrs.common.service.NotFoundException;
import ca.bc.gov.nrs.common.service.ValidationFailureException;
import ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.SituationReportEndpoint;
import ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.security.Scopes;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.SituationReportResource;
import ca.bc.gov.nrs.wfnews.service.api.v1.IncidentsService;
import ca.bc.gov.nrs.wfone.common.rest.endpoints.BaseEndpointsImpl;

public class SituationReportEndpointImpl extends BaseEndpointsImpl implements SituationReportEndpoint {
  private static final Logger logger = LoggerFactory.getLogger(SituationReportEndpointImpl.class);
	
	@Autowired
	private IncidentsService incidentsService;

  @Override
  public Response createSituationReport(SituationReportResource resource) throws NotFoundException, ForbiddenException, ConflictException {
    Response response = null;
		
		logRequest();
		
		if(!hasAuthority(Scopes.CREATE_PUBLISHED_INCIDENT)) {
			return Response.status(Status.FORBIDDEN).build();
		}
		
		try {
			SituationReportResource result = incidentsService.createSituationReport(resource, getWebAdeAuthentication(), getFactoryContext());
			
			URI createdUri = URI.create(result.getSelfLink());
			
			response = Response.created(createdUri).entity(result).tag(result.getUnquotedETag()).build();
		} catch(ValidationFailureException e) {
			response = Response.status(Status.BAD_REQUEST).entity(new Messages(e.getValidationErrors())).build();
		} catch (Throwable t) {
			response = getInternalServerErrorResponse(t);
		}
		
		logResponse(response);

		return response;
  }

  @Override
  public Response updateSituationReport(SituationReportResource resource, String reportGuid) throws NotFoundException, ForbiddenException, ConflictException {
    Response response = null;
		
		logRequest();
		
		if(!hasAuthority(Scopes.UPDATE_PUBLISHED_INCIDENT)) {
			return Response.status(Status.FORBIDDEN).build();
		}
		
		try {
			SituationReportResource result = incidentsService.updateSituationReport(resource, getWebAdeAuthentication(), getFactoryContext());
			
			URI createdUri = URI.create(result.getSelfLink());
			
			response = Response.created(createdUri).entity(result).tag(result.getUnquotedETag()).build();
		} catch(ValidationFailureException e) {
			response = Response.status(Status.BAD_REQUEST).entity(new Messages(e.getValidationErrors())).build();
		} catch (Throwable t) {
			response = getInternalServerErrorResponse(t);
		}
		
		logResponse(response);

		return response;
  }

  @Override
  public Response deleteSituationReport(String reportGuid) throws NotFoundException, ConflictException, DaoException {
    Response response = null;
		
		logRequest();
		
		if(!hasAuthority(Scopes.DELETE_PUBLISHED_INCIDENT)) {
			return Response.status(Status.FORBIDDEN).build();
		}
		
		try{
			SituationReportResource current = incidentsService.getSituationReport(reportGuid, getFactoryContext());
			EntityTag currentTag = EntityTag.valueOf(current.getQuotedETag());
			
			ResponseBuilder responseBuilder = this.evaluatePreconditions(currentTag);

			if (responseBuilder == null) {
				// Preconditions Are Met

				incidentsService.deleteSituationReport(reportGuid, getWebAdeAuthentication(), getFactoryContext());

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

		logger.debug(">deleteSituationReport " + response.getStatus());
		
		return response;
  }
}
