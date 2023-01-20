package ca.bc.gov.nrs.wfnews.api.rest.v1.resource.factory;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.core.UriBuilder;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;

import ca.bc.gov.nrs.common.rest.resource.RelLink;
import ca.bc.gov.nrs.wfone.common.rest.endpoints.resource.factory.BaseResourceFactory;
import ca.bc.gov.nrs.wfone.common.service.api.model.factory.FactoryContext;
import ca.bc.gov.nrs.wfone.common.webade.authentication.WebAdeAuthentication;
import ca.bc.gov.nrs.common.service.model.factory.FactoryException;
import ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.PublishedIncidentEndpoint;
import ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.security.Scopes;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.PublishedIncidentListResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.SimplePublishedIncidentResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.PublishedIncidentResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.types.ResourceTypes;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.PagedDtos;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.PublishedIncidentDto;
import ca.bc.gov.nrs.wfnews.service.api.v1.model.factory.PublishedIncidentFactory;

public class PublishedIncidentResourceFactory extends BaseResourceFactory implements PublishedIncidentFactory{
	
	private static final Logger logger = LoggerFactory.getLogger(PublishedIncidentResourceFactory.class);
	
	@Override
	public PublishedIncidentResource getPublishedWildfireIncident(PublishedIncidentDto dto, FactoryContext context)
			throws FactoryException {
		logger.debug("<getPublishedWildfireIncident");
		URI baseUri = getBaseURI(context);

		PublishedIncidentResource result = new PublishedIncidentResource();
		populate(result, dto);

		String eTag = getEtag(result);
		result.setETag(eTag);

		setSelfLink(result, baseUri);

		setLinks(dto.getPublishedIncidentDetailGuid(), result, baseUri);

		return result;
	}

	private static void setSelfLink(SimplePublishedIncidentResource resource, URI baseUri) {
		String selfUri = getPublishedIncidentSelfUri(resource.getPublishedIncidentDetailGuid(), baseUri);
		
		resource.getLinks().add(new RelLink(ResourceTypes.SELF, selfUri, "GET"));
	}
	
	private void setLinks(String publishedIncidentDetailGuid, SimplePublishedIncidentResource resource, URI baseUri){
		
		if (hasAuthority(Scopes.CREATE_PUBLISHED_INCIDENT)) {

				String result = UriBuilder
						.fromUri(baseUri)
						.path(PublishedIncidentEndpoint.class)
						.build(publishedIncidentDetailGuid).toString();
				resource.getLinks().add(new RelLink(ResourceTypes.CREATE_PUBLISHED_INCIDENT, result, "PUT"));
		}
		
		if (hasAuthority(Scopes.UPDATE_PUBLISHED_INCIDENT)) {

				String result = UriBuilder
						.fromUri(baseUri)
						.path(PublishedIncidentEndpoint.class)
						.build(publishedIncidentDetailGuid).toString();
				resource.getLinks().add(new RelLink(ResourceTypes.UPDATE_PUBLISHED_INCIDENT, result, "POST"));
		}

		if (hasAuthority(Scopes.DELETE_PUBLISHED_INCIDENT)) {

			String result = UriBuilder
					.fromUri(baseUri)
					.path(PublishedIncidentEndpoint.class)
					.build(publishedIncidentDetailGuid).toString();
			resource.getLinks().add(new RelLink(ResourceTypes.DELETE_PUBLISHED_INCIDENT, result, "DELETE"));
		}
	}
	
	public static String getPublishedIncidentSelfUri(String publisedIncidentDetailGuid, URI baseUri) {
		
		String result = UriBuilder.fromUri(baseUri)
		.path(PublishedIncidentEndpoint.class)
		.build(publisedIncidentDetailGuid).toString();
		
		return result;
	}
	
