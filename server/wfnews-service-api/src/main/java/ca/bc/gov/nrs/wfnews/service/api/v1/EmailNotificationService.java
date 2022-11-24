package ca.bc.gov.nrs.wfnews.service.api.v1;

import javax.mail.MessagingException;

import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.MailResource;

import java.io.UnsupportedEncodingException;
import java.util.List;

public interface EmailNotificationService {
    public void sendErrorMessage(String message, Exception e) throws UnsupportedEncodingException, MessagingException;
    public void sendErrorMessage(String message, Exception e, boolean overrideFrequencyLimit) throws UnsupportedEncodingException, MessagingException;
    public boolean sendMessage(MailResource mail);
}
