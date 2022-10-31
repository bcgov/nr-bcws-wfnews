package ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.impl;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.core.GenericEntity;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.springframework.beans.factory.annotation.Autowired;

import ca.bc.gov.nrs.common.wfone.rest.resource.MessageListRsrc;
import ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.AttachmentsListEndpoint;
import ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.security.Scopes;
import ca.bc.gov.nrs.wfnews.api.rest.v1.parameters.PagingQueryParameters;
import ca.bc.gov.nrs.wfnews.api.rest.v1.parameters.validation.ParameterValidator;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.AttachmentListResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.AttachmentResource;
import ca.bc.gov.nrs.wfnews.service.api.v1.IncidentsService;
import ca.bc.gov.nrs.wfone.common.model.Message;
import ca.bc.gov.nrs.wfone.common.rest.endpoints.BaseEndpointsImpl;
import ca.bc.gov.nrs.wfone.common.service.api.ValidationFailureException;

public class AttachmentsListEndpointImpl extends BaseEndpointsImpl implements AttachmentsListEndpoint {

  @Autowired
	private ParameterValidator parameterValidator;

  @Autowired
	private IncidentsService incidentsService;

  @Override
  public Response getIncidentAttachmentList(String incidentNumberSequence, String primaryIndicator,
      List<String> sourceObjectNameCode, List<String> attachmentTypeCode, String pageNumber, String pageRowCount,
      String orderBy) {
        Response response = null;
		
        logRequest();
        
        try {
          
          PagingQueryParameters parameters = new PagingQueryParameters();
          parameters.setPageNumber(pageNumber);
          parameters.setPageRowCount(pageRowCount);
          
          List<Message> validation = new ArrayList<>();
          validation.addAll(this.parameterValidator.validatePagingQueryParameters(parameters));
          
          MessageListRsrc validationMessages = new MessageListRsrc(validation);
          if (validationMessages.hasMessages()) {
            response = Response.status(Status.BAD_REQUEST).entity(validationMessages).build();
          } else {
            AttachmentListResource results = (AttachmentListResource) incidentsService.getIncidentAttachmentList(
                incidentNumberSequence,
                toBoolean(primaryIndicator),
                toStringArray(sourceObjectNameCode),
                toStringArray(attachmentTypeCode),
                toInteger(pageNumber), 
                toInteger(pageRowCount), 
                toStringArray(orderBy),
                getFactoryContext() );
    
            GenericEntity<AttachmentListResource> entity = new GenericEntity<AttachmentListResource>(results) {
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
  public Response createIncidentAttachment(String incidentNumberSequence, AttachmentResource attachment) {
    Response response = null;
		
		logRequest();
		
		if(!hasAuthority(Scopes.CREATE_ATTACHMENT)) {
			return Response.status(Status.FORBIDDEN).build();
		}

		try {

			AttachmentResource result = (AttachmentResource) incidentsService.createIncidentAttachment(
					attachment,
					getWebAdeAuthentication(),
					getFactoryContext());

			URI createdUri = URI.create(result.getSelfLink());

			response = Response.created(createdUri).entity(result).tag(result.getUnquotedETag()).build();

		} catch(ValidationFailureException e) {
			response = Response.status(Status.BAD_REQUEST).entity(new MessageListRsrc(e.getValidationErrors())).build();
		} catch (Throwable t) {
			response = getInternalServerErrorResponse(t);
		}
		
		logResponse(response);

		return response;
  }
  
}
