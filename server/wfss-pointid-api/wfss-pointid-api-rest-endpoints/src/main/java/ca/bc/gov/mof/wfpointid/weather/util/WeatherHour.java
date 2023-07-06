package ca.bc.gov.mof.wfpointid.weather.util;

import java.util.Calendar;
import java.util.TimeZone;

/**
 * Functions for working wth Wildfire Weather database hourstamps.
 * 
 * Hourstamps have the following specification:
 * <u>
 * <li>the format is YYYYMMDDHH
 * <li>HH has the range 01 to 24, where 01 is 00:00 (AM) to 00:59 (AM) and 24 is 23:00 to 23:59 
 * <li>They are always in Pacific Standard Time (PST)
 * </ul>
 * 
 * @author mbdavis
 *
 */
public class WeatherHour {
	
	public static String REGEX_HOUR = "\\d\\d\\d\\d\\d\\d\\d\\d\\d\\d";
	
	/**
	 * Do time calculation in GMT to avoid Daylight Savings Time issues
	 */
	private static TimeZone TZ_GMT = TimeZone.getTimeZone("GMT");
	
	/**
	 * This avoids a bug in Java where PST still uses Daylight Savings.
	 * 
	 */
	public static final TimeZone TZ_PST = TimeZone.getTimeZone("GMT-8");

	private static int MILLIS_PER_HOUR = 3600000;
	
	public static boolean isValid(String hour) {
		if (hour == null) return false;
		if (! hour.matches(REGEX_HOUR)) return false;
		if (null == fromHourstamp(hour)) return false;
		return true;
	}
	
	public static String now() {
		Calendar cal = Calendar.getInstance(TZ_PST);
		return toHourstamp(cal);
	}
	
	public static String addHours(String hourstamp, int hours) {
		Calendar cal = fromHourstamp(hourstamp);
		cal.add(Calendar.HOUR, hours);
		return toHourstamp(cal);
	}

	/**
	 * Compute difference of hrStamp1 - hrStamp2 in hours.
	 * 
	 * @param hrstamp1
	 * @param hrstamp2
	 * @return difference of hrStamp1 - hrStamp2 in hours
	 */
	public static int diffHours(String hrstamp1, String hrstamp2) {
		long t1 = fromHourstamp(hrstamp1).getTimeInMillis();
		long t2 = fromHourstamp(hrstamp2).getTimeInMillis();
		long diff = t1 - t2;
		/**
		 * It can happen that the difference is not exactly a multiple of hours.
		 * E.g. 2017040201 - 2017040115
		 * So add a buffer amount to ensure value is rounded correctly
		 */
		long diffBuf = diff < 0 ? diff - MILLIS_PER_HOUR/2 : diff + MILLIS_PER_HOUR/2;
		long hrs = diffBuf / MILLIS_PER_HOUR;
		return (int) hrs;
	}
	
	/**
	 * 
	 * @param hourstamp
	 * @return the Calendar for the hour
	 * @return null if the hour is invalid (e.g. has values out of range)
	 */
	private static Calendar fromHourstamp(String hourstamp) {
		return fromHourstamp(hourstamp, TZ_GMT);
	}

	static Calendar fromHourstamp(String hourstamp, TimeZone zone) {
		String yrStr = hourstamp.substring(0, 4);
		int yr = Integer.parseInt(yrStr);
		String moStr = hourstamp.substring(4, 6);
		int mo = Integer.parseInt(moStr);
		if (mo < 1 ||mo > 12) return null;
		String dayStr = hourstamp.substring(6, 8);
		int day = Integer.parseInt(dayStr);
		if (day < 1 ||day > 31) return null;
		String hrStr = hourstamp.substring(8, 10);
		int hr = Integer.parseInt(hrStr);
		if (hr < 1 || hr > 24) return null;
		
		Calendar cal = Calendar.getInstance(zone);
		cal.clear();
		cal.set(yr, mo-1, day, hr-1, 0);
		
		return cal;
	}
	
	private static String toHourstamp(Calendar cal) {
		return String.format("%4d%02d%02d%02d",
				Integer.valueOf(cal.get(Calendar.YEAR)),
				Integer.valueOf(cal.get(Calendar.MONTH)+1),
				Integer.valueOf(cal.get(Calendar.DAY_OF_MONTH)),
				Integer.valueOf(cal.get(Calendar.HOUR_OF_DAY)+1)
				);
	}

	public static String toDay(String hourstamp) {
		if (hourstamp == null) return null;
		return hourstamp.substring(0, 8);
	}

	public static String fromMillis(long millis) {
		Calendar cal = Calendar.getInstance(TZ_PST);
		cal.setTimeInMillis(millis-1); // -1 ensures that if the time is exactly on the hour it will be included in its own stamp.
		return toHourstamp(cal);
	}
	
	private static long toMillis(String hourstamp) {
		Calendar cal = fromHourstamp(hourstamp, TZ_PST);
		return cal.getTimeInMillis();
	}
	
	/**
	 * Milliseconds since epoch of the start of the hour
	 * @param hourstamp
	 * @return
	 */
	public static long toMillisStart(String hourstamp) {
		return toMillis(hourstamp);
	}
	
	/**
	 * Milliseconds since epoch of the end of the hour
	 * @param hourstamp
	 * @return
	 */
	public static long toMillisEnd(String hourstamp) {
		return toMillis(WeatherHour.addHours(hourstamp,1));		
	}
	
	/**
	 * Returns a time time range of the specified duration ending at the given time stamp.
	 * @param hourstamp
	 * @param duration
	 * @return
	 */
	public static TimeRange range(String hourstamp, int duration) {
		
		long milliEnd = WeatherHour.toMillisEnd(hourstamp);
		String startHourstamp = WeatherHour.addHours(hourstamp, -1*(duration-1));
		long milliStart = WeatherHour.toMillisStart(startHourstamp);

		return new TimeRange(startHourstamp, hourstamp, milliStart, milliEnd, duration);
		
	}
	
}
