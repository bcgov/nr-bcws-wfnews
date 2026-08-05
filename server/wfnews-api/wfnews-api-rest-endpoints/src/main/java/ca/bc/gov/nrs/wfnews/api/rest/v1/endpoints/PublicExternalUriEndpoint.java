package ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import org.springframework.web.bind.annotation.CrossOrigin;


import ca.bc.gov.nrs.common.service.ConflictException;
import ca.bc.gov.nrs.common.service.ForbiddenException;
import ca.bc.gov.nrs.common.service.NotFoundException;
import io.swagger.annotations.ApiParam;

@Path("/publicExternalUri")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public interface PublicExternalUriEndpoint  {
	@GET
	@Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
	@Consumes({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
	public Response getExternalUriList(
			@ApiParam("The incidentGuid for the external URI.") @QueryParam("incidentGuid") String incidentGuid,
			@ApiParam("The sourceObjectUniqueId for the external URI (backwards compatibility).") @QueryParam("sourceObjectUniqueId") String sourceObjectUniqueId,
			@ApiParam("The page number of the results to be returned.") @QueryParam("pageNumber") String pageNumber,
			@ApiParam("The number of results per page.") @QueryParam("pageRowCount") String pageRowCount)
			throws NotFoundException, ForbiddenException, ConflictException;

	@GET
	@Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
	@Consumes({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
	@Path("/external-uri/{externalUriGuid}")
	public Response getSingleExternalUri(
			@ApiParam("The guid for the external URI.") @PathParam("externalUriGuid") String externalUriGuid)
			throws NotFoundException, ForbiddenException, ConflictException;

}
