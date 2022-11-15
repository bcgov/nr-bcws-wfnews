package ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints;

import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import ca.bc.gov.nrs.common.rest.endpoints.BaseEndpoints;
import ca.bc.gov.nrs.common.service.ConflictException;
import ca.bc.gov.nrs.common.service.ForbiddenException;
import ca.bc.gov.nrs.common.service.NotFoundException;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.MailResource;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiParam;

/**
 * Mail Endpoint for sending information requests to SNS
 * This is a public resource, so no security check is needed
 * Mail resource will support XML or JSON
 */
@Api(value = "mail")
@Path("/mail")
public interface MailEndpoint extends BaseEndpoints {
  @POST
	@Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
	@Consumes({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
	public Response sendMail(@ApiParam(name = "mail", value = "The email details", required = true) MailResource mail) throws NotFoundException, ForbiddenException, ConflictException;
}
