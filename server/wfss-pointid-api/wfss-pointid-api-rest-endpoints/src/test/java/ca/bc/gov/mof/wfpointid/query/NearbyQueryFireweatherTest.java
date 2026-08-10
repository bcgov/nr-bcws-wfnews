package ca.bc.gov.mof.wfpointid.query;

import static ca.bc.gov.mof.wfpointid.test.util.QueryCheck.isSuccess;
import static org.hamcrest.MatcherAssert.assertThat;

import java.io.Reader;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.io.geojson.GeoJsonReader;
import org.locationtech.jts.operation.distance.DistanceOp;

import ca.bc.gov.mof.wfpointid.dataprovider.DataItemDef;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequestDef;
import ca.bc.gov.mof.wfpointid.dataprovider.DataResult;
import ca.bc.gov.mof.wfpointid.nearby.NearbyService;
import ca.bc.gov.mof.wfpointid.test.util.QueryCheck;
import ca.bc.gov.mof.wfpointid.test.util.QueryTestUtil;
import ca.bc.gov.mof.wfpointid.util.DistanceCalculator;

@EnabledIfSystemProperty(named = "wfnews.it", matches = "true", disabledReason = "Queries the live wfwx-fireweather-api station index; requires VPN + INT endpoints. Run with -Dwfnews.it=true")
public class NearbyQueryFireweatherTest {
	DataRequestDef[] geography;
	
	@BeforeEach
	public void setup() throws Exception {
		geography=new DataRequestDef[] {	
				DataRequestDef.request(NearbyService.PROVIDER_WF_FIREWEATHER, "British_Columbia_Fire_Service_Weather_Stations",
						100000, new DataItemDef[]{ 
								DataItemDef.item("stationCode"),
								DataItemDef.item("stationName"),
								DataItemDef.item("distance"),
								DataItemDef.item("elevation"),
								DataItemDef.item("currentWeather.relativeHumidity"),
								DataItemDef.item("currentWeather.windSpeed"),
								DataItemDef.item("currentWeather.windDirection"),
								DataItemDef.item("currentWeather.windCardinalDir"),
								DataItemDef.item("currentWeather.precipitation"),
								DataItemDef.item("currentWeather.fineFuelMoistureCode"),
								DataItemDef.item("currentWeather.initialSpreadIndex"),
								DataItemDef.item("currentWeather.fireWeatherIndex")
								})
		};
	}
	
	@Test
    public void testNearby() throws Exception {
    	
    	QueryEngine engine = QueryTestUtil.createEngineNearby();
    	    	
    	GeoJsonReader geoJsonReader = null;
    	
    	Geometry result = null;
    	Geometry result1 = null;
    	List<String> test = null;
		QueryResult res = QueryTestUtil.runQuery(engine, -123.4095869, 48.4792444, 25000, true, geography); 
		assertThat(res, isSuccess());
		
		for(DataResult dr : res.getDataResults()) {
			
			for(Map<String, String> resultMap: dr.getMappedValues()) {
				
				if(resultMap.get("latitude") != null && resultMap.get("longitude") != null) {
					String distanceCalculated = DistanceCalculator.distance(
							56.73, 
							Double.parseDouble(resultMap.get("latitude")), 
							-132.91, 
							Double.parseDouble(resultMap.get("longitude")));
					resultMap.put("distance", distanceCalculated + " km");
				}

				if(resultMap.get("rings") != null) {
										
					String inputPoint = "{\"coordinates\":[-123.4095869, 48.4792444], \"type\":\"Point\"}";
					
					String jsonResponse = "{\"coordinates\":"+resultMap.get("rings")+", \"type\":\"Polygon\"}";
					
					geoJsonReader = new GeoJsonReader();
					Reader reader = new StringReader(jsonResponse);
					Reader reader1 = new StringReader(inputPoint);
					result = geoJsonReader.read(reader);
					result1 = geoJsonReader.read(reader1);
					
					Coordinate[] pts = DistanceOp.nearestPoints(result, result1);
														
					test = new ArrayList<String>();
					
					test.add(pts[0].x + ", " + pts[0].y);			
					
					String distanceCalculated = DistanceCalculator.distance(48.4792444, pts[0].x, -123.4095869, pts[0].y);
					resultMap.put("distance_to_nearest_coordinates", distanceCalculated + " km");
					
				}
			}
		}
				
		
    }
       
	
}
