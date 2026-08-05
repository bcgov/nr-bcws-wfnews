package ca.bc.gov.mof.wfpointid.rest.client.v1;

import java.io.Serial;

public class WildfireNewsServiceException extends Exception {

	@Serial
	private static final long serialVersionUID = 1L;
	
	public WildfireNewsServiceException(String message) {
		super(message);
	}

	public WildfireNewsServiceException(Throwable cause) {
		super(cause);
	}

	public WildfireNewsServiceException(String message, Throwable cause) {
		super(message, cause);
	}

}
