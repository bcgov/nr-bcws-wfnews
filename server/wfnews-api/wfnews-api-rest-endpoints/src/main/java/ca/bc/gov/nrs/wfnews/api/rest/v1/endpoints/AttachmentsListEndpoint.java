package ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints;

import java.util.List;

import javax.ws.rs.Consumes;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.springframework.web.bind.annotation.CrossOrigin;

import ca.bc.gov.nrs.common.rest.resource.HeaderConstants;
import ca.bc.gov.nrs.common.wfone.rest.resource.MessageListRsrc;
import ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.security.Scopes;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.AttachmentListResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.AttachmentResource;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiImplicitParams;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import io.swagger.annotations.Authorization;
import io.swagger.annotations.AuthorizationScope;
import io.swagger.annotations.Extension;
import io.swagger.annotations.ExtensionProperty;
import io.swagger.annotations.ResponseHeader;

@Path("/")
@Api(value = "IncidentAttachments")
public interface AttachmentsListEndpoint {
  @ApiOperation(value = "Get Incident Attachments.", notes= "Get list of Incident Attachments.") 
	@ApiImplicitParams({ @ApiImplicitParam(name = HeaderConstants.VERSION_HEADER, value = HeaderConstants.VERSION_HEADER_DESCRIPTION, required = false, dataType = "integer", paramType = "header") })
	@ApiResponses(value = {
		@ApiResponse(code = 200, message = "OK", response = AttachmentListResource.class, responseHeaders = @ResponseHeader(name = HeaderConstants.ETAG_HEADER, response = String.class, description = HeaderConstants.ETAG_DESCRIPTION)),
		@ApiResponse(code = 404, message = "Not Found"),
		@ApiResponse(code = 500, message = "Internal Server Error", response = MessageListRsrc.class)
	})
	@GET
	@Path("/publicPublishedIncidentAttachment/{incidentNumberSequence}/attachments")
	@Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
	@CrossOrigin(origins = "*", allowedHeaders = "*")
	Response getIncidentAttachmentList(
			@ApiParam("The incidentNumberSequence of the Wildfire Incident resource.") @PathParam("incidentNumberSequence") String incidentNumberSequence,
			@ApiParam("List primary attachments") @QueryParam("primaryIndicator") @DefaultValue("false") String primaryIndicator,
			@ApiParam("The sourceObjectNameCode the results to be returned.") @QueryParam("sourceObjectNameCode") List<String> sourceObjectNameCode,
			@ApiParam("The attachmentTypeCode the results to be returned.") @QueryParam("attachmentTypeCode") List<String> attachmentTypeCode,
			@ApiParam("The page number of the results to be returned.") @QueryParam("pageNumber") String pageNumber,
			@ApiParam("The number of results per page.") @QueryParam("pageRowCount") String pageRowCount,
			@ApiParam("Comma separated list of property names to order the result set by.") @QueryParam("orderBy") String orderBy
	);

	@ApiOperation(
			value = "Add Incident Attachment", 
			notes = "Add a Incident attachment resource to the List of Incident attachment resources", 
			authorizations = { 
				@Authorization(value = "Webade-OAUTH2", scopes = { @AuthorizationScope(scope = Scopes.GET_TOPLEVEL, description = "") }),
				@Authorization(value = "Webade-OAUTH2", scopes = { @AuthorizationScope(scope = Scopes.CREATE_ATTACHMENT, description = "") })},
			extensions = {
				@Extension(properties = {@ExtensionProperty(name = "auth-type", value = "#{wso2.x-auth-type.app_and_app_user}"), @ExtensionProperty(name = "throttling-tier", value = "Unlimited") })})
	@ApiImplicitParams({
		@ApiImplicitParam(name = HeaderConstants.VERSION_HEADER, value = HeaderConstants.VERSION_HEADER_DESCRIPTION, required = false, dataType = "integer", paramType = "header")
	})
	@ApiResponses(value = {
			@ApiResponse(code = 201, message = "Created", response = AttachmentResource.class, responseHeaders = {
					@ResponseHeader(name = HeaderConstants.ETAG_HEADER, response = String.class, description = HeaderConstants.ETAG_DESCRIPTION),
					@ResponseHeader(name = "Location", response = String.class, description = "The ETag response-header field provides the current value of the entity tag for the requested variant.") }),
			@ApiResponse(code = 400, message = "Bad Request", response = MessageListRsrc.class),
			@ApiResponse(code = 403, message = "Forbidden"),
			@ApiResponse(code = 500, message = "Internal Server Error",  response = MessageListRsrc.class) })
	@POST
	@Path("/publishedIncidentAttachment/{incidentNumberSequence}/attachments")
	@Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
	@Consumes({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
	public Response createIncidentAttachment(
			@ApiParam("The incidentNumberSequence of the Wildfire Incident resource.") @PathParam("incidentNumberSequence") String incidentNumberSequence,
			@ApiParam(name = "attachment", value = "The Attachment resource containing the new values.", required = true) AttachmentResource attachment);
}
