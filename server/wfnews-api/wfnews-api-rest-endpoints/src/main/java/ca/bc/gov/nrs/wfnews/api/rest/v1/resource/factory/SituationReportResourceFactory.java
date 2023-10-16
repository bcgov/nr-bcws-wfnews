package ca.bc.gov.nrs.wfnews.api.rest.v1.resource.factory;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.core.UriBuilder;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import ca.bc.gov.nrs.common.service.model.factory.FactoryException;
import ca.bc.gov.nrs.common.wfone.rest.resource.RelLink;
import ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.SituationReportEndpoint;
import ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.security.Scopes;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.SituationReportListResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.SituationReportResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.types.ResourceTypes;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.PagedDtos;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.SituationReportDto;
import ca.bc.gov.nrs.wfnews.service.api.v1.model.factory.SituationReportFactory;
import ca.bc.gov.nrs.wfone.common.rest.endpoints.resource.factory.BaseResourceFactory;
import ca.bc.gov.nrs.wfone.common.service.api.model.factory.FactoryContext;
import ca.bc.gov.nrs.wfone.common.webade.authentication.WebAdeAuthentication;

public class SituationReportResourceFactory extends BaseResourceFactory implements SituationReportFactory {
    private static final Logger logger = LoggerFactory.getLogger(SituationReportResourceFactory.class);

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

  private static void setSelfLink(SituationReportResource resource, URI baseUri) {
		String selfUri = getSituationReportSelfUri(resource.getReportGuid(), baseUri);
		
		resource.getLinks().add(new RelLink(ResourceTypes.SELF, selfUri, "GET"));
	}

  private void setLinks(String reportGuid, SituationReportResource resource, URI baseUri){
		
		if (hasAuthority(Scopes.CREATE_PUBLISHED_INCIDENT)) {

				String result = UriBuilder
						.fromUri(baseUri)
						.path(SituationReportEndpoint.class)
						.build(reportGuid).toString();
				resource.getLinks().add(new RelLink(ResourceTypes.CREATE_SITUATION_REPORT, result, "POST"));
		}
		
		if (hasAuthority(Scopes.UPDATE_PUBLISHED_INCIDENT)) {

				String result = UriBuilder
						.fromUri(baseUri)
						.path(SituationReportEndpoint.class)
						.build(reportGuid).toString();
				resource.getLinks().add(new RelLink(ResourceTypes.UPDATE_SITUATION_REPORT, result, "PUT"));
		}

		if (hasAuthority(Scopes.DELETE_PUBLISHED_INCIDENT)) {

			String result = UriBuilder
					.fromUri(baseUri)
					.path(SituationReportEndpoint.class)
					.build(reportGuid).toString();
			resource.getLinks().add(new RelLink(ResourceTypes.DELETE_SITUATION_REPORT, result, "DELETE"));
		}
	}

  public static String getSituationReportSelfUri(String reportGuid, URI baseUri) {
		
		String result = UriBuilder.fromUri(baseUri)
		.path(SituationReportEndpoint.class)
		.build(reportGuid).toString();
		
		return result;
	}

  @Override
  public SituationReportResource getSituationReport(SituationReportDto dto, FactoryContext context) throws FactoryException {
    logger.debug("<getSituationReport");
		URI baseUri = getBaseURI(context);

		SituationReportResource result = new SituationReportResource();
		populate(result, dto);

		String eTag = getEtag(result);
		result.setETag(eTag);

		setSelfLink(result, baseUri);

		setLinks(dto.getReportGuid(), result, baseUri);

		return result;
  }

  private void populate(SituationReportResource resource, SituationReportDto dto) {
    resource.setReportGuid(dto.getReportGuid());
    resource.setIncidentTeamCount(dto.getIncidentTeamCount());
    resource.setCrewCount(dto.getCrewCount());
    resource.setAviationCount(dto.getAviationCount());
    resource.setHeavyEquipmentCount(dto.getHeavyEquipmentCount());
    resource.setStructureProtectionCount(dto.getStructureProtectionCount());
    resource.setSituationOverview(dto.getSituationOverview());
    resource.setSituationReportDate(dto.getSituationReportDate());
    resource.setPublishedInd(dto.getPublishedInd());
    resource.setArchivedInd(dto.getArchivedInd());
    resource.setCreatedTimestamp(dto.getCreatedTimestamp());
    resource.setCreateDate(dto.getCreateDate());
		resource.setCreateUser(dto.getCreateUser());
		resource.setUpdateDate(dto.getUpdateDate());
		resource.setUpdateUser(dto.getUpdateUser());
  }

  @Override
  public SituationReportListResource getSituationReportList(PagedDtos<SituationReportDto> reportList, Integer pageNumber, Integer pageRowCount, FactoryContext factoryContext) throws FactoryException {
    SituationReportListResource result = null;
    URI baseUri = getBaseURI(factoryContext);

    List<SituationReportResource> resources = new ArrayList<>();
    for (SituationReportDto dto : reportList.getResults()) {
      SituationReportResource resource = new SituationReportResource();
      populate(resource, dto);
      setLinks(resource.getReportGuid(), resource, baseUri);
      setSelfLink(resource, baseUri);
      resources.add(resource);
    }
    
    result = new SituationReportListResource();
    result.setCollection(resources);
    result.setTotalRowCount(reportList.getTotalRowCount());
    
    if (pageNumber != null && pageRowCount != null) {
      int totalPageCount = (int) Math.ceil(((double)reportList.getTotalRowCount()) / ((double)pageRowCount));
      result.setPageNumber(pageNumber);
      result.setPageRowCount(pageRowCount);
      result.setTotalPageCount(totalPageCount);
    }	

    String eTag = getEtag(result);
    result.setETag(eTag);
    
    return result;
  }
}