	private void populate(PublishedIncidentResource resource, PublishedIncidentDto dto) {
		resource.setPublishedIncidentDetailGuid(dto.getPublishedIncidentDetailGuid());
		resource.setIncidentGuid(dto.getIncidentGuid());
		resource.setIncidentNumberLabel(dto.getIncidentNumberLabel());
		resource.setNewsCreatedTimestamp(dto.getNewsCreatedTimestamp());
		resource.setStageOfControlCode(dto.getStageOfControlCode());
		resource.setGeneralIncidentCauseCatId(dto.getGeneralIncidentCauseCatId());
		resource.setNewsPublicationStatusCode(dto.getNewsPublicationStatusCode());
		resource.setDiscoveryDate(dto.getDiscoveryDate());
		resource.setDeclaredOutDate(dto.getDeclaredOutDate());
		resource.setFireZoneUnitIdentifier(dto.getFireZoneUnitIdentifier());
		resource.setFireOfNoteInd(dto.getFireOfNoteInd());
		resource.setIncidentName(dto.getIncidentName());
		resource.setIncidentLocation(dto.getIncidentLocation());
		resource.setIncidentOverview(dto.getIncidentOverview());
		resource.setTraditionalTerritoryDetail(dto.getTraditionalTerritoryDetail());
		resource.setIncidentSizeType(dto.getIncidentSizeType());
		resource.setIncidentSizeEstimatedHa(dto.getIncidentSizeEstimatedHa());
		resource.setIncidentSizeMappedHa(dto.getIncidentSizeMappedHa());
		resource.setIncidentSizeDetail(dto.getIncidentSizeDetail());
		resource.setIncidentCauseDetail(dto.getIncidentCauseDetail());
		resource.setContactOrgUnitIdentifer(dto.getContactOrgUnitIdentifer());
		resource.setContactPhoneNumber(dto.getContactPhoneNumber());
		resource.setContactEmailAddress(dto.getContactEmailAddress());
		resource.setResourceDetail(dto.getResourceDetail());
		resource.setWildfireCrewResourcesInd(dto.getWildfireCrewResourcesInd());
		resource.setWildfireCrewResourcesDetail(dto.getWildfireCrewResourcesDetail());
		resource.setWildfireAviationResourceInd(dto.getWildfireAviationResourceInd());
		resource.setWildfireAviationResourceDetail(dto.getWildfireAviationResourceDetail());
		resource.setHeavyEquipmentResourcesInd(dto.getHeavyEquipmentResourcesInd());
		resource.setHeavyEquipmentResourcesDetail(dto.getHeavyEquipmentResourcesDetail());
		resource.setIncidentMgmtCrewRsrcInd(dto.getIncidentMgmtCrewRsrcInd());
		resource.setIncidentMgmtCrewRsrcDetail(dto.getIncidentMgmtCrewRsrcDetail());
		resource.setStructureProtectionRsrcInd(dto.getStructureProtectionRsrcInd());
		resource.setStructureProtectionRsrcDetail(dto.getStructureProtectionRsrcDetail());
		resource.setPublishedTimestamp(dto.getPublishedTimestamp());
		resource.setPublishedUserTypeCode(dto.getPublishedUserTypeCode());
		resource.setPublishedUserGuid(dto.getPublishedUserGuid());
		resource.setPublishedUserUserId(dto.getPublishedUserUserId());
		resource.setPublishedUserName(dto.getPublishedUserName());
		resource.setLastUpdatedTimestamp(dto.getLastUpdatedTimestamp());
		resource.setPublishedIncidentRevisionCount(dto.getRevisionCount());	
		resource.setCreateDate(dto.getCreateDate());
		resource.setCreateUser(dto.getCreateUser());
		resource.setUpdateDate(dto.getUpdateDate());
		resource.setUpdateUser(dto.getUpdateUser());
		resource.setLatitude(dto.getLatitude());
		resource.setLongitude(dto.getLongitude());
		resource.setFireCentreCode(dto.getFireCentreCode());
		resource.setFireCentreName(dto.getFireCentreName());
		resource.setFireYear(dto.getFireYear());
		resource.setResponseTypeCode(dto.getResponseTypeCode());
		resource.setResponseTypeDetail(dto.getResponseTypeDetail());
	}

