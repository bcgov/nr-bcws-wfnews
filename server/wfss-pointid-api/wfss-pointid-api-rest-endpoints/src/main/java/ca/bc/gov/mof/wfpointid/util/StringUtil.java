package ca.bc.gov.mof.wfpointid.util;

public class StringUtil {
	/**
	 * Null-safe version of equalsIgnoreCase
	 * 
	 * @param s1
	 * @param s2
	 * @return
	 */
	public static boolean equalsIgnoreCase(String s1, String s2) {
		if (s1 == null) {
			return s2 == null;
		}
		return s1.equalsIgnoreCase(s2);
	}

	public static String toStringNoNull(Object value) {
		if (value == null) return "";
		return value.toString();
	}

	public static boolean equalsIgnoreCase(String s, String[] values) {
		for (int i = 0; i < values.length; i++) {
			if (equalsIgnoreCase(s, values[i])) return true;
		}
		return false;
	}

	public static boolean isEmpty(String s) {
		if (s == null) return true;
		return s.isEmpty();
	}
}
