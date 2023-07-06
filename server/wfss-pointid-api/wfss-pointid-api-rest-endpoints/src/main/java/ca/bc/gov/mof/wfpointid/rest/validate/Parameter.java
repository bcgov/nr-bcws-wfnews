package ca.bc.gov.mof.wfpointid.rest.validate;

public class Parameter {
	
	public static ParameterNumber number(String name, String val) throws ParameterException {
		return new ParameterNumber(name, val);
	}
	
	public static ParameterInteger integer(String name, String val) throws ParameterException {
		return new ParameterInteger(name, val);
	}
	
	public static ParameterString string(String name, String val) {
		return new ParameterString(name, val);
	}
	
	public static ParameterDuration duration(String name, String val) {
		return new ParameterDuration(name, val);
	}
}
