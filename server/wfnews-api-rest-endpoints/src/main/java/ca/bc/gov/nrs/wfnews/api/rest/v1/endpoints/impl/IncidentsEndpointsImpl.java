package ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.impl;

import javax.ws.rs.core.Response;

import ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.IncidentsEndpoints;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.IncidentResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.IncidentListResource;
import ca.bc.gov.nrs.wfnews.service.api.v1.IncidentsService;
import ca.bc.gov.nrs.wfone.common.rest.endpoints.BaseEndpointsImpl;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

public class IncidentsEndpointsImpl extends BaseEndpointsImpl implements IncidentsEndpoints{

    @Autowired
    IncidentsService incidentsService;

    private static final Logger logger = LoggerFactory.getLogger(IncidentsEndpointsImpl.class);
    
    @Override 
    public Response getIncidents(String status, String date, Double minLatitude, Double maxLatitude, Double minLongitude, Double maxLongitude) {

        logger.debug("<getIncidents");

        Response response = null;
		
		logRequest();

        try{
        	IncidentListResource result = incidentsService.getIncidents(status, date, minLatitude, maxLatitude, minLongitude, maxLongitude);
        	
        	result.setETag(getEtag(result));

            response = Response.ok(result).tag(result.getUnquotedETag()).build();
  
        } catch (Exception e) {
        	response = getInternalServerErrorResponse(e);

		} catch (Throwable t) {
			response = getInternalServerErrorResponse(t);
		}
		
		response.getHeaders().add("Access-Control-Allow-Origin", "*");
		response.getHeaders().add("Access-Control-Allow-Methods", "GET, OPTIONS, HEAD, PUT, POST");
		
		logResponse(response); 
		
		logger.debug("<getIncidents");
		
		return response;
    }
    
    @Override 
    public Response getIncidentByID(String id) {

        logger.debug("<getIncidents");

        Response response = null;
		
		logRequest();

        try{
        	IncidentResource result = incidentsService.getIncidentByID(id);
        	
        	result.setETag(getEtag(result));

            response = Response.ok(result).tag(result.getUnquotedETag()).build();
  
        } catch (Exception e) {
        	response = getInternalServerErrorResponse(e);

		} catch (Throwable t) {
			response = getInternalServerErrorResponse(t);
		}
		
		response.getHeaders().add("Access-Control-Allow-Origin", "*");
		response.getHeaders().add("Access-Control-Allow-Methods", "GET, OPTIONS, HEAD, PUT, POST");
		
		logResponse(response); 
		
		logger.debug("<getIncidents");
		
		return response;
		
    }
        
}
