package ca.bc.gov.mof.wfpointid.rest.client;

import java.io.Serial;

public class ClientErrorException extends RestDAOException {

	@Serial
	private static final long serialVersionUID = 1L;

	private int code;
	
	public ClientErrorException(int code, String message) {
		super(message);
	}

	public int getCode() {
		return code;
	}

}
