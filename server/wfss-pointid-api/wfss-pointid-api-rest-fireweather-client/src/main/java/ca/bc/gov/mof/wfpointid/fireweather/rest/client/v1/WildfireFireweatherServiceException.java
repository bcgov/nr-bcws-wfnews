package ca.bc.gov.mof.wfpointid.fireweather.rest.client.v1;

public class WildfireFireweatherServiceException extends Exception {

	private static final long serialVersionUID = 1L;
	
	public WildfireFireweatherServiceException(String message) {
		super(message);
	}

	public WildfireFireweatherServiceException(Throwable cause) {
		super(cause);
	}

	public WildfireFireweatherServiceException(String message, Throwable cause) {
		super(message, cause);
	}

}
