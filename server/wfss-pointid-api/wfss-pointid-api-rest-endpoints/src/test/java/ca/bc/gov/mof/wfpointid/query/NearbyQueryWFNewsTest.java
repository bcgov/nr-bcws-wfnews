package ca.bc.gov.mof.wfpointid.query;

import static ca.bc.gov.mof.wfpointid.dataprovider.DataItemDef.item;
import static ca.bc.gov.mof.wfpointid.test.util.QueryCheck.isSuccess;
import static org.junit.Assert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.not;

import java.util.Map;

import org.junit.Before;
import org.junit.Test;

import ca.bc.gov.mof.wfpointid.dataprovider.DataItemDef;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequestDef;
import ca.bc.gov.mof.wfpointid.dataprovider.DataResult;
import ca.bc.gov.mof.wfpointid.nearby.NearbyService;
import ca.bc.gov.mof.wfpointid.rest.client.v1.StageOfControl;
import ca.bc.gov.mof.wfpointid.test.util.QueryTestUtil;
import ca.bc.gov.mof.wfpointid.util.DistanceCalculator;

public class NearbyQueryWFNewsTest {
	DataRequestDef[] geography;

	@Before
	public void setup() throws Exception {
		geography=new DataRequestDef[] {	
				DataRequestDef.request(NearbyService.PROVIDER_WF_NEWS, "British_Columbia_Fire_Service_Weather_Stations",
						100000, new DataItemDef[]{ 
								item("incidentGuid", "objectid"),
								item("incidentSizeEstimatedHa", "current_size"), 
								item("incidentCauseLabel", "fire_cause"),
								item("incidentNumberLabel", "fire_number"),
								item("stageOfControlLabel", "fire_status"), 
								item("fireOfNoteInd", "fire_of_note_ind"),
								item("incidentName", "fire_of_note_name"),
								item("discoveryDate", "discovery_date"),
								item("latitude", "latitude"), 
								item("longitude", "longitude"),
								// Not available from WFNEWS, add dummy values for backward compatibility
								item("dummy", "fire_of_note_url"), 
								item("dummy", "ignition_date")
								})
		};
	}
	
	@Test
	public void testNearby() throws Exception {

		QueryEngine engine = QueryTestUtil.createEngineNearby();

		QueryResult res = QueryTestUtil.runQuery(engine, -123.4095869, 48.4792444, 25000, true, geography); 
																											
		assertThat(res, isSuccess());

		for (DataResult dr : res.getDataResults()) {

			for (Map<String, String> resultMap : dr.getMappedValues()) {

				if(resultMap.get("latitude") != null && resultMap.get("longitude") != null) {
					String distanceCalculated = DistanceCalculator.distance(
							56.73, 
							Double.parseDouble(resultMap.get("latitude")), 
							-132.91, 
							Double.parseDouble(resultMap.get("longitude")));
					resultMap.put("distance", distanceCalculated + " km");
				}
				
				if(resultMap.get("stageOfControl") !=null) {
					assertThat(StageOfControl.valueOf(resultMap.get("stageOfControl")), not(equalTo(StageOfControl.OUT)));
				}
			}
		}

	}

}
