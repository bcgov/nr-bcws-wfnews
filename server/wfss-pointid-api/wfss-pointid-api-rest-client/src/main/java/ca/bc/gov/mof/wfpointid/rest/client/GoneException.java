package ca.bc.gov.mof.wfpointid.rest.client;

import java.io.Serial;

public class GoneException extends ClientErrorException {

	@Serial
	private static final long serialVersionUID = 1L;

	public GoneException(String message) {
		super(410, message);
	}

}
