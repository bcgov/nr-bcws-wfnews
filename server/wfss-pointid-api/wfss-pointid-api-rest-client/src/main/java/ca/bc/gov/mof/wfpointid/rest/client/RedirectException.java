package ca.bc.gov.mof.wfpointid.rest.client;

public class RedirectException extends RestDAOException {

	private static final long serialVersionUID = 1L;

	private int code;
	
	private String location;
	
	public RedirectException(int code,  String message, String location) {
		super(message);
		this.code = code;
		this.location = location;
	}

	public int getCode() {
		return code;
	}

	public String getLocation() {
		return location;
	}

}
