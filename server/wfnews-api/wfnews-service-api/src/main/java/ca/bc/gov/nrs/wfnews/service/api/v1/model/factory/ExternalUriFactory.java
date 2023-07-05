package ca.bc.gov.nrs.wfnews.service.api.v1.model.factory;

import ca.bc.gov.nrs.wfone.common.service.api.model.factory.FactoryContext;
import ca.bc.gov.nrs.common.service.model.factory.FactoryException;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.ExternalUriListResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.ExternalUriResource;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.PagedDtos;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.ExternalUriDto;

public interface ExternalUriFactory {
	
	ExternalUriResource getExternalUri(
			ExternalUriDto dto, 
			FactoryContext context) 
			throws FactoryException;
	
	ExternalUriListResource getExternalUriList(
			PagedDtos<ExternalUriDto>externalUriList, 
			Integer pageNumber,
			Integer pageRowCount, 
			FactoryContext factoryContext)
			throws FactoryException;
}
	