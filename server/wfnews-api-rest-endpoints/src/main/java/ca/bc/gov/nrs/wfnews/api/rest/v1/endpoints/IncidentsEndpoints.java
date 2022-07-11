package ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response;
import javax.ws.rs.QueryParam;

import ca.bc.gov.nrs.wfone.common.rest.endpoints.BaseEndpoints;
import ca.bc.gov.nrs.common.wfone.rest.resource.HeaderConstants;
import ca.bc.gov.nrs.common.wfone.rest.resource.MessageListRsrc;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiImplicitParams;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import io.swagger.annotations.ResponseHeader;

@Path("/incidents")
@Api(value = "WildfireNewsIncidentList")
public interface IncidentsEndpoints extends BaseEndpoints {

    @ApiOperation(value = "Get the List of Wildfire Incidents.")
	@ApiImplicitParams({
		@ApiImplicitParam(name = HeaderConstants.VERSION_HEADER, value = HeaderConstants.VERSION_HEADER_DESCRIPTION, required = false, dataType = "integer", paramType = "header")
	})
	@ApiResponses(value = {
		@ApiResponse(code = 200, message = "OK", responseHeaders = @ResponseHeader(name = "ETag", response = String.class, description = "The ETag response-header field provides the current value of the entity tag for the requested variant.")),
		@ApiResponse(code = 404, message = "Not Found"),
		@ApiResponse(code = 500, message = "Internal Server Error", response = MessageListRsrc.class) })
	@GET
	@Produces({ MediaType.APPLICATION_JSON })
	Response getIncidents(@ApiParam("The fire status of the Wildfire Incident resource.") @QueryParam("status") String status,
			@ApiParam("The fire status of the Wildfire Incident resource.") @QueryParam("date") String date,
			@ApiParam("The minLatitude of the Wildfire Incident resource.") @QueryParam("minLatitude") Double minLatitude,
			@ApiParam("The maxLatitude of the Wildfire Incident resource.") @QueryParam("maxLatitude") Double maxLatitude,
			@ApiParam("The minLongitude of the Wildfire Incident resource.") @QueryParam("minLongitude") Double minLongitude,
			@ApiParam("The maxLongitude of the Wildfire Incident resource.") @QueryParam("maxLongitude") Double maxLongitude);

    
    @ApiOperation(value = "Get the Wildfire Incidents by ID.")
   	@ApiImplicitParams({
   		@ApiImplicitParam(name = HeaderConstants.VERSION_HEADER, value = HeaderConstants.VERSION_HEADER_DESCRIPTION, required = false, dataType = "integer", paramType = "header")
   	})
   	@ApiResponses(value = {
   		@ApiResponse(code = 200, message = "OK", responseHeaders = @ResponseHeader(name = "ETag", response = String.class, description = "The ETag response-header field provides the current value of the entity tag for the requested variant.")),
   		@ApiResponse(code = 404, message = "Not Found"),
   		@ApiResponse(code = 500, message = "Internal Server Error", response = MessageListRsrc.class) })
   	@GET
   	@Produces({ MediaType.APPLICATION_JSON })
    @Path("/{id}")
   	Response getIncidentByID(@ApiParam("The ID of the Wildfire Incident resource.") @PathParam("id") String id);
    
}
