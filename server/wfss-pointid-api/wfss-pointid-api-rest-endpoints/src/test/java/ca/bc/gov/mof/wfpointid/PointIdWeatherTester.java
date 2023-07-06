package ca.bc.gov.mof.wfpointid;

import static ca.bc.gov.mof.wfpointid.test.util.QueryResponseChecker.NUMBER;
import static ca.bc.gov.mof.wfpointid.test.util.QueryResponseChecker.STRING;

import org.json.JSONObject;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.util.Assert;

import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.JsonNode;
import com.mashape.unirest.http.Unirest;

import ca.bc.gov.mof.wfpointid.rest.endpoint.PointIdEndpoints;
import ca.bc.gov.mof.wfpointid.test.util.Property;
import ca.bc.gov.mof.wfpointid.test.util.Query;

@RunWith(SpringRunner.class)
@WebMvcTest(PointIdEndpoints.class)
public class PointIdWeatherTester {
	
	private final String REGEX_TIMESTAMP = "\\d\\d\\d\\d-\\d\\d-\\d\\dT\\d\\d:\\d\\d:\\d\\d";
	
	static Property[] schema = Property.create(
			"lat", 				NUMBER,
			"lon", 				NUMBER,
			"errorCount", 		NUMBER,
			"errorMsg", 		STRING,
			"errorDetail", 		STRING,
			"stations.[0].stationCode", 		NUMBER,
			"stations.[0].stationName", 		STRING,
			"stations.[0].lat", 				NUMBER,
			"stations.[0].lon", 				NUMBER,
			"stations.[0].elevation", 			NUMBER
			);
	
	
	@Autowired
	private MockMvc mockMvc;
	
	@Test
	public void testBadLon() throws Exception {
		checkError(Query.weather(-1220.5, 55.5, "201704012"), 400);
	}
	
	@Test
	public void testBadLat() throws Exception {
		checkError(Query.weather(-122.5, 91.5, "201704012"), 400);
	}
	
	@Test
	public void testBadHour() throws Exception {
		checkError(Query.weather(-122.5, 55.5, "201704012"), 400);
	}
	
	@Test
	public void testLemoray_2017040120() throws Exception {
		checkQuery(Query.weather(-122.5, 55.5, "2017040120"), schema,
			Property.create(
					"lon", 		Double.valueOf(-122.5),
					"lat", 		Double.valueOf(55.5),
					"stations.[0].stationCode", Integer.valueOf(140),
					"stations.[0].stationName", "LEMORAY",
					"stations.[0].lat", 		Double.valueOf(55.52498),
					"stations.[0].lon",			Double.valueOf(-122.5171),
					"stations.[0].elevation",	Integer.valueOf(757),
					
					"stations.[0].hourly.[0].hour", "2017040120",
					"stations.[0].hourly.[0].index", Integer.valueOf(1),
					"stations.[0].hourly.[0].temp", Double.valueOf(3.2),
					"stations.[0].hourly.[0].relativeHumidity", Integer.valueOf(89),
					"stations.[0].hourly.[0].windSpeed",Double.valueOf(8.8),
					"stations.[0].hourly.[0].windDirection",Integer.valueOf(297),
					"stations.[0].hourly.[0].windCardinalDir","WNW",
					"stations.[0].hourly.[0].precipitation",Double.valueOf(0.0),
					"stations.[0].hourly.[0].fineFuelMoistureCode",Double.valueOf(72.2),
					"stations.[0].hourly.[0].initialSpreadIndex",Double.valueOf(1.0),
					"stations.[0].hourly.[0].fireWeatherIndex",Double.valueOf(0.2),
					
					"stations.[0].hourly.[9].hour", "2017040111",
					"stations.[0].hourly.[9].index", Integer.valueOf(10),
					
					"stations.[0].hourly.[10].hour", "2017040110",
					"stations.[0].hourly.[10].index", Integer.valueOf(11)

			)
		);
	}

