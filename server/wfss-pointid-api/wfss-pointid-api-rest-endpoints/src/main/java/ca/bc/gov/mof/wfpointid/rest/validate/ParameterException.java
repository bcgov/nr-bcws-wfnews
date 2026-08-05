package ca.bc.gov.mof.wfpointid.rest.validate;

@SuppressWarnings("serial")
public class ParameterException extends Exception {

	public ParameterException(String name, String msg) {
		super(format(name, msg));
	}

	private static String format(String name, String msg) {
		String errMsg = "Parameter %s : %s".formatted(name, msg);
		return errMsg;
	}


}
