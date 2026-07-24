package ca.bc.gov.nrs.wfone.notification.push.api.rest.client.v1;

import java.io.Serial;

public class WildfireNotificationPushServiceException extends Exception {

	@Serial
	private static final long serialVersionUID = 1L;
	
	public WildfireNotificationPushServiceException(String message) {
		super(message);
	}

	public WildfireNotificationPushServiceException(Throwable cause) {
		super(cause);
	}

	public WildfireNotificationPushServiceException(String message, Throwable cause) {
		super(message, cause);
	}

}