	@Test
	public void testTsartlish_20170206() throws Exception {
		checkQuery(Query.weather(-126.9, 50.1, "2017020612"), schema,
			Property.create(
					"lon", 		Double.valueOf(-126.9),
					"lat", 		Double.valueOf(50.1),
					"stations.[0].stationCode", Integer.valueOf(995),
					"stations.[0].stationName", "TS ARTLISH",
					"stations.[0].lat", 		Double.valueOf(50.1324167),
					"stations.[0].lon",			Double.valueOf(-126.9282333),
					"stations.[0].elevation",	Integer.valueOf(130),
					
					"stations.[0].hourly.[0].hour", "2017020612",
					"stations.[0].hourly.[0].index", Integer.valueOf(1),
					
					"stations.[0].hourly.[9].hour", "2017020603",
					"stations.[0].hourly.[9].index", Integer.valueOf(10),
					
					"stations.[0].hourly.[10].hour", "2017020602",
					"stations.[0].hourly.[10].index", Integer.valueOf(11),

					"stations.[0].daily.[0].day", "20170206",
					"stations.[0].daily.[0].index", Integer.valueOf(1),
			        "stations.[0].daily.[0].forecastInd", Boolean.FALSE,
			        "stations.[0].daily.[0].temp", Double.valueOf(-3.0),
			        "stations.[0].daily.[0].relativeHumidity", Integer.valueOf(66),
			        "stations.[0].daily.[0].windSpeed", Double.valueOf(4.5),
			        "stations.[0].daily.[0].windDirection", Integer.valueOf(90),
			        "stations.[0].daily.[0].windCardinalDir", "E",
			        "stations.[0].daily.[0].precipitation", Double.valueOf(0.6),
			        "stations.[0].daily.[0].buildupIndex", Double.valueOf(0.8),
			        "stations.[0].daily.[0].fineFuelMoistureCode", Double.valueOf(78.3),
			        "stations.[0].daily.[0].initialSpreadIndex", Double.valueOf(1.2),
			        "stations.[0].daily.[0].fireWeatherIndex", Double.valueOf(0.3),

					"stations.[0].daily.[1].day", "20170205",
					"stations.[0].daily.[1].index", Integer.valueOf(2),

					"stations.[0].daily.[2].day", "20170204",
					"stations.[0].daily.[2].index", Integer.valueOf(3),
			        "stations.[0].daily.[2].forecastInd", Boolean.FALSE,
			        "stations.[0].daily.[2].temp", Double.valueOf(3.0),
			        "stations.[0].daily.[2].relativeHumidity", Integer.valueOf(79),
			        "stations.[0].daily.[2].windSpeed", Double.valueOf(3.6),
			        "stations.[0].daily.[2].windDirection", Integer.valueOf(92),
			        "stations.[0].daily.[2].windCardinalDir", "E",
			        "stations.[0].daily.[2].precipitation", Double.valueOf(0.0),
			        "stations.[0].daily.[2].buildupIndex", Double.valueOf(1.1),
			        "stations.[0].daily.[2].fineFuelMoistureCode", Double.valueOf(78.9),
			        "stations.[0].daily.[2].initialSpreadIndex", Double.valueOf(1.2),
			        "stations.[0].daily.[2].fireWeatherIndex", Double.valueOf(0.3)

					
			)
		);
	}
	
	@SuppressWarnings("deprecation")
	public void checkError(String query, int statusCode) throws Exception {
		HttpResponse<JsonNode> response = null;
		try {
		
			response = Unirest.get(query).header("Content-Type", "application/json").asJson();
			System.out.println( "Query Response JSON: " + response );
			
			Assert.notNull(response);
			Assert.notNull(response.getStatus());
			Assert.notNull(response.getBody());
			
			JSONObject obj = response.getBody().getObject();
			Assert.notNull(obj.get("errorCount"));
			Assert.isTrue(obj.get("errorCount").getClass().equals(Integer.class));
			Assert.isTrue((Integer)(obj.get("errorCount")) > 0);
			Assert.isTrue(Integer.valueOf(response.getStatus()).equals(statusCode));
			Assert.isTrue(response.getHeaders().containsKey("Content-Type"));
			Assert.isTrue(String.valueOf(response.getHeaders().get("Content-Type")).contains("application/json;charset=UTF-8"));
	
		} 
		catch (AssertionError e) {
			// print failing result
			System.out.println( "Query " + query + " : " + e );
			System.out.println( "Query Response JSON: " + response );
			throw e;
		}
		
		finally {
			if (response != null && response.getRawBody()!= null) {
				response.getRawBody().close();
			}
		}
	}
	
	@SuppressWarnings("deprecation")
	public void checkQuery(String query, 
			Property[] propNV1, 
			Property[] propNV2) throws Exception {
		HttpResponse<JsonNode> response = null;
		try {
						
			response = Unirest.get(query).header("Content-Type", "application/json").asJson();
			System.out.println( "Query Response JSON: " + response );
			
			Assert.notNull(response);					
			Assert.notNull(response.getStatus());
			Assert.notNull(response.getBody());
			
			JSONObject obj = response.getBody().getObject();
			Assert.notNull(obj.get("errorCount"));
			Assert.notNull(obj.get("errorMsg"));
			Assert.notNull(obj.get("errorDetail"));
			Assert.notNull(obj.get("timestamp"));
			
			Assert.isTrue(Integer.valueOf(response.getStatus()).equals(200));
			Assert.isTrue(obj.get("errorCount").equals(Integer.valueOf(0)));
			Assert.isTrue(obj.get("errorMsg").equals(""));
			Assert.isTrue(obj.get("errorDetail").equals(""));
			Assert.isTrue(obj.get("timestamp").getClass().equals(String.class)); 
			Assert.isTrue(String.valueOf(obj.get("timestamp")).matches(REGEX_TIMESTAMP)); 
			
		} 
		catch (AssertionError e) {
			// print failing result
			System.out.println( "Query " + query + " : " + e );
			System.out.println( "Query Response JSON: " + response );
			throw e;
		}
		

		finally {
			if (response != null && response.getRawBody()!= null) {
				response.getRawBody().close();
			}
		}
	}
	

}
