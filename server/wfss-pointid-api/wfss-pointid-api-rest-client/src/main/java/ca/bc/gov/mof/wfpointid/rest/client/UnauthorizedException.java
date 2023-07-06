package ca.bc.gov.mof.wfpointid.rest.client;

public class UnauthorizedException extends ClientErrorException {

	private static final long serialVersionUID = 1L;

	public UnauthorizedException(String message) {
		super(401, message);
	}

}
