package ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints;

import java.io.IOException;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import org.glassfish.jersey.media.multipart.FormDataBodyPart;
import org.glassfish.jersey.media.multipart.FormDataParam;
import org.springframework.web.bind.annotation.CrossOrigin;

import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.AttachmentResource;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@Path("/")
@Tag(name = "IncidentAttachment")
public interface AttachmentsEndpoint {

	@Operation(summary = "Get Incident Attachment by ID.", description = "Get the Incident Attachment by ID.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "OK"),
			@ApiResponse(responseCode = "404", description = "Not Found"),
			@ApiResponse(responseCode = "500", description = "Internal Server Error")
	})
	@GET
	@Path("/publicPublishedIncidentAttachment/{incidentGuid}/attachments/{attachmentGuid}")
	@Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
	@CrossOrigin(origins = "*", allowedHeaders = "*")
	Response getIncidentAttachment(
			@Parameter(description = "The incidentGuid of the Wildfire Incident resource.") @PathParam("incidentGuid") String incidentGuid,
			@Parameter(description = "The attachmentGuid of the Attachment resource.") @PathParam("attachmentGuid") String attachmentGuid);

	@Operation(summary = "Get Incident Attachment bytes by ID.", description = "Get the Incident Attachment bytes by ID.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "OK"),
			@ApiResponse(responseCode = "404", description = "Not Found"),
			@ApiResponse(responseCode = "500", description = "Internal Server Error")
	})
	@GET
	@Path("/publicPublishedIncidentAttachment/{incidentNumberLabel}/attachments/{attachmentGuid}/bytes")
	@CrossOrigin(origins = "*", allowedHeaders = "*")
	Response getIncidentAttachmentBytes(
			@Parameter(description = "The incidentNumberLabel of the Wildfire Incident resource.") @PathParam("incidentNumberLabel") String incidentNumberLabel,
			@Parameter(description = "The attachmentGuid of the Attachment resource.") @PathParam("attachmentGuid") String attachmentGuid,
			@Parameter(description = "Attachment thumbnail") @QueryParam("thumbnail") @DefaultValue("false") Boolean thumbnail,
			@Parameter(description = "The fire year.") @QueryParam("fireYear") Integer fireYear) throws IOException;

	@Operation(summary = "Add Incident Attachment bytes by ID.", description = "Add the Incident Attachment bytes by ID.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "OK"),
			@ApiResponse(responseCode = "404", description = "Not Found"),
			@ApiResponse(responseCode = "500", description = "Internal Server Error")
	})
	@POST
	@Path("/publishedIncidentAttachment/{incidentGuid}/attachments/{attachmentGuid}/bytes")
	Response createIncidentAttachmentBytes(
			@Parameter(description = "The incidentGuid of the Wildfire Incident resource.") @PathParam("incidentGuid") String incidentGuid,
			@Parameter(description = "The attachmentGuid of the Attachment resource.") @PathParam("attachmentGuid") String attachmentGuid,
			@Parameter(description = "Attachment thumbnail") @QueryParam("thumbnail") @DefaultValue("false") Boolean thumbnail,
			@Parameter(name = "file") @FormDataParam("file") FormDataBodyPart file);

	@Operation(summary = "Update Incident Attachment by ID", description = "Update Incident Attachment by ID")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "OK"),
			@ApiResponse(responseCode = "400", description = "Bad Request"),
			@ApiResponse(responseCode = "403", description = "Forbidden"),
			@ApiResponse(responseCode = "404", description = "Not Found"),
			@ApiResponse(responseCode = "409", description = "Conflict"),
			@ApiResponse(responseCode = "412", description = "Precondition Failed"),
			@ApiResponse(responseCode = "500", description = "Internal Server Error")
	})
	@PUT
	@Path("/publishedIncidentAttachment/{incidentGuid}/attachments/{attachmentGuid}")
	@Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
	@Consumes({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
	public Response updateIncidentAttachment(
			@Parameter(description = "The incidentGuid of the Wildfire Incident resource.") @PathParam("incidentGuid") String incidentGuid,
			@Parameter(description = "The attachmentGuid of the Attachment resource.") @PathParam("attachmentGuid") String attachmentGuid,
			@Parameter(name = "attachment", description = "The Incident Attachment resource containing the new values.", required = true) AttachmentResource attachment);

	@Operation(summary = "Delete Incident Attachment by ID", description = "Delete Incident Attachment by ID")
	@ApiResponses(value = { @ApiResponse(responseCode = "204", description = "No Content"),
			@ApiResponse(responseCode = "403", description = "Forbidden"),
			@ApiResponse(responseCode = "404", description = "Not Found"),
			@ApiResponse(responseCode = "409", description = "Conflict"),
			@ApiResponse(responseCode = "412", description = "Precondition Failed"),
			@ApiResponse(responseCode = "500", description = "Internal Server Error")
	})
	@DELETE
	@Path("/publishedIncidentAttachment/{incidentGuid}/attachments/{attachmentGuid}")
	public Response deleteIncidentAttachment(
			@Parameter(description = "The incidentGuid of the Wildfire Incident resource.") @PathParam("incidentGuid") String incidentGuid,
			@Parameter(description = "The attachmentGuid of the Attachment resource.") @PathParam("attachmentGuid") String attachmentGuid);

	@Operation(summary = "Delete Incident Attachment Bytes by ID", description = "Delete Incident Attachment Bytes by ID")
	@ApiResponses(value = { @ApiResponse(responseCode = "204", description = "No Content"),
			@ApiResponse(responseCode = "403", description = "Forbidden"),
			@ApiResponse(responseCode = "404", description = "Not Found"),
			@ApiResponse(responseCode = "409", description = "Conflict"),
			@ApiResponse(responseCode = "412", description = "Precondition Failed"),
			@ApiResponse(responseCode = "500", description = "Internal Server Error")
	})
	@DELETE
	@Path("/publishedIncidentAttachment/{incidentNumberLabel}/attachments/{attachmentGuid}/bytes")
	public Response deleteIncidentAttachmentBytes(
			@Parameter(description = "The incidentNumberLabel of the Wildfire Incident resource.") @PathParam("incidentNumberLabel") String incidentNumberLabel,
			@Parameter(description = "The attachmentGuid of the Attachment resource.") @PathParam("attachmentGuid") String attachmentGuid,
			@Parameter(description = "The fire year.") @QueryParam("fireYear") Integer fireYear);
}
