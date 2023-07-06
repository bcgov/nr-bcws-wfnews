package ca.bc.gov.mof.wfpointid.rest.client;

public class ClientErrorException extends RestDAOException {

	private static final long serialVersionUID = 1L;

	private int code;
	
	public ClientErrorException(int code, String message) {
		super(message);
	}

	public int getCode() {
		return code;
	}

}
