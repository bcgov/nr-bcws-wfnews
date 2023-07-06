package ca.bc.gov.mof.wfpointid.util;

public class UrlTemplate {
	
	private String output;

	public UrlTemplate(String template) {
		this.output = template;
	}
	
	public void setParam(String name, String value) {
		if (value == null) value = "";
		output = output.replaceAll("\\{\\{" + name + "\\}\\}", value );
	}
	
	public void setParam(String name, Double value) {
		String valStr = "";
		if (value != null) {
			valStr = value.toString();
		}
		setParam(name, valStr);
	}
	
	public String getValue() {
		return output;
	}
}