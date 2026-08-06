package ca.bc.gov.mof.wfpointid.rest.client;

import java.io.Serial;

public class ConflictException extends ClientErrorException {

	@Serial
	private static final long serialVersionUID = 1L;

	public ConflictException(String message) {
		super(409, message);
	}

}
