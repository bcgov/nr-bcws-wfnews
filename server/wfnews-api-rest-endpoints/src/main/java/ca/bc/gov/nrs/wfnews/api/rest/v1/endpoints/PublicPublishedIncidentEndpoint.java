package ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import ca.bc.gov.nrs.common.rest.endpoints.BaseEndpoints;
import ca.bc.gov.nrs.common.service.ConflictException;
import ca.bc.gov.nrs.common.service.ForbiddenException;
import ca.bc.gov.nrs.common.service.NotFoundException;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiParam;

@Path("/publicPublishedIncident")
@Api(value = "PublicPublishedIncidentEndpoint")
public interface PublicPublishedIncidentEndpoint extends BaseEndpoints{
	
	@GET
	@Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
	@Consumes({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
	public Response getPublishedIncidentList( @ApiParam("The page number of the results to be returned.") @QueryParam("pageNumber") String pageNumber,
	        @ApiParam("The number of results per page.") @QueryParam("pageRowCount") String pageRowCount) throws NotFoundException, ForbiddenException, ConflictException;
	
	@GET
	@Path("/features")
	@Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
	@Consumes({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
	public Response getPublishedIncidentListAsFeatures(@QueryParam("stageOfControl") String stageOfControl)throws NotFoundException, ForbiddenException, ConflictException;

	@GET
	@Path("/{publishedIncidentDetailGuid}")
	@Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
	@Consumes({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
	public Response getPublishedIncident(@PathParam("publishedIncidentDetailGuid") String publishedIncidentDetailGuid)throws NotFoundException, ForbiddenException, ConflictException;
}
	
	