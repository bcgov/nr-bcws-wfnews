package ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.impl;

import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import ca.bc.gov.nrs.common.service.ConflictException;
import ca.bc.gov.nrs.common.service.ForbiddenException;
import ca.bc.gov.nrs.common.service.NotFoundException;
import ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.MailEndpoint;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.MailResource;
import ca.bc.gov.nrs.wfnews.service.api.v1.EmailNotificationService;
import ca.bc.gov.nrs.wfone.common.rest.endpoints.BaseEndpointsImpl;

/**
 * Mail Endpoint implementation
 */
public class MailEndpointImpl extends BaseEndpointsImpl implements MailEndpoint {
  private static final Logger logger = LoggerFactory.getLogger(MailEndpointImpl.class);

  @Autowired
	private EmailNotificationService emailNotificationService;

  /**
   * sendMail endpoint handler will forward the mail resource to the emailNotificationService.
   * Response will be a basic 200 for success, and 503 on failures, as our failure condition
   * is basically "Is AWS-SNS there or not". On a throwable we'll return a 500.
   */
  @Override
  public Response sendMail(MailResource mail) throws NotFoundException, ForbiddenException, ConflictException {
    logger.debug(" >> sendMail");
    logger.debug("    Name: {}", mail.getName());
    logger.debug("    Subject: {}", mail.getSubject());
    logger.debug("    Address: {}", mail.getEmailAddress());
    try {
      return emailNotificationService.sendMessage(mail)
             ? Response.status(Status.OK).build()
             : Response.status(Status.SERVICE_UNAVAILABLE).build();
    } catch(Throwable t) {
      return getInternalServerErrorResponse(t);
    } finally {
      logger.debug(" << sendMail");
    }
  }
}
