package ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.impl;

import java.time.Year;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.ws.rs.core.GenericEntity;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;

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
  private Map<String, List<StatisticsResource>> statsData;

  public StatisticsEndpointImpl() {
    statsData = new HashMap<>();
    loadHistoricalStats();
  }

  public Response getStatistics(String fireCentre, Integer fireYear) throws NotFoundException, ForbiddenException, ConflictException {
		Response response = null;
    
    try {
      
        if (statsData == null) {
          statsData = new HashMap<>();
        }
        
        List<StatisticsResource> result;
        
        if (!statsData.isEmpty() && statsData.containsKey(fireCentre + ":" + fireYear)) {
          result = statsData.get(fireCentre + ":" + fireYear);
        } else {
          result = incidentsService.getStatistics(fireCentre, fireYear, getFactoryContext());
          statsData.put(fireCentre + ":" + fireYear, result);
        }

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

  @Scheduled(cron = "0 5 * * *")
  private void loadHistoricalStats() {
    logger.info("Starting statistics data pre-cache");
    // Clear the stats cache
    statsData = new HashMap<>();

    // get the current fire year
    int currentYear = Year.now().getValue();
		if (Calendar.getInstance().get(Calendar.MONTH) < 3) {
			currentYear -= 1;
		}

    int index = 0;
    while (index < 5) {
      try {
        List<StatisticsResource> result = incidentsService.getStatistics("BC", (currentYear - index), getFactoryContext());
        statsData.put("BC:" + (currentYear - index), result);
      } catch (Exception ex) { // sigh, getStatistics throws "Exception", should be: NotFoundException | ForbiddenException | ConflictException | ValidationFailureExceptionJava | 
        logger.error("Failed to pre-cache statistics data", ex);
      }
      index += 1;
    }

    logger.info("Statistics pre-cache completed");
  }
}
