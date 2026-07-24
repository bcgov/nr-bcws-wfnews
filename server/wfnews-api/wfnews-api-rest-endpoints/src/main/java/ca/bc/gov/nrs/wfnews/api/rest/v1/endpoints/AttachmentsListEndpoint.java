package ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints;

import java.util.List;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import org.springframework.web.bind.annotation.CrossOrigin;

import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.AttachmentResource;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@Path("/")
@Tag(name = "IncidentAttachments")
public interface AttachmentsListEndpoint {

	@Operation(summary = "Get Incident Attachments.", description = "Get list of Incident Attachments.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "OK"),
			@ApiResponse(responseCode = "404", description = "Not Found"),
			@ApiResponse(responseCode = "500", description = "Internal Server Error")
	})
	@GET
	@Path("/publicPublishedIncidentAttachment/{incidentGuid}/attachments")
	@Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
	@CrossOrigin(origins = "*", allowedHeaders = "*")
	Response getIncidentAttachmentList(
			@Parameter(description = "The incidentGuid of the Wildfire Incident resource.") @PathParam("incidentGuid") String incidentGuid,
			@Parameter(description = "List primary attachments") @QueryParam("primaryIndicator") @DefaultValue("false") String primaryIndicator,
			@Parameter(description = "The sourceObjectNameCode the results to be returned.") @QueryParam("sourceObjectNameCode") List<String> sourceObjectNameCode,
			@Parameter(description = "The attachmentTypeCode the results to be returned.") @QueryParam("attachmentTypeCode") List<String> attachmentTypeCode,
			@Parameter(description = "The page number of the results to be returned.") @QueryParam("pageNumber") String pageNumber,
			@Parameter(description = "The number of results per page.") @QueryParam("pageRowCount") String pageRowCount,
			@Parameter(description = "Comma separated list of property names to order the result set by.") @QueryParam("orderBy") String orderBy);

	@Operation(summary = "Add Incident Attachment", description = "Add a Incident attachment resource to the List of Incident attachment resources")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "201", description = "Created"),
			@ApiResponse(responseCode = "400", description = "Bad Request"),
			@ApiResponse(responseCode = "403", description = "Forbidden"),
			@ApiResponse(responseCode = "500", description = "Internal Server Error") })
	@POST
	@Path("/publishedIncidentAttachment/{incidentGuid}/attachments")
	@Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
	@Consumes({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
	public Response createIncidentAttachment(
			@Parameter(description = "The incidentGuid of the Wildfire Incident resource.") @PathParam("incidentGuid") String incidentGuid,
			@Parameter(name = "attachment", description = "The Attachment resource containing the new values.", required = true) AttachmentResource attachment);
}
