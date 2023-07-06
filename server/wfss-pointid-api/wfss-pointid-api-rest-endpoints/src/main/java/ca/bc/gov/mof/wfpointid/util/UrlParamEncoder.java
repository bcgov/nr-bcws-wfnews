package ca.bc.gov.mof.wfpointid.util;

public class UrlParamEncoder {

	private static final String UNSAFE_CHARS = " %$&+,/:;=?@<>#%'";

	private static boolean isUnsafe(char ch) {
		if (ch > 128 || ch < 0)
			return true;
		return UNSAFE_CHARS.indexOf(ch) >= 0;
	}

	public static String encode(String input) {
		StringBuilder resultStr = new StringBuilder();
		for (char ch : input.toCharArray()) {
			if (isUnsafe(ch)) {
				resultStr.append('%');
				resultStr.append(toHex(ch / 16));
				resultStr.append(toHex(ch % 16));
			} else {
				resultStr.append(ch);
			}
		}
		return resultStr.toString();
	}

	private static char toHex(int ch) {
		return (char) (ch < 10 ? '0' + ch : 'A' + ch - 10);
	}

	}