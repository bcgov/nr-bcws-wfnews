package ca.bc.gov.nrs.wfnews.service.api.v1;

import org.springframework.transaction.annotation.Transactional;

import com.mashape.unirest.http.JsonNode;

import ca.bc.gov.nrs.common.persistence.dao.DaoException;
import ca.bc.gov.nrs.wfnews.api.model.v1.PublishedIncident;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.ExternalUriListResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.ExternalUriResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.IncidentListResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.IncidentResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.PublishedIncidentListResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.PublishedIncidentResource;
import ca.bc.gov.nrs.common.service.ConflictException;
import ca.bc.gov.nrs.common.service.NotFoundException;
import ca.bc.gov.nrs.common.service.ValidationFailureException;
import ca.bc.gov.nrs.wfone.common.service.api.model.factory.FactoryContext;
import ca.bc.gov.nrs.wfone.common.webade.authentication.WebAdeAuthentication;

public interface IncidentsService {

	IncidentListResource getIncidents(String status, String date, Double minLatitude, Double maxLatitude, Double minLongitude, Double maxLongitude);
	
	IncidentResource getIncidentByID(String id);
	
	IncidentListResource getIncidentResourceListFromJsonBody(JsonNode jsonNode);
	
	void setAgolQueryUrl(String agolQueryUrl);
	
	@Transactional(readOnly = false, rollbackFor=Exception.class)
	PublishedIncidentResource createPublishedWildfireIncident(PublishedIncident publishedIncident, FactoryContext factoryContext) throws ValidationFailureException, ConflictException, NotFoundException, Exception;

	@Transactional(readOnly = false, rollbackFor=Exception.class)
	PublishedIncidentResource updatePublishedWildfireIncident(PublishedIncident publishedIncident, FactoryContext factoryContext) throws ValidationFailureException, ConflictException, NotFoundException, Exception;
	
	@Transactional(readOnly = true, rollbackFor=Exception.class)
	PublishedIncidentResource getPublishedIncidentByIncidentGuid(PublishedIncident publishedIncident, WebAdeAuthentication webAdeAuthentication, FactoryContext factoryContext) throws DaoException;
	
	@Transactional(readOnly = true, rollbackFor=Exception.class)
	PublishedIncidentResource getPublishedIncident(String publishedIncidentDetailGuid, WebAdeAuthentication webAdeAuthentication, FactoryContext factoryContext) throws DaoException;
	
	@Transactional(readOnly = false, rollbackFor=Exception.class)
	void deletePublishedIncident(String publishedIncidentDetailGuid, FactoryContext factoryContext) throws NotFoundException, ConflictException;

	@Transactional(readOnly = true, rollbackFor=Exception.class)
	PublishedIncidentListResource getPublishedIncidentList(Integer pageNumber, 
			Integer pageRowCount, FactoryContext factoryContext);

	@Transactional(readOnly = false, rollbackFor=Exception.class)
	ExternalUriResource createExternalUri(ExternalUriResource externalUri, FactoryContext factoryContext) throws ValidationFailureException, ConflictException, NotFoundException, Exception;
	
	@Transactional(readOnly = false, rollbackFor=Exception.class)
	ExternalUriResource updateExternalUri(ExternalUriResource externalUri, FactoryContext factoryContext) throws ValidationFailureException, ConflictException, NotFoundException, Exception;
	
	@Transactional(readOnly = false, rollbackFor=Exception.class)
	void deleteExternalUri(String ExternalUriDetailGuid, FactoryContext factoryContext) throws NotFoundException, ConflictException;
	
	@Transactional(readOnly = true, rollbackFor=Exception.class)
	ExternalUriResource getExternalUri(String externalUriGuid, WebAdeAuthentication webAdeAuthentication, FactoryContext factoryContext) throws DaoException;
	
	@Transactional(readOnly = true, rollbackFor=Exception.class)
	ExternalUriListResource getExternalUriList(String sourceObjectUniqueId, Integer pageNumber, 
			Integer pageRowCount, FactoryContext factoryContext);
    
}
