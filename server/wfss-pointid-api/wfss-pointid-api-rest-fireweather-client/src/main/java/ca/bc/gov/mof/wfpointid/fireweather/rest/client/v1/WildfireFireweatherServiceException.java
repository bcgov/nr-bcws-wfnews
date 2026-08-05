package ca.bc.gov.mof.wfpointid.fireweather.rest.client.v1;

import java.io.Serial;

public class WildfireFireweatherServiceException extends Exception {

	@Serial
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
