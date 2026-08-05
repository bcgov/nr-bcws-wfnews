package ca.bc.gov.mof.wfpointid.query;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.arrayWithSize;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;

import ca.bc.gov.mof.wfpointid.rest.model.WeatherResource;
import ca.bc.gov.mof.wfpointid.test.util.QueryTestUtil;
import ca.bc.gov.mof.wfpointid.weather.WeatherService;

@EnabledIfSystemProperty(named = "wfnews.it", matches = "true", disabledReason = "Queries the live wfwx-fireweather-api; requires VPN + INT endpoints. Run with -Dwfnews.it=true")
public class FireweatherQueryTest {

	@BeforeEach
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
