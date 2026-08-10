package ca.bc.gov.nrs.wfone.api.rest.client.v1;

import java.io.Serial;

public class WildfireResourceServiceException extends Exception {

	@Serial
	private static final long serialVersionUID = 1L;
	
	public WildfireResourceServiceException(String message) {
		super(message);
	}

	public WildfireResourceServiceException(Throwable cause) {
		super(cause);
	}

	public WildfireResourceServiceException(String message, Throwable cause) {
		super(message, cause);
	}

}
