package ca.bc.gov.mof.wfpointid.query;

import static org.hamcrest.Matchers.arrayWithSize;
import static org.junit.Assert.assertThat;

import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;

import ca.bc.gov.mof.wfpointid.rest.model.WeatherResource;
import ca.bc.gov.mof.wfpointid.test.util.QueryTestUtil;
import ca.bc.gov.mof.wfpointid.weather.WeatherService;

public class FireweatherQueryTest {

	@Before
	public void setup() throws Exception {

	}
	
	@Test
    public void testWeather() throws Exception {
    	
		WeatherService service = QueryTestUtil.createServiceFireweather();
		QueryPt point = new QueryPt(-123.613889, 48.4945);
		WeatherResource result = service.queryWeatherData(point, null, 2, 2);
		assertThat(result.getStations()[0].getHourly(), arrayWithSize(2));
		assertThat(result.getStations()[0].getDaily(), arrayWithSize(2));
    }
       
	
}
