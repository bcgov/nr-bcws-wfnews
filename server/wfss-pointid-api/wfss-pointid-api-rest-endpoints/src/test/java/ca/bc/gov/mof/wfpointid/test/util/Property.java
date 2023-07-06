package ca.bc.gov.mof.wfpointid.test.util;

public class Property {
	
	public static Property[] create(Object... prop) {
		if (prop.length % 2 != 0) throw new IllegalArgumentException("Property list must have even number of entrries");
		int nProp = prop.length / 2;
		Property[] nv = new Property[nProp];
		for (int i = 0; i < nProp; i++) {
			nv[i] = new Property( (String) prop[2 * i], prop[2 * i + 1]);
		}
		return nv;
	}
	
	private String name;
	private Object value;

	public Property(String name, Object prop) {
		this.name = name;
		this.value = prop;
	}

	public String getName() {
		return name;
	}

	public Object getValue() {
		return value;
	}

	
}