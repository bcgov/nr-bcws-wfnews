package ca.bc.gov.nrs.wfone.api.rest.v1.endpoints;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import ca.bc.gov.nrs.common.wfone.rest.resource.HeaderConstants;
import ca.bc.gov.nrs.common.wfone.rest.resource.MessageListRsrc;
import ca.bc.gov.nrs.wfone.api.rest.v1.resource.NotificationSettingsRsrc;
import ca.bc.gov.nrs.wfone.common.rest.endpoints.BaseEndpoints;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.extensions.Extension;
import io.swagger.v3.oas.annotations.extensions.ExtensionProperty;
import io.swagger.v3.oas.annotations.headers.Header;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

@Path("/notificationSettings/{subscriberGuid}")
public interface NotificationSettingsEndpoint extends BaseEndpoints {
	
	@Operation(operationId = "Get the notification settings by subscriberGuid.", summary = "Get the notification settings by subscriberGuid.",  extensions = {@Extension(properties = {@ExtensionProperty(name = "auth-type", value = "#{wso2.x-auth-type.app_and_app_user}"), @ExtensionProperty(name = "throttling-tier", value = "Unlimited") })})
	@Parameters({
		@Parameter(name = HeaderConstants.REQUEST_ID_HEADER, description = HeaderConstants.REQUEST_ID_HEADER_DESCRIPTION, required = false, schema = @Schema(implementation = String.class), in = ParameterIn.HEADER),
		@Parameter(name = HeaderConstants.VERSION_HEADER, description = HeaderConstants.VERSION_HEADER_DESCRIPTION, required = false, schema = @Schema(implementation = Integer.class), in = ParameterIn.HEADER),
		@Parameter(name = HeaderConstants.CACHE_CONTROL_HEADER, description = HeaderConstants.CACHE_CONTROL_DESCRIPTION, required = false, schema = @Schema(implementation = String.class), in = ParameterIn.HEADER),
		@Parameter(name = HeaderConstants.PRAGMA_HEADER, description = HeaderConstants.PRAGMA_HEADER_DESCRIPTION, required = false, schema = @Schema(implementation = String.class), in = ParameterIn.HEADER),
		@Parameter(name = HeaderConstants.AUTHORIZATION_HEADER, description = HeaderConstants.AUTHORIZATION_HEADER_DESCRIPTION, required = false, schema = @Schema(implementation = String.class), in = ParameterIn.HEADER) 
	})
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "OK", content = @Content(schema = @Schema(implementation = NotificationSettingsRsrc.class)), headers = @Header(name = HeaderConstants.ETAG_HEADER, schema = @Schema(implementation = String.class), description = HeaderConstants.ETAG_DESCRIPTION)),
			@ApiResponse(responseCode = "404", description = "Not Found"),
			@ApiResponse(responseCode = "500", description = "Internal Server Error", content = @Content(schema = @Schema(implementation = MessageListRsrc.class))) })
	@GET
	@Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
	Response getNotificationSettings( 	
			@Parameter(description = "subscriber GUID.") @PathParam("subscriberGuid") String subscriberGuid);
	
	
	@Operation(operationId = "Update or create notification settings  resource for  subscriber GUID", summary = "Update or create notification settings  resource by subscriber GUID",  extensions = {@Extension(properties = {@ExtensionProperty(name = "auth-type", value = "#{wso2.x-auth-type.app_and_app_user}"), @ExtensionProperty(name = "throttling-tier", value = "Unlimited") })})
	@Parameters({
		@Parameter(name = HeaderConstants.REQUEST_ID_HEADER, description = HeaderConstants.REQUEST_ID_HEADER_DESCRIPTION, required = false, schema = @Schema(implementation = String.class), in = ParameterIn.HEADER),
		@Parameter(name = HeaderConstants.VERSION_HEADER, description = HeaderConstants.VERSION_HEADER_DESCRIPTION, required = false, schema = @Schema(implementation = Integer.class), in = ParameterIn.HEADER),
		@Parameter(name = HeaderConstants.CACHE_CONTROL_HEADER, description = HeaderConstants.CACHE_CONTROL_DESCRIPTION, required = false, schema = @Schema(implementation = String.class), in = ParameterIn.HEADER),
		@Parameter(name = HeaderConstants.PRAGMA_HEADER, description = HeaderConstants.PRAGMA_HEADER_DESCRIPTION, required = false, schema = @Schema(implementation = String.class), in = ParameterIn.HEADER),
		@Parameter(name = HeaderConstants.AUTHORIZATION_HEADER, description = HeaderConstants.AUTHORIZATION_HEADER_DESCRIPTION, required = false, schema = @Schema(implementation = String.class), in = ParameterIn.HEADER),
		@Parameter(name = HeaderConstants.IF_MATCH_HEADER, description = HeaderConstants.IF_MATCH_DESCRIPTION, required = true, schema = @Schema(implementation = String.class), in = ParameterIn.HEADER) 
	})
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "OK", content = @Content(schema = @Schema(implementation = NotificationSettingsRsrc.class)), headers = @Header(name = HeaderConstants.ETAG_HEADER, schema = @Schema(implementation = String.class), description = HeaderConstants.ETAG_DESCRIPTION)),
			@ApiResponse(responseCode = "400", description = "Bad Request", content = @Content(schema = @Schema(implementation = MessageListRsrc.class))),
			@ApiResponse(responseCode = "403", description = "Forbidden"),
			@ApiResponse(responseCode = "404", description = "Not Found"),
			@ApiResponse(responseCode = "409", description = "Conflict"),
			@ApiResponse(responseCode = "412", description = "Precondition Failed"),
			@ApiResponse(responseCode = "500", description = "Internal Server Error", content = @Content(schema = @Schema(implementation = MessageListRsrc.class))) })
	@PUT
	@Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
	@Consumes({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
	public Response updateNotificationSettings(
			@Parameter(description = "subscriberGuid.") @PathParam("subscriberGuid") String subscriberGuid,
			@Parameter(name = "notificationSettings", description = "Notification Settings resource containing the new values.", required = true) NotificationSettingsRsrc notificationSettings );
}
