package ca.bc.gov.mof.wfpointid.rest.client;

public class RestDAOException extends Exception {

	private static final long serialVersionUID = 1L;

	public RestDAOException(String message) {
		super(message);
	}

	public RestDAOException(String message, Throwable cause) {
		super(message, cause);
	}

	public RestDAOException(Throwable cause) {
		super(cause);
	}

}
