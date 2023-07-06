package ca.bc.gov.mof.wfpointid.weather;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasProperty;
import static org.junit.Assert.assertThat;

import org.junit.Test;

import ca.bc.gov.mof.wfpointid.fireweather.rest.v1.resource.Weather;
import ca.bc.gov.mof.wfpointid.rest.model.WeatherBase;
import ca.bc.gov.mof.wfpointid.rest.model.WeatherHourly;

public class FireweatherWeatherServiceTest {

	@Test
	public void testConvertWeatherBase() {
		Weather from = new Weather();
		WeatherBase to = new WeatherHourly();
		from.setFineFuelMoistureCode(1.75);
		from.setTemperature(2.75);
		from.setRelativeHumidity(3.75);
		from.setWindSpeed(4.75);
		from.setWindDirection(5.75);
		from.setPrecipitation(6.75);
		from.setInitialSpreadIndex(7.75);
		from.setFireWeatherIndex(8.75);
		FireweatherWeatherService.convertWeatherBase(to, from);
		assertThat(to, hasProperty("fineFuelMoistureCode", equalTo(1.75)));
		assertThat(to, hasProperty("temp", equalTo(2.75)));
		assertThat(to, hasProperty("relativeHumidity", equalTo(4)));
		assertThat(to, hasProperty("windSpeed", equalTo(4.75)));
		assertThat(to, hasProperty("windDirection", equalTo(6)));
		assertThat(to, hasProperty("precipitation", equalTo(6.75)));
		assertThat(to, hasProperty("initialSpreadIndex", equalTo(7.75)));
		assertThat(to, hasProperty("fireWeatherIndex", equalTo(8.75)));
	}
	
	@Test
	public void testConvertWeatherBaseRelativeHumidityIsNull() {
		Weather from = new Weather();
		WeatherBase to = new WeatherHourly();
		from.setFineFuelMoistureCode(1.75);
		from.setTemperature(2.75);
		from.setRelativeHumidity(null);
		from.setWindSpeed(4.75);
		from.setWindDirection(5.75);
		from.setPrecipitation(6.75);
		from.setInitialSpreadIndex(7.75);
		from.setFireWeatherIndex(8.75);
		FireweatherWeatherService.convertWeatherBase(to, from);
		assertThat(to, hasProperty("relativeHumidity", equalTo(null)));
	}
	
	@Test
	public void testConvertWeatherBaseWindDirectionIsNull() {
		Weather from = new Weather();
		WeatherBase to = new WeatherHourly();
		from.setFineFuelMoistureCode(1.75);
		from.setTemperature(2.75);
		from.setRelativeHumidity(3.75);
		from.setWindSpeed(4.75);
		from.setWindDirection(null);
		from.setPrecipitation(6.75);
		from.setInitialSpreadIndex(7.75);
		from.setFireWeatherIndex(8.75);
		FireweatherWeatherService.convertWeatherBase(to, from);
		assertThat(to, hasProperty("windDirection", equalTo(null)));
	}

}
