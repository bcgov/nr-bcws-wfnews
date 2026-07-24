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

@Path("/statistics")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public interface StatisticsEndpoint  {
  @GET
	@Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
	@Consumes({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
	@Path("/")
	public Response getStatistics(@QueryParam("fireCentre") String fireCentre, @QueryParam("fireYear") Integer fireYear) throws NotFoundException, ForbiddenException, ConflictException;
}
