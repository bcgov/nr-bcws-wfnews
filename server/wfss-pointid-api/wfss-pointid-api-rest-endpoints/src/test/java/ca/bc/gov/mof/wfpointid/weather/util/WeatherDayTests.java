package ca.bc.gov.mof.wfpointid.weather.util;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasProperty;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;

import java.util.Calendar;

import org.junit.Test;

public class WeatherDayTests {
	
	@Test
	public void  testAddSimple() {	
		checkAdd("20170401", 0, "20170401");

	}	
	@Test
	public void  testAddCrossMonths() {		
		checkAdd("20170401", -1, "20170331");
		checkAdd("20170401", -2, "20170330");
		checkAdd("20170401", -3, "20170329");
	}
	
	@Test
	public void  testAddCrossYears() {		
		checkAdd("20170101", -1, "20161231");
		checkAdd("20160101", -2, "20151230");
		checkAdd("20150101", -3, "20141229");
	}
	
	@Test
	public void  testAddLeapYears() {
		// NON-Leap Year - Feb 28 2017
		checkAdd("2017030101", -3, "20170226");
		
		// Leap Year - Feb 29 2016
		checkAdd("20160301", -3, "20160227");
	}
	
	@Test
	public void  testAddDaylightSavingsIgnored() {
		// Daylight Savings 2016
		// Daylight saving time 2016 in Canada began at 3:00 AM on Sunday, March 13
		// confirm calculation ignores DST
		checkAdd("20160313", -3, "20160310");
		checkAdd("20160314", -3, "20160311");
	}
	
	@Test
	public void testDiffDays() {
		checkDiffDays("20160313", "20160312", 1);
	}
	
	@Test
	public void testNoonRollover() {
		Calendar cal = WeatherDay.fromDaystamp("20170606");
		
		cal.set(Calendar.HOUR_OF_DAY, 11);
		String dayAfternoon = WeatherDay.toDaystamp(cal);
		assertEquals( "20170606", dayAfternoon );
		
		cal.set(Calendar.HOUR_OF_DAY, 10);
		String dayBeforenoon = WeatherDay.noonRollover(cal);
		assertEquals( "20170605", dayBeforenoon );

	}
	
	void  checkAdd(String day, int offset, String expected) {
		String day2 = WeatherDay.addDays(day, offset);
		assertEquals( expected, day2 );
		
		checkDiffDays(day, day2, -offset);
	}

	
	void  checkDiffDays(String day1, String day2, int expected) {
		int hrs = WeatherDay.diffDays(day1, day2);
		assertEquals( expected, hrs );
	}
	
	@Test
	public void testFromMillis() {
		String result = WeatherDay.fromMillis(1613439957000L); // 2021-02-15T17:45:57-08:00
		assertThat(result, equalTo("20210215"));
	}
	
	@Test
	public void testFromMillisAtMidnight() {
		String result = WeatherDay.fromMillis(1613462400000L);
		assertThat(result, equalTo("20210215")); // For consistency with hours, midnight belongs to the preceding day rather than the following as is normal.
	}
	
	@Test
	public void testToMillisEnd() {
		long result = WeatherDay.toMillisEnd("20210215"); 
		assertThat(result, equalTo(1613462400000L)); // 2021-02-15T18:00:00-08:00
	}
	
	@Test
	public void testToMillisStart() {
		long result = WeatherDay.toMillisStart("20210215"); // 
		assertThat(result, equalTo(1613376000000L)); // 2021-02-15T17:00:00-08:00
	}

	@Test
	public void testRangeFromHourOneDay() {
		TimeRange result = WeatherDay.rangeFromHour("2021021518", 1);
		assertThat(result, hasProperty("endStamp", equalTo("20210215")));
		assertThat(result, hasProperty("startStamp", equalTo("20210215")));
		assertThat(result, hasProperty("endMillis", equalTo(1613462400000L)));
		assertThat(result, hasProperty("startMillis", equalTo(1613376000000L)));
		assertThat(result, hasProperty("duration", equalTo(1)));
	}
	
