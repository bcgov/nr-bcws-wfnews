package ca.bc.gov.nrs.wfnews.api.rest.v1.resource.factory;

import ca.bc.gov.nrs.wfone.common.rest.endpoints.resource.factory.BaseResourceFactory;
import ca.bc.gov.nrs.wfone.common.service.api.model.factory.FactoryContext;
import ca.bc.gov.nrs.wfone.common.webade.authentication.WebAdeAuthentication;

import java.net.URI;

import javax.ws.rs.core.UriBuilder;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import ca.bc.gov.nrs.common.rest.resource.RelLink;
import ca.bc.gov.nrs.common.service.model.factory.FactoryException;
import ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.StatisticsEndpoint;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.StatisticsResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.types.ResourceTypes;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.StatisticsDto;
import ca.bc.gov.nrs.wfnews.service.api.v1.model.factory.StatisticsFactory;

public class StatisticsResourceFactory extends BaseResourceFactory implements StatisticsFactory {
  private static final Logger logger = LoggerFactory.getLogger(StatisticsResourceFactory.class);

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

  private static void setSelfLink(StatisticsResource resource, URI baseUri) {
		String selfUri = getStatisticsSelfUri("", baseUri);
		
		resource.getLinks().add(new RelLink(ResourceTypes.SELF, selfUri, "GET"));
	}

  private void setLinks(String guid, StatisticsResource resource, URI baseUri){
		// no links needed
	}

  public static String getStatisticsSelfUri(String unused, URI baseUri) {
		
		String result = UriBuilder.fromUri(baseUri)
		.path(StatisticsEndpoint.class)
		.build(unused).toString();
		
		return result;
	}

  @Override
  public StatisticsResource getStatistics(StatisticsDto dto, FactoryContext context) throws FactoryException {
    logger.debug("<getStatistics");
		URI baseUri = getBaseURI(context);

		StatisticsResource result = new StatisticsResource();
		populate(result, dto);

		String eTag = getEtag(result);
		result.setETag(eTag);

		setSelfLink(result, baseUri);

		setLinks("", result, baseUri);

		return result;
  }

  private void populate(StatisticsResource resource, StatisticsDto dto) {
    resource.setActiveBeingHeldFires(dto.getActiveBeingHeldFires());
    resource.setActiveBeingHeldFiresOfNote(dto.getActiveBeingHeldFiresOfNote());
    resource.setActiveHumanCausedFires(dto.getActiveHumanCausedFires());
    resource.setActiveNaturalCausedFires(dto.getActiveNaturalCausedFires());
    resource.setActiveOutOfControlFires(dto.getActiveOutOfControlFires());
    resource.setActiveOutOfControlFiresOfNote(dto.getActiveOutOfControlFiresOfNote());
    resource.setActiveUnderControlFires(dto.getActiveUnderControlFires());
    resource.setActiveUnderControlFiresOfNote(dto.getActiveUnderControlFiresOfNote());
    resource.setActiveUnknownCausedFires(dto.getActiveUnknownCausedFires());
    resource.setExtinguishedHumanCausedFires(dto.getExtinguishedHumanCausedFires());
    resource.setExtinguishedNaturalCausedFires(dto.getExtinguishedNaturalCausedFires());
    resource.setExtinguishedUnknownCausedFires(dto.getExtinguishedUnknownCausedFires());
		resource.setHectaresBurned(dto.getHectaresBurned());
		resource.setNewFires24Hours(dto.getNewFires24Hours());
		resource.setOutFires(dto.getOutFires());
    resource.setOutFires24Hours(dto.getOutFires24Hours());
    resource.setOutFires7Days(dto.getOutFires7Days());
  }
}
