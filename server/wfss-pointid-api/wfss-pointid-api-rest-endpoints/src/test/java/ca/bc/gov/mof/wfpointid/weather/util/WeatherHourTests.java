package ca.bc.gov.mof.wfpointid.weather.util;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasProperty;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;

import java.util.Arrays;

import org.junit.Test;

public class WeatherHourTests {
	
	@Test
	public void  testInvalid() {	
		checkValid("XXXXXXXXXX", false);
		checkValid("X017000120", false);
		
		checkValid("2017000120", false);
		checkValid("2017010001", false);
		checkValid("2017010100", false);
		
		checkValid("2017130120", false);
		checkValid("2017123220", false);
		checkValid("2017123225", false);
		checkValid("201712322", false);
		checkValid(null, false);
	}	
	@Test
	public void  testValid() {	
		checkValid("2017040120", true);
	}	
	
	private static void checkValid(String hour, boolean expected) {
		assertEquals( Boolean.valueOf(expected), Boolean.valueOf(WeatherHour.isValid(hour)));
	}

	@Test
	public void  testAddHourSimple() {	
		checkAddHour("2017040120", 0, "2017040120");
		checkAddHour("2017040120", -1, "2017040119");
		checkAddHour("2017040120", -2, "2017040118");
		checkAddHour("2017040120", -10, "2017040110");
	}	
	@Test
	public void  testAddHourCrossDays() {		
		checkAddHour("2017040201", -10, "2017040115");
	}
	@Test
	public void  testAddHourCrossMonths() {		
		checkAddHour("2017040101", -11, "2017033114");
	}
	
	@Test
	public void  testAddHourLeapYears() {
		// NON-Leap Year - Feb 28 2017
		checkAddHour("2017030106", -11, "2017022819");
		
		// Leap Year - Feb 29 2016
		checkAddHour("2016030106", -11, "2016022919");
	}
	
	@Test
	public void  testHourRangeIs_01_24() {
		
		// check that hour range is 01 to 24
		
		checkAddHour("2017051924", -1, "2017051923");
		checkAddHour("2017040124", -1, "2017040123");
		checkAddHour("2017040101", -1, "2017033124");
		checkAddHour("2017040102", -2, "2017033124");
	}
	
	@Test
	public void  testAddHourDaylightSavingsIgnored() {
		// Daylight Savings 2016
		// Daylight saving time 2016 in Canada began at 3:00 AM on Sunday, March 13
		// confirm calculation ignores DST
		checkAddHour("2016031306", -11, "2016031219");
		checkAddHour("2016031406", -11, "2016031319");
	}
	
	void  checkAddHour(String hrstamp1, int hrOffset, String expected) {
		String hrstamp2 = WeatherHour.addHours(hrstamp1, hrOffset);
		assertEquals( expected, hrstamp2 );
		
		checkDiffHours(hrstamp1, hrstamp2, -hrOffset);
	}
	
	@Test
	public void testDiffHours() {
		checkDiffHours("2016031306", "2016031219", 11);
	}
	
	void  checkDiffHours(String hrstamp1, String hrstamp2, int expected) {
		int hrs = WeatherHour.diffHours(hrstamp1, hrstamp2);
		assertEquals( expected, hrs );
	}
	// That the hourstamp is meant to identify reports within the hour preceding the numbered hour is inferred from existing behaviour. 

	@Test
	public void testFromMillis() {
		String result = WeatherHour.fromMillis(1613439957000L); // 2021-02-15T17:45:57-08:00
		assertThat(result, equalTo("2021021518")); // Hourstamp is the hour number at the end of the hour containing the specified instant
	}
	
	@Test
	public void testFromMillisDuringDST() {
		String result = WeatherHour.fromMillis(1623807957000L); // 2021-06-15T17:45:57-08:00 or 2021-06-15T18:45:57-07:00
		assertThat(result, equalTo("2021061518")); // Hourstamp is in PST even during DST.
	}
	
	@Test
	public void testFromMillisOnTheHour() {
		String result = WeatherHour.fromMillis(1613440800000L); // 2021-02-15T18:00:00-08:00
		assertThat(result, equalTo("2021021518")); // Hour includes the instant that identifies it
	}
	
	@Test
	public void testFromMillisJustBeforeMidnight() {
		String result = WeatherHour.fromMillis(1613461800000L); // 2021-02-15T23:50:00-08:00
		assertThat(result, equalTo("2021021524")); // 
	}
	
	@Test
	public void testFromMillisAtMidnight() {
		String result = WeatherHour.fromMillis(1613462400000L); // 2021-02-15T23:50:00-08:00
		assertThat(result, equalTo("2021021524")); // 
	}
	
	@Test
	public void testToMillisEnd() {
		long result = WeatherHour.toMillisEnd("2021021518"); 
		assertThat(result, equalTo(1613440800000L)); // 2021-02-15T18:00:00-08:00
	}
	
	@Test
	public void testToMillisStart() {
		long result = WeatherHour.toMillisStart("2021021518"); // 
		assertThat(result, equalTo(1613437200000L)); // 2021-02-15T17:00:00-08:00
	}
	
	@Test
	public void testMillisRoundtrip() {
		for (String stamp: Arrays.asList("2021021518", "2021021501", "2021021524", "2021061518", "2021061501", "2021061524")) {
			// Since hours are identified by their end time, use toMillisEnd for the round trip
			long millis = WeatherHour.toMillisEnd(stamp);
			String result =  WeatherHour.fromMillis(millis);
			assertThat(result, equalTo(stamp));
		}
	}
	
	@Test
	public void testRangeOneHour() {
		TimeRange result = WeatherHour.range("2021021518", 1);
		assertThat(result, hasProperty("endStamp", equalTo("2021021518")));
		assertThat(result, hasProperty("startStamp", equalTo("2021021518")));
		assertThat(result, hasProperty("endMillis", equalTo(1613440800000L)));
		assertThat(result, hasProperty("startMillis", equalTo(1613437200000L)));
		assertThat(result, hasProperty("duration", equalTo(1)));
	}
	
	@Test
	public void testRangeTwoHours() {
		TimeRange result = WeatherHour.range("2021021518", 2);
		assertThat(result, hasProperty("endStamp", equalTo("2021021518")));
		assertThat(result, hasProperty("startStamp", equalTo("2021021517")));
		assertThat(result, hasProperty("endMillis", equalTo(1613440800000L)));
		assertThat(result, hasProperty("startMillis", equalTo(1613433600000L)));
		assertThat(result, hasProperty("duration", equalTo(2)));
	}
	
	@Test
	public void testRangeTenHours() {
		TimeRange result = WeatherHour.range("2021021507", 10);
		assertThat(result, hasProperty("endStamp", equalTo("2021021507")));
		assertThat(result, hasProperty("startStamp", equalTo("2021021422")));
		assertThat(result, hasProperty("endMillis", equalTo(1613401200000L)));
		assertThat(result, hasProperty("startMillis", equalTo(1613365200000L)));
		assertThat(result, hasProperty("duration", equalTo(10)));
	}
}
