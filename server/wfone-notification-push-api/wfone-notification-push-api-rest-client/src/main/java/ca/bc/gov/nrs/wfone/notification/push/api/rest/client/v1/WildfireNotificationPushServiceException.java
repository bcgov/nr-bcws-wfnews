package ca.bc.gov.nrs.wfone.notification.push.api.rest.client.v1;

public class WildfireNotificationPushServiceException extends Exception {

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
