package ca.bc.gov.mof.wfpointid.rest.validate;

public class ParameterNumber {

	private String name;
	private double val;

	public ParameterNumber(String name, String value) throws ParameterException {
		this.name = name;
		this.val = parse(value);
	}
	
	public double parse(String value) throws ParameterException {
		try {
			double v = Double.parseDouble(value);
			return v;
		}
		catch (NumberFormatException e) {
			throw new ParameterException(name,"Invalid number");
		}
	}

	public ParameterNumber checkRange(int min, int max) throws ParameterException {
		if (val < min || val > max) {
			throw new ParameterException(name, "is not in range [ " + min + " , " + max + " ]");
		}
		return this;
	}

}
