package ca.bc.gov.mof.wfpointid.util;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class RegExUtil {
	/**
	 * Extracts the string or group matched by a regex.
	 * 
	 * @param s string to search
	 * @param regex pattern to match
	 * @return the value of the first match group, or the entire string if no groups
	 * @return null if no match is found
	 */
	public static String extract(String s, String regex) {
		if (s == null)
			return null;

		Pattern pat = Pattern.compile(regex);
		Matcher mat = pat.matcher(s);
		boolean isMatched = mat.find();
		if (! isMatched)
			return "";
		// if no groups, just return entire string
		if (mat.groupCount() <= 0)
			return mat.group(0);
		return mat.group(1);
	  }
}
