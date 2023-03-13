 package ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints;

import java.util.List;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.springframework.web.bind.annotation.CrossOrigin;

import ca.bc.gov.nrs.common.rest.endpoints.BaseEndpoints;
import ca.bc.gov.nrs.common.service.ConflictException;
import ca.bc.gov.nrs.common.service.ForbiddenException;
import ca.bc.gov.nrs.common.service.NotFoundException;
import ca.bc.gov.nrs.wfnews.api.rest.v1.jersey.Compress;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiParam;

@Path("/publicPublishedIncident")
@Api(value = "PublicPublishedIncidentEndpoint")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public interface PublicPublishedIncidentEndpoint extends BaseEndpoints{
	
	@GET
	@Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
	public Response getPublishedIncidentList( 
		@ApiParam("Search Text.") @QueryParam("searchText") String searchText,
		@ApiParam("The page number of the results to be returned.") @QueryParam("pageNumber") String pageNumber,
		@ApiParam("The number of results per page.") @QueryParam("pageRowCount") String pageRowCount,
		@ApiParam("Order the results by a specific column and sort order, eg. 'incident_name,desc'") @QueryParam("orderBy") String orderBy,
		@ApiParam("Filter on fire of note") @QueryParam("fireOfNote") Boolean fireOfNote,
		@ApiParam("Filter on the provided stages of control. If none are provided, no fires will be returned.") @QueryParam("stageOfControlList") List<String> stageOfControlList,
		@ApiParam("Filter on fires that are new within 24 hours") @QueryParam("newFires") Boolean newFires,
		@ApiParam("Filter on fire centre code") @QueryParam("fireCentreCode") String fireCentreCode,
		@ApiParam("Filter on fire centre name") @QueryParam("fireCentreName") String fireCentreName,
		@ApiParam("Filter on fires that have create dates >= this date with date format (yyyy-MM-dd HH:mm:ss.SSSSSS)") @QueryParam("fromCreateDate") String fromCreateDate,
		@ApiParam("Filter on fires that have create dates <= this date with date format (yyyy-MM-dd HH:mm:ss.SSSSSS)") @QueryParam("toCreateDate") String toCreateDate,
		@ApiParam("Filter on fires that have discovery dates >= this date with date format (yyyy-MM-dd HH:mm:ss.SSSSSS)") @QueryParam("fromDiscoveryDate") String fromDiscoveryDate,
		@ApiParam("Filter on fires that have discovery dates <= this date with date format (yyyy-MM-dd HH:mm:ss.SSSSSS)") @QueryParam("toDiscoveryDate") String toDiscoveryDate,
		@ApiParam("The Bounding box to restrict the query to, comma delimited xmin, ymin, xmax, ymax") @QueryParam("bbox") String bbox,
		@ApiParam("The latitude for a point and radius query") @QueryParam("latitude") Double latitude,
		@ApiParam("The longitude for a point and radius query") @QueryParam("longitude") Double longitude,
		@ApiParam("The Fire Year for incidents") @QueryParam("fireYear") Integer fireYear,
		@ApiParam("The radius (in metres) for a point and radius query") @QueryParam("radius") Double radius) throws NotFoundException, ForbiddenException, ConflictException;
	
	@GET
	@Path("/features")
	@Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
	@Compress
	public Response getPublishedIncidentListAsFeatures(@QueryParam("stageOfControl") String stageOfControl, @ApiParam("The Bounding box to restrict the query to, comma delimited xmin, ymin, xmax, ymax") @QueryParam("bbox") String bbox)throws NotFoundException, ForbiddenException, ConflictException;

	@GET
	@Path("/{publishedIncidentDetailGuid}")
	@Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
	public Response getPublishedIncident(@PathParam("publishedIncidentDetailGuid") String publishedIncidentDetailGuid,
																			 @ApiParam("The Fire Year for incidents") @QueryParam("fireYear") Integer fireYear)throws NotFoundException, ForbiddenException, ConflictException;

	@GET
	@Path("byIncident/{incidentGuid}")
	@Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
	public Response getPublishedIncidentByIncidentGuid(@PathParam("incidentGuid") String incidentGuid)throws NotFoundException, ForbiddenException, ConflictException;
}
