package ca.bc.gov.mof.wfpointid.util;

public class MathUtil {
	
	/**
	 * Rounds a {@link Double} to one decimal place.
	 * Handles null input.
	 * 
	 * @param d
	 * @return
	 * @return null if input is null
	 */
	public static Double round1(Double d) {
		if (d == null) return d;
		double dr = Math.round(d.doubleValue()*10)/10.0d;
		return Double.valueOf(dr);
	}
}
