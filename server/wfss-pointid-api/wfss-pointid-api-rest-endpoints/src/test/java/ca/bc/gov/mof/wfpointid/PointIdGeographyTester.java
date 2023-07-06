package ca.bc.gov.mof.wfpointid;

import static ca.bc.gov.mof.wfpointid.test.util.QueryResponseChecker.NUMBER;
import static ca.bc.gov.mof.wfpointid.test.util.QueryResponseChecker.STRING;

import org.json.JSONObject;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.util.Assert;

import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.JsonNode;
import com.mashape.unirest.http.Unirest;

import ca.bc.gov.mof.wfpointid.rest.endpoint.PointIdEndpoints;
import ca.bc.gov.mof.wfpointid.test.util.Property;
import ca.bc.gov.mof.wfpointid.test.util.Query;
import ca.bc.gov.mof.wfpointid.test.util.QueryResponseChecker;

@RunWith(SpringRunner.class)
@WebMvcTest(PointIdEndpoints.class)
public class PointIdGeographyTester {

	private static final String RES_GEOGRAPHY = "https://i1bcwsapi.nrs.gov.bc.ca/wfss-pointid-api/geography";
	
	private final String REGEX_TIMESTAMP = "\\d\\d\\d\\d-\\d\\d-\\d\\dT\\d\\d:\\d\\d:\\d\\d";

	static Property[] schema = Property.create(
			"lat", 				NUMBER,
			"lon", 				NUMBER,
			"errorCount", 		NUMBER,
			"errorMsg", 		STRING,
			"errorDetail", 		STRING,
			"fuelType", 		STRING,
			"mapsheet", 		STRING,
			"vegLabel",			STRING,
			"bioGeoClimaticZone", STRING
			);

	@Test
	public void testFuelType() throws Exception {
		checkQuery(Query.query(RES_GEOGRAPHY, -123.37, 48.419), 
			schema,
			Property.create(
				"fuelType", 		"N"
			)
		);
	}

	@Test
	public void testVictoriaLeg() throws Exception {
		checkQuery(Query.query(RES_GEOGRAPHY, -123.37, 48.419),
			"fuelType", 		"N",
			"slope", 			Integer.valueOf(1),
			"aspect", 			Integer.valueOf(348),
			"elevation", 		Integer.valueOf(10),
			"mapsheet", 		"92B.044",
			"vegLabel",			"2999\\NTA",
			"bioGeoClimaticZone", "Coastal Douglas-fir"		
		);
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
	
	public void checkQuery(String query,
			Object... prop) throws Exception {
		Property[] propNV = Property.create(prop);
		checkQuery(query, propNV, null);
	}
	
	public void checkQuery(String query, 
			Property[] propNV1) throws Exception {
		checkQuery(query, propNV1, null);
	}
	



}
