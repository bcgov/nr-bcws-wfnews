package ca.bc.gov.mof.wfpointid.rest.validate;

@SuppressWarnings("serial")
public class ParameterException extends Exception {

	public ParameterException(String name, String msg) {
		super(format(name, msg));
	}

	private static String format(String name, String msg) {
		String errMsg = String.format("Parameter %s : %s", name, msg);
		return errMsg;
	}


}
