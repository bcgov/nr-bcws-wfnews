package ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import ca.bc.gov.nrs.common.persistence.dao.DaoException;
import ca.bc.gov.nrs.common.rest.endpoints.BaseEndpoints;
import ca.bc.gov.nrs.common.rest.resource.HeaderConstants;
import ca.bc.gov.nrs.common.rest.resource.Messages;
import ca.bc.gov.nrs.common.service.ConflictException;
import ca.bc.gov.nrs.common.service.ForbiddenException;
import ca.bc.gov.nrs.common.service.NotFoundException;
import ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.security.Scopes;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.PublishedIncidentResource;
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

@Path("/publishedIncident")
@Api(value = "PublishedIncidentEndpoint", authorizations = { @Authorization(value = "Webade-OAUTH2", scopes = {
		@AuthorizationScope(scope = Scopes.GET_TOPLEVEL, description = "") }) })
public interface PublishedIncidentEndpoint extends BaseEndpoints {
	@ApiOperation(value = "Add a Published Incident Resource to the List of Published Incident resources", response = PublishedIncidentResource.class, notes = "Add a Published Incident Resource to the List of Published Incident resources", authorizations = {
			@Authorization(value = "Webade-OAUTH2", scopes = {
					@AuthorizationScope(scope = Scopes.CREATE_PUBLISHED_INCIDENT, description = "") }) }, extensions = {
							@Extension(properties = {
									@ExtensionProperty(name = "auth-type", value = "#{wso2.x-auth-type.app_and_app_user}"),
									@ExtensionProperty(name = "throttling-tier", value = "Unlimited") }) })
	@ApiImplicitParams({
			@ApiImplicitParam(name = HeaderConstants.VERSION_HEADER, value = HeaderConstants.VERSION_HEADER_DESCRIPTION, required = false, dataType = "integer", paramType = "header")
	})
	@ApiResponses(value = {
			@ApiResponse(code = 201, message = "Created", response = PublishedIncidentResource.class, responseHeaders = {
					@ResponseHeader(name = "ETag", response = String.class, description = "The ETag response-header field provides the current value of the entity tag for the requested variant."),
					@ResponseHeader(name = "Location", response = String.class, description = "The Location response-header field is used to redirect the recipient to a location other than the Request-URI for completion of the request or identification of a new resource.") }),
			@ApiResponse(code = 400, message = "Bad Request", response = Messages.class),
			@ApiResponse(code = 403, message = "Forbidden"),
			@ApiResponse(code = 500, message = "Internal Server Error", response = Messages.class) })
	@POST
	@Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
	@Consumes({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
	public Response createPublishedIncident(
			@ApiParam(name = "publishedIncident", value = "The PublishedIncident resource containing the new values.", required = true) PublishedIncidentResource publishedIncident)
			throws NotFoundException, ForbiddenException, ConflictException;

	@ApiOperation(value = "Update a Published Incident Resource to the List of Published Incident resources", response = PublishedIncidentResource.class, notes = "Update a Published Incident Resource to the List of Published Incident resources", authorizations = {
			@Authorization(value = "Webade-OAUTH2", scopes = {
					@AuthorizationScope(scope = Scopes.UPDATE_PUBLISHED_INCIDENT, description = "") }) }, extensions = {
							@Extension(properties = {
									@ExtensionProperty(name = "auth-type", value = "#{wso2.x-auth-type.app_and_app_user}"),
									@ExtensionProperty(name = "throttling-tier", value = "Unlimited") }) })
	@ApiImplicitParams({
			@ApiImplicitParam(name = HeaderConstants.VERSION_HEADER, value = HeaderConstants.VERSION_HEADER_DESCRIPTION, required = false, dataType = "integer", paramType = "header")
	})
	@ApiResponses(value = {
			@ApiResponse(code = 201, message = "Created", response = PublishedIncidentResource.class, responseHeaders = {
					@ResponseHeader(name = "ETag", response = String.class, description = "The ETag response-header field provides the current value of the entity tag for the requested variant."),
					@ResponseHeader(name = "Location", response = String.class, description = "The Location response-header field is used to redirect the recipient to a location other than the Request-URI for completion of the request or identification of a new resource.") }),
			@ApiResponse(code = 400, message = "Bad Request", response = Messages.class),
			@ApiResponse(code = 404, message = "Not Found"),
			@ApiResponse(code = 403, message = "Forbidden"),
			@ApiResponse(code = 500, message = "Internal Server Error", response = Messages.class) })
	@PUT
	@Path("/{publishedIncidentDetailGuid}")
	@Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
	@Consumes({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
	public Response updatePublishedIncident(
			@ApiParam(name = "publishedIncident", value = "The PublishedIncident resource containing the new values.", required = true) PublishedIncidentResource publishedIncident,
			@ApiParam("The publishedIncidentDetailGuid of the Published Incident resource.") @PathParam("publishedIncidentDetailGuid") String publishedIncidentDetailGuid)
			throws NotFoundException, ForbiddenException, ConflictException;

	@ApiOperation(value = "Get the List of Published Incident resources", response = PublishedIncidentResource.class, notes = "Get the List of Published Incident resources", authorizations = {
			@Authorization(value = "Webade-OAUTH2", scopes = {
					@AuthorizationScope(scope = Scopes.DELETE_PUBLISHED_INCIDENT, description = "") }) }, extensions = {
							@Extension(properties = {
									@ExtensionProperty(name = "auth-type", value = "#{wso2.x-auth-type.app_and_app_user}"),
									@ExtensionProperty(name = "throttling-tier", value = "Unlimited") }) })
	@ApiImplicitParams({
			@ApiImplicitParam(name = HeaderConstants.VERSION_HEADER, value = HeaderConstants.VERSION_HEADER_DESCRIPTION, required = false, dataType = "integer", paramType = "header")
	})
	@ApiResponses(value = {
			@ApiResponse(code = 201, message = "Created", response = PublishedIncidentResource.class, responseHeaders = {
					@ResponseHeader(name = "ETag", response = String.class, description = "The ETag response-header field provides the current value of the entity tag for the requested variant."),
					@ResponseHeader(name = "Location", response = String.class, description = "The Location response-header field is used to redirect the recipient to a location other than the Request-URI for completion of the request or identification of a new resource.") }),
			@ApiResponse(code = 400, message = "Bad Request", response = Messages.class),
			@ApiResponse(code = 404, message = "Not Found"),
			@ApiResponse(code = 403, message = "Forbidden"),
			@ApiResponse(code = 500, message = "Internal Server Error", response = Messages.class) })
	@DELETE
	@Path("/{publishedIncidentDetailGuid}")
	public Response deletePublishedIncident(
			@ApiParam("The publishedIncidentDetailGuid of the Published Incident resource.") @PathParam("publishedIncidentDetailGuid") String publishedIncidentDetailGuid)
			throws NotFoundException, ConflictException, DaoException;

	@ApiOperation(value = "Flush Published Incident resources", response = PublishedIncidentResource.class, notes = "Get the List of Published Incident resources", authorizations = {
		@Authorization(value = "Webade-OAUTH2", scopes = {
				@AuthorizationScope(scope = Scopes.DELETE_PUBLISHED_INCIDENT, description = "") }) }, extensions = {
						@Extension(properties = {
								@ExtensionProperty(name = "auth-type", value = "#{wso2.x-auth-type.app_and_app_user}"),
								@ExtensionProperty(name = "throttling-tier", value = "Unlimited") }) })
		@ApiImplicitParams({
				@ApiImplicitParam(name = HeaderConstants.VERSION_HEADER, value = HeaderConstants.VERSION_HEADER_DESCRIPTION, required = false, dataType = "integer", paramType = "header")
		})
		@ApiResponses(value = {
				@ApiResponse(code = 204, message = "Not Found", response = PublishedIncidentResource.class, responseHeaders = {
						@ResponseHeader(name = "ETag", response = String.class, description = "The ETag response-header field provides the current value of the entity tag for the requested variant."),
						@ResponseHeader(name = "Location", response = String.class, description = "The Location response-header field is used to redirect the recipient to a location other than the Request-URI for completion of the request or identification of a new resource.") }),
				@ApiResponse(code = 400, message = "Bad Request", response = Messages.class),
				@ApiResponse(code = 403, message = "Forbidden"),
				@ApiResponse(code = 404, message = "Not Found"),
				@ApiResponse(code = 500, message = "Internal Server Error", response = Messages.class) })
		@DELETE
		@Path("/flush")
		public Response flush() throws NotFoundException, ConflictException, DaoException;
}
