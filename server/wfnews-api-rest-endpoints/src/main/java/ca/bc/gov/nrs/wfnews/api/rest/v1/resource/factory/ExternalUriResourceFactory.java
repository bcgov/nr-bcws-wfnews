package ca.bc.gov.nrs.wfnews.api.rest.v1.resource.factory;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.core.UriBuilder;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.nrs.common.rest.resource.RelLink;
import ca.bc.gov.nrs.wfone.common.rest.endpoints.resource.factory.BaseResourceFactory;
import ca.bc.gov.nrs.wfone.common.service.api.model.factory.FactoryContext;
import ca.bc.gov.nrs.common.service.model.factory.FactoryException;
import ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.ExternalUriEndpoint;
import ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.PublishedIncidentEndpoint;
import ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.security.Scopes;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.ExternalUriListResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.ExternalUriResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.PublishedIncidentListResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.PublishedIncidentResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.types.ResourceTypes;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.ExternalUriDto;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.PagedDtos;
import ca.bc.gov.nrs.wfnews.service.api.v1.model.factory.ExternalUriFactory;

public class ExternalUriResourceFactory extends BaseResourceFactory implements ExternalUriFactory{
	
	private static final Logger logger = LoggerFactory.getLogger(ExternalUriResourceFactory.class);

	@Override
	public ExternalUriResource getExternalUri(ExternalUriDto dto, FactoryContext context) throws FactoryException {
		logger.debug("<getExternalUri");
		URI baseUri = getBaseURI(context);

		ExternalUriResource result = new ExternalUriResource();
		populate(result, dto);

		String eTag = getEtag(result);
		result.setETag(eTag);

		setSelfLink(result, baseUri);

//		setLinks(dto.getExternalUri(), result, baseUri);

		return result;
	}
	
	private void populate(ExternalUriResource resource, ExternalUriDto dto) {
		resource.setExternalUriGuid(dto.getExternalUriGuid());
		resource.setSourceObjectNameCode(dto.getSourceObjectNameCode());
		resource.setSourceObjectUniqueId(dto.getSourceObjectUniqueId());
		resource.setExternalUriCategoryTag(dto.getExternalUriCategoryTag());
		resource.setExternalUriDisplayLabel(dto.getExternalUriDisplayLabel());
		resource.setExternalUri(dto.getExternalUri());
		resource.setPublishedInd(dto.getPublishedInd());
		resource.setRevisionCount(dto.getRevisionCount());
		resource.setCreatedTimestamp(dto.getCreatedTimestamp());
		resource.setPrivateInd(dto.getPrivateInd());
		resource.setArchivedInd(dto.getArchivedInd());
		resource.setPrimaryInd(dto.getPrimaryInd());
		resource.setCreateDate(dto.getCreateDate());
		resource.setCreateUser(dto.getCreateUser());
		resource.setUpdateDate(dto.getUpdateDate());
		resource.setUpdateUser(dto.getUpdateUser());
	}
	
	private static void setSelfLink(ExternalUriResource resource, URI baseUri) {
		String selfUri = getExternalUriSelfUri(resource.getExternalUriGuid(), baseUri);
		
		resource.getLinks().add(new RelLink(ResourceTypes.SELF, selfUri, "GET"));
	}
	
//	private void setLinks(String publishedIncidentDetailGuid, ExternalUriResource resource, URI baseUri){
//		
//		if (hasAuthority(Scopes.UPDATE_WILDFIRE_INCIDENT)) {
//
//			{
//				String result = UriBuilder
//						.fromUri(baseUri)
//						.path(PublishedIncidentEndpoint.class)
//						.build(publishedIncidentDetailGuid).toString();
//				resource.getLinks().
//				add(new RelLink
//						(ResourceTypes.UPDATE_WILDFIRE_INCIDENT, 
//								result, "PUT"));
//			}
//		}
//
//		if (hasAuthority(Scopes.DELETE_WILDFIRE_INCIDENT)) {
//
//			String result = UriBuilder
//					.fromUri(baseUri)
//					.path(PublishedIncidentEndpoint.class)
//					.build(publishedIncidentDetailGuid).toString();
//			resource.getLinks().add(new RelLink(ResourceTypes.DELETE_WILDFIRE_INCIDENT, result, "DELETE"));
//		}
//	}
	
	public static String getExternalUriSelfUri(String externalUriGuid, URI baseUri) {
		
		String result = UriBuilder.fromUri(baseUri)
		.path(ExternalUriEndpoint.class)
		.build(externalUriGuid).toString();
		return result;
	}
	
	@Override
	public ExternalUriListResource getExternalUriList(PagedDtos<ExternalUriDto> dtos,
			Integer pageNumber, Integer pageRowCount, FactoryContext context) throws FactoryException {
		ExternalUriListResource result = null;
		URI baseUri = getBaseURI(context);

		List<ExternalUriResource> resources = new ArrayList<ExternalUriResource>();
		for (ExternalUriDto dto : dtos.getResults()) {
			ExternalUriResource resource = new ExternalUriResource();
			populate(resource, dto);
			setSelfLink(resource, baseUri);
			resources.add(resource);
		}
		
		result = new ExternalUriListResource();
		result.setCollection(resources);
		result.setTotalRowCount(dtos.getTotalRowCount());
		
		if (pageNumber != null && pageRowCount != null) {
			int totalPageCount = (int) Math.ceil(((double)dtos.getTotalRowCount())/((double)pageRowCount));
			result.setPageNumber(pageNumber);
			result.setPageRowCount(pageRowCount);
			result.setTotalPageCount(totalPageCount);
		}	

		String eTag = getEtag(result);
		result.setETag(eTag);
		
		return result;
	}
	
	
}