package ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.impl;

import java.net.URI;
import java.util.List;
import java.util.Properties;

import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.EntityTag;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.ResponseBuilder;
import jakarta.ws.rs.core.Response.Status;
import jakarta.ws.rs.core.SecurityContext;
import jakarta.ws.rs.core.UriInfo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import ca.bc.gov.nrs.common.rest.resource.Messages;
import ca.bc.gov.nrs.wfone.common.webade.authentication.WebAdeAuthentication;
import ca.bc.gov.nrs.wfone.common.service.api.model.factory.FactoryContext;

public abstract class WfNewsBaseEndpointsImpl {

	private static final Logger logger = LoggerFactory.getLogger(WfNewsBaseEndpointsImpl.class);

	@Context
	protected UriInfo uriInfo;

	@Context
	protected SecurityContext securityContext;

	protected URI getBaseUri() {
		return uriInfo != null ? uriInfo.getBaseUri() : null;
	}

	protected void logRequest() {
		logger.debug("logRequest");
	}

	protected boolean hasAuthority(String scope) {
		if (securityContext != null) {
			return securityContext.isUserInRole(scope);
		}
		return true;
	}

	protected WebAdeAuthentication getWebAdeAuthentication() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth instanceof WebAdeAuthentication webAdeAuth) {
			return webAdeAuth;
		}
		return null;
	}

	protected FactoryContext getFactoryContext() {
		return new FactoryContext() {};
	}

	protected Response getInternalServerErrorResponse(Throwable t) {
		logger.error(t.getMessage(), t);
		Messages messages = new Messages();
		return Response.status(Status.INTERNAL_SERVER_ERROR).build();
	}

	protected void logResponse(Response response) {
		if (response != null) {
			logger.debug("response status = " + response.getStatus());
		}
	}

	protected ResponseBuilder evaluatePreconditions(EntityTag etag) {
		return null;
	}

	protected Boolean toBoolean(String s) {
		return s != null ? Boolean.valueOf(s) : null;
	}

	protected Integer toInteger(String s) {
		if (s == null || s.trim().isEmpty()) return null;
		try {
			return Integer.valueOf(s.trim());
		} catch (NumberFormatException e) {
			return null;
		}
	}

	protected String[] toStringArray(List<String> list) {
		return list != null ? list.toArray(new String[0]) : null;
	}

	protected String[] toStringArray(String s) {
		return s != null ? s.split(",") : null;
	}

	protected String getEtag(Object resource) {
		return null;
	}

	protected Properties getApplicationProperties() {
		return new Properties();
	}
}
