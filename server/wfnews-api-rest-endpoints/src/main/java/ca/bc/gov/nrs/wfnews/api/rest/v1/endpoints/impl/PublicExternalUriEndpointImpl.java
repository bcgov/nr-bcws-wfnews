package ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.impl;

import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.core.GenericEntity;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import ca.bc.gov.nrs.common.service.ConflictException;
import ca.bc.gov.nrs.common.service.ForbiddenException;
import ca.bc.gov.nrs.common.service.NotFoundException;
import ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.PublicExternalUriEndpoint;
import ca.bc.gov.nrs.wfnews.api.rest.v1.parameters.PagingQueryParameters;
import ca.bc.gov.nrs.wfnews.api.rest.v1.parameters.validation.ParameterValidator;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.ExternalUriListResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.ExternalUriResource;
import ca.bc.gov.nrs.wfnews.service.api.v1.IncidentsService;
import ca.bc.gov.nrs.wfone.common.model.Message;
import ca.bc.gov.nrs.wfone.common.rest.endpoints.BaseEndpointsImpl;

public class PublicExternalUriEndpointImpl extends BaseEndpointsImpl implements PublicExternalUriEndpoint {
	
	private static final Logger logger = LoggerFactory.getLogger(PublicExternalUriEndpointImpl.class);
	
	@Autowired
	private IncidentsService incidentsService;
	
	@Autowired
	private ParameterValidator parameterValidator;
	

	@Override
	public Response getExternalUriList(String sourceObjectUniqueId, String pageNumber, String pageRowCount) throws NotFoundException, ForbiddenException, ConflictException {
		Response response = null;
	
	try {
		Integer pageNum = null;
		Integer rowCount = null;
		
		if (pageNumber!=null)pageNum = Integer.parseInt(pageNumber);
		if (pageRowCount!=null)rowCount = Integer.parseInt(pageRowCount);
		
		PagingQueryParameters parameters = new PagingQueryParameters();
		
		parameters.setPageNumber(pageNumber);
		parameters.setPageRowCount(pageRowCount);
		
		List<Message> validation = new ArrayList<>();
		validation.addAll(this.parameterValidator.validatePagingQueryParameters(parameters));
		
		if (!validation.isEmpty()) {
			response = Response.status(Status.BAD_REQUEST).entity(validation).build();
		}else {
			ExternalUriListResource results = incidentsService.getExternalUriList(sourceObjectUniqueId, pageNum, rowCount, getFactoryContext());
			GenericEntity<ExternalUriListResource> entity = new GenericEntity<ExternalUriListResource>(results) {
				/* do nothing */
			};

			response = Response.ok(entity).tag(results.getUnquotedETag()).build();
		}
		
	} catch (Throwable t) {
		response = getInternalServerErrorResponse(t);
	}
	
	logResponse(response);

	return response;
	}
	
	@Override
	public Response getSingleExternalUri(String externalUriGuid) throws NotFoundException, ForbiddenException, ConflictException {
		Response response = null;
	
	try {
		
			ExternalUriResource result = incidentsService.getExternalUri(externalUriGuid, getWebAdeAuthentication(), getFactoryContext());
			GenericEntity<ExternalUriResource> entity = new GenericEntity<ExternalUriResource>(result) {
				/* do nothing */
			};

			response = Response.ok(entity).tag(result.getUnquotedETag()).build();
		
	} catch (NotFoundException e) {
		response = Response.status(Status.NOT_FOUND).build();
	} catch (Throwable t) {
		response = getInternalServerErrorResponse(t);
	}
	logResponse(response);

	return response;
	}

}