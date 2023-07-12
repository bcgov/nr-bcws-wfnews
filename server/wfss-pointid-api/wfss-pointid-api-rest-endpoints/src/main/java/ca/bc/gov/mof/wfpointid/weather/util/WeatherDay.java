package ca.bc.gov.mof.wfpointid.weather.util;

import java.util.Calendar;
import java.util.TimeZone;

/**
 * Functions for working wth Wildfire Weather database daystamps.
 * 
 * Daystamps have the following specification:
 * <u>
 * <li>the format is YYYYMMDD
 * <li>They are always in Pacific Standard Time (PST)
 * </ul>
 * 
 * @author mbdavis
 *
 */
public class WeatherDay {
	
	private static final int HR_OF_DAY_NOON = 11;

	/**
	 * Do time calculation in GMT to avoid Daylight Savings Time issues
	 */
	static TimeZone TZ_GMT = TimeZone.getTimeZone("GMT");
	
	/**
	 * This avoids a bug in Java where PST still uses Daylight Savings.
	 * 
	 */
	static TimeZone TZ_PST = TimeZone.getTimeZone("GMT-8");

	/**
	 * Equal to 24 * 60 * 60 * 1000
	 */
	private static int MILLIS_PER_DAY = 86400000;
	
	public static String now() {
		Calendar cal = Calendar.getInstance(TZ_PST);
		return toDaystamp(cal);
	}
	
	/**
	 * Returns the current day if the time is noon or after, 
	 * otherwise returns the previous day.
	 * 
	 * @return the current or previous day
	 */
	public static String nowNoonRollover() {
		Calendar cal = Calendar.getInstance(TZ_PST);
		return noonRollover(cal);
	}
	

	public static String noonRollover(String hourstamp) {
		Calendar cal = WeatherHour.fromHourstamp(hourstamp, TZ_PST);
		return noonRollover(cal);
	}
	
	/**
	 * Returns the current day if the time is noon or after, 
	 * otherwise returns the previous day.
	 * 
	 * @param cal
	 * @return the current or previous day
	 */
	static String noonRollover(Calendar cal) {
		String now = toDaystamp(cal);
		if (cal.get(Calendar.HOUR_OF_DAY) >=  HR_OF_DAY_NOON) {
			return now;
		}
		// return previous day if before noon
		return addDays(now, -1);
	}
	
	public static String addDays(String daystamp, int days) {
		Calendar cal = fromDaystamp(daystamp);
		cal.add(Calendar.DAY_OF_MONTH, days);
		return toDaystamp(cal);
	}

	/**
	 * Compute difference of two daystamps in days.
	 * 
	 * @param daytamp1
	 * @param daytamp2
	 * @return difference of daytamp1 - daytamp2 in days
	 */
	public static int diffDays(String daytamp1, String daytamp2) {
		long t1 = fromDaystamp(daytamp1).getTimeInMillis();
		long t2 = fromDaystamp(daytamp2).getTimeInMillis();
		long diffMillis = t1 - t2;
		/**
		 * It can happen that the difference is not exactly a multiple of days.
		 * So add a buffer amount to ensure value is rounded correctly
		 */
		long diffBuf = diffMillis < 0 ? diffMillis - MILLIS_PER_DAY/2 : diffMillis + MILLIS_PER_DAY/2;
		long days = diffBuf / MILLIS_PER_DAY;
		return (int) days;
	}
	
	public static Calendar fromDaystamp(String daystamp) {
		return fromDaystamp(daystamp, TZ_GMT);
	}
	
    public static Calendar fromDaystamp(String daystamp, TimeZone zone) {
		try {
			String yrStr = daystamp.substring(0, 4);
			int yr = Integer.parseInt(yrStr);
			String moStr = daystamp.substring(4, 6);
			int mo = Integer.parseInt(moStr);
			String dayStr = daystamp.substring(6, 8);
			int day = Integer.parseInt(dayStr);
			
			Calendar cal = Calendar.getInstance(zone);
			cal.clear();
			cal.set(yr, mo-1, day, 0, 0);
			
			return cal;
			
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}
	
	static String toDaystamp(Calendar cal) {
		return String.format("%4d%02d%02d",
				Integer.valueOf(cal.get(Calendar.YEAR)),
				Integer.valueOf(cal.get(Calendar.MONTH)+1),
				Integer.valueOf(cal.get(Calendar.DAY_OF_MONTH))
				);
	}

	public static String fromMillis(long millis) {
		Calendar cal = Calendar.getInstance(TZ_PST);
		cal.setTimeInMillis(millis-1); // For consistency with hours, midnight is part of the previous day.
		return toDaystamp(cal);
	}
	
	private static long toMillis(String hourstamp) {
		Calendar cal = fromDaystamp(hourstamp, TZ_PST);
		return cal.getTimeInMillis();
	}
	
	public static long toMillisStart(String daystamp) {
		return toMillis(WeatherDay.addDays(daystamp, 0));
	}
	public static long toMillisEnd(String daystamp) {
		return toMillis(WeatherDay.addDays(daystamp, 1));
	}

	public static TimeRange rangeFromHour(String hourstamp, int duration) {
		
		String daystamp = WeatherHour.toDay(hourstamp);

		return range(daystamp, duration);
	}
	
	public static TimeRange rangeFromHourWithRollover(String hourstamp, int duration) {

		String daystamp = WeatherDay.noonRollover(hourstamp);

		return range(daystamp, duration);
	}
	
	public static TimeRange range(String daystamp, int duration) {
		long dayEnd = WeatherDay.toMillisEnd(daystamp);
		String startDaystamp = WeatherDay.addDays(daystamp, -1*(duration-1));
		long dayStart = WeatherDay.toMillisStart(startDaystamp);

		return new TimeRange(startDaystamp, daystamp, dayStart, dayEnd, duration);
	}
	
}
