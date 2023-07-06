package ca.bc.gov.mof.wfpointid.util;

public class TypeUtil {

	public static Integer toInteger(Object v) {
		if (v == null) return (Integer) v;
		if (v instanceof Integer) return (Integer) v;
		if (v instanceof Number) return Integer.valueOf(((Number) v).intValue());
		if (v instanceof String) {
			if (((String) v).isEmpty()) return null;
			try {
				int i = (int) Double.parseDouble((String) v);
				return Integer.valueOf(i);
			}
			catch (NumberFormatException e) {
				return null;
			}
		}

		return null;
	}

}
