package ca.bc.gov.mof.wfpointid.rest.client;

import java.io.Serial;

public class UnauthorizedException extends ClientErrorException {

	@Serial
	private static final long serialVersionUID = 1L;

	public UnauthorizedException(String message) {
		super(401, message);
	}

}
