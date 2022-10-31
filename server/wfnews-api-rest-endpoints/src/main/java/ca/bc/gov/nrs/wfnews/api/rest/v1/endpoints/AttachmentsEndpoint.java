package ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import ca.bc.gov.nrs.common.rest.resource.HeaderConstants;
import ca.bc.gov.nrs.common.wfone.rest.resource.MessageListRsrc;
import ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.security.Scopes;
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

@Path("/incidents/{incidentNumberSequence}/attachments/{attachmentGuid}")
@Api(value = "IncidentAttachment")
public interface AttachmentsEndpoint {
  @ApiOperation(
		value = "Get Incident Attachment by ID.", 
		notes = "Get the Incident Attachment by ID.")
	@ApiImplicitParams({
		@ApiImplicitParam(name = HeaderConstants.VERSION_HEADER, value = HeaderConstants.VERSION_HEADER_DESCRIPTION, required = false, dataType = "integer", paramType = "header")
	})
	@ApiResponses(value = {
		@ApiResponse(code = 200, message = "OK", response = AttachmentResource.class, responseHeaders = @ResponseHeader(name = HeaderConstants.ETAG_HEADER, response = String.class, description = HeaderConstants.ETAG_DESCRIPTION)),
		@ApiResponse(code = 404, message = "Not Found"),
		@ApiResponse(code = 500, message = "Internal Server Error", response = MessageListRsrc.class)
	})
	@GET
	@Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
	Response getIncidentAttachment(
			@ApiParam("The incidentNumberSequence of the Wildfire Incident resource.") @PathParam("incidentNumberSequence") String incidentNumberSequence,
			@ApiParam("The attachmentGuid of the Attachment resource.") @PathParam("attachmentGuid") String attachmentGuid
	);

	@ApiOperation(
		value = "Get Incident Attachment bytes by ID.", 
		notes = "Get the Incident Attachment by ID.")
	@ApiImplicitParams({
		@ApiImplicitParam(name = HeaderConstants.VERSION_HEADER, value = HeaderConstants.VERSION_HEADER_DESCRIPTION, required = false, dataType = "integer", paramType = "header")
	})
	@ApiResponses(value = {
		@ApiResponse(code = 200, message = "OK", response = AttachmentResource.class, responseHeaders = @ResponseHeader(name = HeaderConstants.ETAG_HEADER, response = String.class, description = HeaderConstants.ETAG_DESCRIPTION)),
		@ApiResponse(code = 404, message = "Not Found"),
		@ApiResponse(code = 500, message = "Internal Server Error", response = MessageListRsrc.class)
	})
	@GET
	@Path("/bytes")
	@Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
	Response getIncidentAttachmentBytes(
			@ApiParam("The incidentNumberSequence of the Wildfire Incident resource.") @PathParam("incidentNumberSequence") String incidentNumberSequence,
			@ApiParam("The attachmentGuid of the Attachment resource.") @PathParam("attachmentGuid") String attachmentGuid
	);

	@ApiOperation(
		value = "Update Incident Attachment by ID", 
		notes = "Update Incident Attachment by ID", 
		authorizations = {
			@Authorization(value = "Webade-OAUTH2", scopes = { @AuthorizationScope(scope = Scopes.GET_TOPLEVEL, description = "") }),
			@Authorization(value = "Webade-OAUTH2", scopes = { @AuthorizationScope(scope = Scopes.UPDATE_ATTACHMENT, description = "") })}, 
		extensions = {
			@Extension(properties = {@ExtensionProperty(name = "auth-type", value = "#{wso2.x-auth-type.app_and_app_user}"), @ExtensionProperty(name = "throttling-tier", value = "Unlimited") })})
	@ApiImplicitParams({
		@ApiImplicitParam(name = HeaderConstants.VERSION_HEADER, value = HeaderConstants.VERSION_HEADER_DESCRIPTION, required = false, dataType = "integer", paramType = "header")
	})
	@ApiResponses(value = {
		@ApiResponse(code = 200, message = "OK", response = AttachmentResource.class, responseHeaders = @ResponseHeader(name = HeaderConstants.ETAG_HEADER, response = String.class, description = HeaderConstants.ETAG_DESCRIPTION)),
		@ApiResponse(code = 400, message = "Bad Request", response = MessageListRsrc.class),
		@ApiResponse(code = 403, message = "Forbidden"),
		@ApiResponse(code = 404, message = "Not Found"),
		@ApiResponse(code = 409, message = "Conflict"),
		@ApiResponse(code = 412, message = "Precondition Failed"),
		@ApiResponse(code = 500, message = "Internal Server Error", response = MessageListRsrc.class)
	})
	@PUT
	@Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
	@Consumes({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
	public Response updateIncidentAttachment(
			@ApiParam("The incidentNumberSequence of the Wildfire Incident resource.") @PathParam("incidentNumberSequence") String incidentNumberSequence,
			@ApiParam("The attachmentGuid of the Attachment resource.") @PathParam("attachmentGuid") String attachmentGuid,
			@ApiParam(name = "attachment", value = "The Incident Attachment resource containing the new values.", required = true) AttachmentResource attachment);

	@ApiOperation(
		value = "Delete Incident Attachment by ID", 
		notes = "Delete Incident Attachment by ID", 
		authorizations = { 
			@Authorization(value = "Webade-OAUTH2", scopes = { @AuthorizationScope(scope = Scopes.GET_TOPLEVEL, description = "") }),
			@Authorization(value = "Webade-OAUTH2", scopes = { @AuthorizationScope(scope = Scopes.DELETE_ATTACHMENT, description = "") })}, 
		extensions = {
			@Extension(properties = {@ExtensionProperty(name = "auth-type", value = "#{wso2.x-auth-type.app_and_app_user}"), @ExtensionProperty(name = "throttling-tier", value = "Unlimited") })})
	@ApiImplicitParams({
		@ApiImplicitParam(name = HeaderConstants.VERSION_HEADER, value = HeaderConstants.VERSION_HEADER_DESCRIPTION, required = false, dataType = "integer", paramType = "header"),
		@ApiImplicitParam(name = HeaderConstants.IF_MATCH_HEADER, value = HeaderConstants.IF_MATCH_DESCRIPTION, required = false, dataType = "string", paramType = "header")
	})
	@ApiResponses(value = { @ApiResponse(code = 204, message = "No Content"),
		@ApiResponse(code = 403, message = "Forbidden"),
		@ApiResponse(code = 404, message = "Not Found"),
		@ApiResponse(code = 409, message = "Conflict"),
		@ApiResponse(code = 412, message = "Precondition Failed"),
		@ApiResponse(code = 500, message = "Internal Server Error", response = MessageListRsrc.class)
	})
	@DELETE
	public Response deleteIncidentAttachment(
			@ApiParam("The incidentNumberSequence of the Wildfire Incident resource.") @PathParam("incidentNumberSequence") String incidentNumberSequence,
			@ApiParam("The attachmentGuid of the Attachment resource.") @PathParam("attachmentGuid") String attachmentGuid
	);
}
