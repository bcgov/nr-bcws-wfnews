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
            AttachmentListResource results = incidentsService.getIncidentAttachmentList(
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
      // If the resource has a GUID, check if it exists. If so, this should have been a PUT/update
			if (attachment.getAttachmentGuid() != null) {
				try {
					AttachmentResource existing = incidentsService.getIncidentAttachment(attachment.getAttachmentGuid(), getFactoryContext());
					if (existing != null) {
						// Update
						AttachmentResource savedResource = incidentsService.updateIncidentAttachment(attachment, getWebAdeAuthentication(), getFactoryContext());
						URI createdUri = URI.create(savedResource.getSelfLink());
						return Response.created(createdUri).entity(savedResource).tag(savedResource.getUnquotedETag()).build();
					}
					// no need to handle the else. If the existing attachment is null, fall out of this
					// try and move on to the create
				} catch(Exception e) {
					// we can ignore the error case and continue
					// In this situation, getting a NotFound just means the feature doesn't exist so
					// we dont need to handle it as an update, and can just carry on with the create
					// Other exceptions may occur, like DAO issues. If so, the create will also
					// fail, and we can handle the error at that point
				}
			}

			// there is no existing attachment, so this is definitely a post. Carry on.
      attachment.setSourceObjectUniqueId(incidentNumberSequence);
			AttachmentResource result = incidentsService.createIncidentAttachment(
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
