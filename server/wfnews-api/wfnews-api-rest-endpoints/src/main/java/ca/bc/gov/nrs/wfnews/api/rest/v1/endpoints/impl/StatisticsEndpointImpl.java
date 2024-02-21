package ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.impl;

import java.util.List;

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
import ca.bc.gov.nrs.wfnews.api.rest.v1.utils.SqlUtil;
import ca.bc.gov.nrs.wfnews.service.api.v1.IncidentsService;
import ca.bc.gov.nrs.wfone.common.rest.endpoints.BaseEndpointsImpl;

public class StatisticsEndpointImpl extends BaseEndpointsImpl implements StatisticsEndpoint {
  private static final Logger logger = LoggerFactory.getLogger(StatisticsEndpointImpl.class);

  @Autowired
	private IncidentsService incidentsService;

  public Response getStatistics(String fireCentre, Integer fireYear) throws NotFoundException, ForbiddenException, ConflictException {
		Response response = null;

    String[] sqlKeywords = SqlUtil.sqlKeywords;
    for (String keyword : sqlKeywords) {
        if (fireCentre.contains(keyword) || fireCentre.contains("'")) {
          logger.warn("Potential use of SQL statement detected");
          return null;
        }
    }
    
    try {
      List<StatisticsResource> result = incidentsService.getStatistics(fireCentre, fireYear, getFactoryContext());

      GenericEntity<List<StatisticsResource>> entity = new GenericEntity<List<StatisticsResource>>(result) {
        /* do nothing */
      };

      // static resource doesn't need an eTag
      response = Response.ok(entity).build();
    } catch (NotFoundException e) {
      response = Response.status(Status.NOT_FOUND).build();
    } catch (Throwable t) {
      response = getInternalServerErrorResponse(t);
    }

    logResponse(response);

	  return response;
  }
}
