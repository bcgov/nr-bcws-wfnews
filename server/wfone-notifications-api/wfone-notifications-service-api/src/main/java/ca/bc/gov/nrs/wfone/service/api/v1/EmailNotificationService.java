package ca.bc.gov.nrs.wfone.service.api.v1;

import javax.mail.MessagingException;

import ca.bc.gov.nrs.wfone.service.api.model.RoFRetryInfo;

import java.io.UnsupportedEncodingException;
import java.util.List;

public interface EmailNotificationService {

	public void sendErrorMessage(String message, Exception e) throws UnsupportedEncodingException, MessagingException;
	
	public void sendErrorMessage(String message, Exception e, boolean overrideFrequencyLimit)
			throws UnsupportedEncodingException, MessagingException;

	/**
	 * Send notification emails for a failed RoF submission
	 */
	void sendRoFsStuckMessage(String serializedRof, String rofGuid, Exception ex, String failedPushAction)
			throws UnsupportedEncodingException, MessagingException;
	
	/**
	 * Send periodic notification emails when there are RoFs stuck due to failed submissions 
	 */
	void sendServiceDegradedMessage( List<RoFRetryInfo> stuckRequests, String lastFailure)
			throws UnsupportedEncodingException, MessagingException;

	/**
	 * Send notification emails when the queue of RoFs is no longer stuck.
	 */
	void sendServiceRestoredMessage() throws UnsupportedEncodingException, MessagingException;

}
