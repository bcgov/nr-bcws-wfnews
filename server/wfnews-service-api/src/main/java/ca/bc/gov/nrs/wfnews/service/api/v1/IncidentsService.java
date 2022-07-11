package ca.bc.gov.nrs.wfnews.service.api.v1;

import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.IncidentListResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.IncidentResource;

public interface IncidentsService {

	IncidentListResource getIncidents(String status, String date, Double minLatitude, Double maxLatitude, Double minLongitude, Double maxLongitude);
	
	IncidentResource getIncidentByID(String id);

    
}
