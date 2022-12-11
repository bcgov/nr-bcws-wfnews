package ca.bc.gov.nrs.wfnews.service.api.v1.model.factory;

import ca.bc.gov.nrs.wfone.common.service.api.model.factory.FactoryContext;
import ca.bc.gov.nrs.common.service.model.factory.FactoryException;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.PublishedIncidentListResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.PublishedIncidentResource;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.PagedDtos;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.PublishedIncidentDto;

public interface PublishedIncidentFactory {
	
	PublishedIncidentResource getPublishedWildfireIncident(
			PublishedIncidentDto dto, 
			FactoryContext context) 
			throws FactoryException;
	
	PublishedIncidentListResource getPublishedIncidentList(
			PagedDtos<PublishedIncidentDto> dto, 
			Integer pageNumber,
			Integer pageRowCount,
			FactoryContext context) 
			throws FactoryException;
}