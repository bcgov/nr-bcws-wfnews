package ca.bc.gov.mof.wfpointid.rest.client;

public class ForbiddenException extends ClientErrorException {

	private static final long serialVersionUID = 1L;

	public ForbiddenException(String message) {
		super(403, message);
	}

}
