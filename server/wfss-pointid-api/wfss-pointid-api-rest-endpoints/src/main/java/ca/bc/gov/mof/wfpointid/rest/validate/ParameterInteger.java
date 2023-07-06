package ca.bc.gov.mof.wfpointid.rest.validate;

public class ParameterInteger {

	private String name;
	private long val;

	public ParameterInteger(String name, String value) throws ParameterException {
		this.name = name;
		this.val = parse(value);
	}
	
	public long parse(String value) throws ParameterException {
		try {
			long v = Long.parseLong(value);
			return v;
		}
		catch (NumberFormatException e) {
			throw new ParameterException(name,"Invalid number");
		}
	}

	public ParameterInteger checkRange(int min, int max) throws ParameterException {
		if (val < min || val > max) {
			throw new ParameterException(name, "is not in range [ " + min + " , " + max + " ]");
		}
		return this;
	}
	
	public long get() {
		return val;
	}

}
