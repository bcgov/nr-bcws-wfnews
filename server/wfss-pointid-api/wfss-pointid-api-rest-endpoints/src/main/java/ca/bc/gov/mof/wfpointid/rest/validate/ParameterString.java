package ca.bc.gov.mof.wfpointid.rest.validate;

public class ParameterString {
	private String name;
	private String val;

	public ParameterString(String name, String value) {
		this.name = name;
		this.val = value;
	}
	
	public ParameterString checkMatches(String regex) throws ParameterException {
		// must explicitly check for null
		if (val == null) return this;
		
		if (! val.matches(regex)) {
			throw new ParameterException(name, "invalid format");
		}
		return this;
	}

	public ParameterString checkValid(boolean valid) throws ParameterException {
		if (! valid) {
			throw new ParameterException(name, "invalid value");
		}
		return this;
	}
}