	private void populate(SimplePublishedIncidentResource resource, PublishedIncidentDto dto) {
		resource.setPublishedIncidentDetailGuid(dto.getPublishedIncidentDetailGuid());
		resource.setIncidentGuid(dto.getIncidentGuid());
		resource.setIncidentNumberLabel(dto.getIncidentNumberLabel());
		resource.setNewsCreatedTimestamp(dto.getNewsCreatedTimestamp());
		resource.setStageOfControlCode(dto.getStageOfControlCode());
		resource.setGeneralIncidentCauseCatId(dto.getGeneralIncidentCauseCatId());
		resource.setNewsPublicationStatusCode(dto.getNewsPublicationStatusCode());
		resource.setDiscoveryDate(dto.getDiscoveryDate());
		resource.setDeclaredOutDate(dto.getDeclaredOutDate());
		resource.setFireOfNoteInd(dto.getFireOfNoteInd());
		resource.setIncidentName(dto.getIncidentName());
		resource.setIncidentLocation(dto.getIncidentLocation());
		resource.setTraditionalTerritoryDetail(dto.getTraditionalTerritoryDetail());
		resource.setIncidentSizeEstimatedHa(dto.getIncidentSizeEstimatedHa());
		resource.setIncidentSizeMappedHa(dto.getIncidentSizeMappedHa());
		resource.setIncidentSizeDetail(dto.getIncidentSizeDetail());
		resource.setIncidentCauseDetail(dto.getIncidentCauseDetail());
		resource.setWildfireCrewResourcesInd(dto.getWildfireCrewResourcesInd());
		resource.setWildfireAviationResourceInd(dto.getWildfireAviationResourceInd());
		resource.setHeavyEquipmentResourcesInd(dto.getHeavyEquipmentResourcesInd());
		resource.setIncidentMgmtCrewRsrcInd(dto.getIncidentMgmtCrewRsrcInd());
		resource.setStructureProtectionRsrcInd(dto.getStructureProtectionRsrcInd());
		resource.setPublishedTimestamp(dto.getPublishedTimestamp());
		resource.setLastUpdatedTimestamp(dto.getLastUpdatedTimestamp());
		resource.setCreateDate(dto.getCreateDate());
		resource.setUpdateDate(dto.getUpdateDate());
		resource.setLatitude(dto.getLatitude());
		resource.setLongitude(dto.getLongitude());
		resource.setFireCentreCode(dto.getFireCentreCode());
		resource.setFireCentreName(dto.getFireCentreName());
		resource.setFireYear(dto.getFireYear());
		resource.setResponseTypeCode(dto.getResponseTypeCode());
		resource.setResponseTypeDetail(dto.getResponseTypeDetail());
	}

	@Override
	public PublishedIncidentListResource getPublishedIncidentList(PagedDtos<PublishedIncidentDto> dtos,
			Integer pageNumber, Integer pageRowCount, FactoryContext context) throws FactoryException {
		PublishedIncidentListResource result = null;
		URI baseUri = getBaseURI(context);

		List<SimplePublishedIncidentResource> resources = new ArrayList<SimplePublishedIncidentResource>();
		for (PublishedIncidentDto dto : dtos.getResults()) {
			SimplePublishedIncidentResource resource = new SimplePublishedIncidentResource();
			populate(resource, dto);
			setLinks(resource.getPublishedIncidentDetailGuid(), resource, baseUri);
			setSelfLink(resource, baseUri);
			resources.add((SimplePublishedIncidentResource)resource);
		}
		
		result = new PublishedIncidentListResource();
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
	
	protected final boolean hasAuthority(String authorityName) {
        boolean result = false;
        
        WebAdeAuthentication webAdeAuthentication = getWebAdeAuthentication();
        
        if (webAdeAuthentication != null) {
        	 for (GrantedAuthority grantedAuthority : webAdeAuthentication.getAuthorities()) {
                 String authority = grantedAuthority.getAuthority();
                 if (authority.equalsIgnoreCase(authorityName)) {
                     result = true;
                     break;
                 }
             }
        }

        return result;
    }
	
	protected static final WebAdeAuthentication getWebAdeAuthentication() {
		return (WebAdeAuthentication) SecurityContextHolder.getContext().getAuthentication();
	}
}