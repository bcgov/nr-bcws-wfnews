package ca.bc.gov.nrs.wfnews.service.api.v1;

import javax.mail.MessagingException;
import java.io.UnsupportedEncodingException;
import java.util.List;

public interface EmailNotificationService {

    public void sendErrorMessage(String message, Exception e) throws UnsupportedEncodingException, MessagingException;

//    public void sendErrorMessage(List<String> messages, Exception e) throws MessagingException, UnsupportedEncodingException;
    
    public void sendErrorMessage(String message, Exception e, boolean overrideFrequencyLimit) throws UnsupportedEncodingException, MessagingException;

}
