package ca.bc.gov.mof.wfpointid.util;

public class TypeUtil {

	public static Integer toInteger(Object v) {
		if (v == null) return (Integer) v;
		if (v instanceof Integer integer) return integer;
		if (v instanceof Number number) return Integer.valueOf(number.intValue());
		if (v instanceof String string) {
			if (string.isEmpty()) return null;
			try {
				int i = (int) Double.parseDouble(string);
				return Integer.valueOf(i);
			}
			catch (NumberFormatException e) {
				return null;
			}
		}

		return null;
	}

}
