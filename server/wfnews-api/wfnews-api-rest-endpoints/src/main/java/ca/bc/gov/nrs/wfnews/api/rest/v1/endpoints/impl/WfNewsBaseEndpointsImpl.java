package ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.impl;

import jakarta.ws.rs.core.EntityTag;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.ResponseBuilder;
import jakarta.ws.rs.core.Response.Status;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.nrs.wfone.common.rest.endpoints.BaseEndpointsImpl;

public abstract class WfNewsBaseEndpointsImpl extends BaseEndpointsImpl {

	private static final Logger logger = LoggerFactory.getLogger(WfNewsBaseEndpointsImpl.class);

	// Keep 500 bodies empty. The wfone default returns the exception message
	// and the cause class name to the caller.
	@Override
	protected Response getInternalServerErrorResponse(Throwable t) {
		logger.error(t.getMessage(), t);
		return Response.status(Status.INTERNAL_SERVER_ERROR).build();
	}

	// Make If-Match optional. The wfone version parses the header unguarded,
	// so a caller that omits it gets a 500 instead of an update.
	@Override
	protected ResponseBuilder evaluatePreconditions(EntityTag etag) {
		if (getIfMatchHeader() == null) {
			return null;
		}
		return super.evaluatePreconditions(etag);
	}
}
