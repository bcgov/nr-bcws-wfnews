package ca.bc.gov.mof.wfpointid.rest.client;

import java.io.Serial;

public class ForbiddenException extends ClientErrorException {

	@Serial
	private static final long serialVersionUID = 1L;

	public ForbiddenException(String message) {
		super(403, message);
	}

}
