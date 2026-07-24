package ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.endpoints.impl;

import java.net.URI;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.HttpMethod;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.GenericEntity;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.nrs.common.wfone.rest.resource.RelLink;
import ca.bc.gov.nrs.wfone.common.rest.endpoints.BaseEndpointsImpl;
import ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.endpoints.TopLevelEndpoints;
import ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.resource.EndpointsRsrc;
import ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.resource.factory.PushNotificationRsrcFactory;
import ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.resource.types.ResourceTypes;

public class TopLevelEndpointsImpl extends WfOneNotificationPushBaseEndpointsImpl implements TopLevelEndpoints {
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

		try {
			
			{
				String selfURI = PushNotificationRsrcFactory.getPushNearMeNotificationsUri(baseUri);
				result.getLinks().add(new RelLink(ResourceTypes.PUSH_NEAR_ME_NOTIFICATIONS, selfURI, HttpMethod.POST));
			}
			
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
