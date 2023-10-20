package ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.impl;

import java.net.URI;

import javax.ws.rs.GET;
import javax.ws.rs.HttpMethod;
import javax.ws.rs.Produces;
import javax.ws.rs.core.GenericEntity;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.nrs.common.wfone.rest.resource.RelLink;
import ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.TopLevelEndpoints;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.EndpointsRsrc;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.factory.ExternalUriResourceFactory;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.factory.PublishedIncidentResourceFactory;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.factory.SituationReportResourceFactory;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.factory.StatisticsResourceFactory;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.types.ResourceTypes;
import ca.bc.gov.nrs.wfone.common.rest.endpoints.BaseEndpointsImpl;

public class TopLevelEndpointsImpl extends BaseEndpointsImpl implements TopLevelEndpoints {
	/** Logger. */
	private static final Logger logger = LoggerFactory.getLogger(TopLevelEndpointsImpl.class);
	
	@Override
	@GET
	@Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
	public Response getTopLevel() {
		Response response = null;

		URI baseUri = this.getBaseUri();
		
		EndpointsRsrc result = new EndpointsRsrc();

		result.setReleaseVersion(this.getApplicationProperties().getProperty("application.version"));
		
		{
			String selfURI = PublishedIncidentResourceFactory.getPublishedIncidentSelfUri(null, baseUri);
			result.getLinks().add(new RelLink(ResourceTypes.PUBLISHED_INCIDENT_LIST, selfURI, HttpMethod.GET));
		}
		
		{
			String selfURI = ExternalUriResourceFactory.getExternalUriSelfUri(null, baseUri);
			result.getLinks().add(new RelLink(ResourceTypes.EXTERNAL_URI_LIST, selfURI, HttpMethod.GET));
		}

		{
			String selfURI = SituationReportResourceFactory.getSituationReportSelfUri(null, baseUri);
			result.getLinks().add(new RelLink(ResourceTypes.SITUATION_REPORT_LIST, selfURI, HttpMethod.GET));
		}

		{
			String selfURI = StatisticsResourceFactory.getStatisticsSelfUri(null, baseUri);
			result.getLinks().add(new RelLink(ResourceTypes.STATISTICS, selfURI, HttpMethod.GET));
		}
		
		try {
			result.setETag(getEtag(result));

			GenericEntity<EndpointsRsrc> entity = new GenericEntity<EndpointsRsrc>(result) {
				/* do nothing */
			};

			response = Response.ok(entity).tag(result.getUnquotedETag()).build();
			
		} catch (Throwable t) {
			response = getInternalServerErrorResponse(t);
		}

		if (logger.isDebugEnabled()) {
			logger.debug("getTopLevel=" + response);
		}
		
		return response;
	}
}
