package ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.impl;

import javax.ws.rs.core.GenericEntity;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import ca.bc.gov.nrs.common.service.ConflictException;
import ca.bc.gov.nrs.common.service.ForbiddenException;
import ca.bc.gov.nrs.common.service.NotFoundException;
import ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.StatisticsEndpoint;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.StatisticsResource;
import ca.bc.gov.nrs.wfnews.service.api.v1.IncidentsService;
import ca.bc.gov.nrs.wfone.common.rest.endpoints.BaseEndpointsImpl;

public class StatisticsEndpointImpl extends BaseEndpointsImpl implements StatisticsEndpoint {
  private static final Logger logger = LoggerFactory.getLogger(StatisticsEndpointImpl.class);

  @Autowired
	private IncidentsService incidentsService;

  public Response getStatistics(String fireCentre, Integer fireYear) throws NotFoundException, ForbiddenException, ConflictException {
		Response response = null;
    
    try {
      
        StatisticsResource result = incidentsService.getStatistics(fireCentre, fireYear, getFactoryContext());
        GenericEntity<StatisticsResource> entity = new GenericEntity<StatisticsResource>(result) {
          /* do nothing */
        };

        response = Response.ok(entity).tag(result.getUnquotedETag()).build();
      
    } catch (NotFoundException e) {
      response = Response.status(Status.NOT_FOUND).build();
    } catch (Throwable t) {
      response = getInternalServerErrorResponse(t);
    }
    logResponse(response);

	return response;
  }
}
