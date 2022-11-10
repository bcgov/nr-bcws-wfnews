package ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.impl;

import javax.ws.rs.core.Response;

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

public class MailEndpointImpl extends BaseEndpointsImpl implements MailEndpoint {
  private static final Logger logger = LoggerFactory.getLogger(MailEndpointImpl.class);

  @Autowired
	private EmailNotificationService emailNotificationService;

  @Override
  public Response sendMail(MailResource mail) throws NotFoundException, ForbiddenException, ConflictException {
    logger.debug(" >> sendMail");
    logger.debug("    Name: {}", mail.getName());
    logger.debug("    Subject: {}", mail.getSubject());
    logger.debug("    Address: {}", mail.getEmailAddress());
    try {
      if (emailNotificationService.sendMessage(mail)) {
        return Response.ok("{ messageStatus: 'SENT', response: 'Your information request has been successfully delivered.' }").build();
      } else {
        return Response.ok("{ messageStatus: 'UNSENT', response: 'Your information request could not be sent at this time' }").build();
      }
    } catch(Throwable t) {
      return getInternalServerErrorResponse(t);
    } finally {
      logger.debug(" << sendMail");
    }
  }
}
