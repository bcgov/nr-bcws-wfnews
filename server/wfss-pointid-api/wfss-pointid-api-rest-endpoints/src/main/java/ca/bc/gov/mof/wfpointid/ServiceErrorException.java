package ca.bc.gov.mof.wfpointid;


@SuppressWarnings("serial")
public class ServiceErrorException extends Exception {
	
	public ServiceErrorException(Throwable ex) {
		super(ex);
	}
	public ServiceErrorException(String msg, Throwable ex) {
		super(msg, ex);
	}
	public ServiceErrorException(String msg) {
		super(msg);
	}
}