	@Test
	public void testRangeFromHourTwoDays() {
		TimeRange result = WeatherDay.rangeFromHour("2021021518", 2);
		assertThat(result, hasProperty("endStamp", equalTo("20210215")));
		assertThat(result, hasProperty("startStamp", equalTo("20210214")));
		assertThat(result, hasProperty("endMillis", equalTo(1613462400000L)));
		assertThat(result, hasProperty("startMillis", equalTo(1613289600000L)));
		assertThat(result, hasProperty("duration", equalTo(2)));
	}
	
	@Test
	public void testRangeFromHourWithRolloverOneDayAfternoon() {
		TimeRange result = WeatherDay.rangeFromHourWithRollover("2021021518", 1);
		assertThat(result, hasProperty("endStamp", equalTo("20210215")));
		assertThat(result, hasProperty("startStamp", equalTo("20210215")));
		assertThat(result, hasProperty("endMillis", equalTo(1613462400000L)));
		assertThat(result, hasProperty("startMillis", equalTo(1613376000000L)));
		assertThat(result, hasProperty("duration", equalTo(1)));
	}
	
	@Test
	public void testRangeFromHourWithRolloverTwoDaysAfternoon() {
		TimeRange result = WeatherDay.rangeFromHourWithRollover("2021021518", 2);
		assertThat(result, hasProperty("endStamp", equalTo("20210215")));
		assertThat(result, hasProperty("startStamp", equalTo("20210214")));
		assertThat(result, hasProperty("endMillis", equalTo(1613462400000L)));
		assertThat(result, hasProperty("startMillis", equalTo(1613289600000L)));
		assertThat(result, hasProperty("duration", equalTo(2)));
	}
	
	// rangeFromHourWithRollover should return one day earlier if the time is in the morning.
	@Test
	public void testRangeFromHourWithRolloverOneDayMorning() {
		TimeRange result = WeatherDay.rangeFromHourWithRollover("2021021506", 1);
		assertThat(result, hasProperty("endStamp", equalTo("20210214")));
		assertThat(result, hasProperty("startStamp", equalTo("20210214")));
		assertThat(result, hasProperty("endMillis", equalTo(1613376000000L)));
		assertThat(result, hasProperty("startMillis", equalTo(1613289600000L)));
		assertThat(result, hasProperty("duration", equalTo(1)));
	}
	
	@Test
	public void testRangeFromHourWithRolloverTwoDaysMorning() {
		TimeRange result = WeatherDay.rangeFromHourWithRollover("2021021506", 2);
		assertThat(result, hasProperty("endStamp", equalTo("20210214")));
		assertThat(result, hasProperty("startStamp", equalTo("20210213")));
		assertThat(result, hasProperty("endMillis", equalTo(1613376000000L)));
		assertThat(result, hasProperty("startMillis", equalTo(1613203200000L)));
		assertThat(result, hasProperty("duration", equalTo(2)));
	}
	
	// rangeFromHour should have the same behavior in the morning as the afternoon.
	@Test
	public void testRangeFromHourOneDayMorning() {
		TimeRange result = WeatherDay.rangeFromHour("2021021506", 1);
		assertThat(result, hasProperty("endStamp", equalTo("20210215")));
		assertThat(result, hasProperty("startStamp", equalTo("20210215")));
		assertThat(result, hasProperty("endMillis", equalTo(1613462400000L)));
		assertThat(result, hasProperty("startMillis", equalTo(1613376000000L)));
		assertThat(result, hasProperty("duration", equalTo(1)));
	}
	
	@Test
	public void testRangeFromHourTwoDaysMorning() {
		TimeRange result = WeatherDay.rangeFromHour("2021021506", 2);
		assertThat(result, hasProperty("endStamp", equalTo("20210215")));
		assertThat(result, hasProperty("startStamp", equalTo("20210214")));
		assertThat(result, hasProperty("endMillis", equalTo(1613462400000L)));
		assertThat(result, hasProperty("startMillis", equalTo(1613289600000L)));
		assertThat(result, hasProperty("duration", equalTo(2)));
	}

}
