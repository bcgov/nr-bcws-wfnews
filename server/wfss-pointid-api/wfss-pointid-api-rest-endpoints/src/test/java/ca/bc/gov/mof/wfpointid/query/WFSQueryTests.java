package ca.bc.gov.mof.wfpointid.query;

import static ca.bc.gov.mof.wfpointid.test.util.QueryCheck.hasData;
import static ca.bc.gov.mof.wfpointid.test.util.QueryCheck.isError;
import static ca.bc.gov.mof.wfpointid.test.util.QueryCheck.isSuccess;
import static ca.bc.gov.mof.wfpointid.test.util.QueryCheck.noValue;
import static org.hamcrest.Matchers.both;
import static org.hamcrest.Matchers.containsString;
import static org.junit.Assert.assertThat;

import org.junit.Test;

import ca.bc.gov.mof.wfpointid.dataprovider.DataItemDef;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequestDef;
import ca.bc.gov.mof.wfpointid.dataprovider.geoserver.GeoserverDataProvider;
import ca.bc.gov.mof.wfpointid.identify.IdentifyService;
import ca.bc.gov.mof.wfpointid.test.util.QueryTestUtil;

public class WFSQueryTests {
	
    @Test
    public void testWFSBuf() throws Exception {
    	
    	QueryEngine engine = QueryTestUtil.createEngine_WF_GS();
		
		QueryResult res = QueryTestUtil.runQuery(engine, -123.55924, 48.58993, true, TEST_WF_CLIENT_LINES);
		assertThat(res,hasData("CLIENT_ASSET_LINE_NAME", "BC HYDRO"));
		assertThat(res,hasData("CLIENT_ASSET_LINE_TYPE", "Transmission Line - 1L010"));
    }
    
	static DataRequestDef[] TEST_WF_CLIENT_LINES = new DataRequestDef[] {
		DataRequestDef.request(IdentifyService.PROVIDER_WF_GS, GeoserverDataProvider.TYPE_WFS_BUF, "CLT_CLIENT_ASSETS_LINES", "SHAPE", 10000, 	
			new DataItemDef[] {
			DataItemDef.item("CLIENT_NAME", 			"CLIENT_ASSET_LINE_NAME"), 
			DataItemDef.item("ASSET_TYPE", 			"CLIENT_ASSET_LINE_TYPE"), 
			DataItemDef.item("CONTACT_INFORMATION", 	"CLIENT_ASSET_LINE_CONTACT") 
		})
	};	
	
    @Test
    public void testBadHost() throws Exception {
    	
    	QueryEngine engine = QueryTestUtil.createBadHost_WF_GS();
		
		QueryResult res = QueryTestUtil.runQuery(engine, -123.83775, 49, true, TEST_WF_SINGLE);
		assertThat(res, isError("CENTRE", containsString("UnknownHostException")));
    }
    
	@Test
    public void testBadLayer() throws Exception {
    	
    	QueryEngine engine = QueryTestUtil.createEngine_WF_GS();
		
		QueryResult res = QueryTestUtil.runQuery(engine, -123.83775, 49, true, TEST_WF_SINGLE_BAD_LAYER);
		assertThat(res, isError("CENTRE", both(containsString("Feature type")).and(containsString("unknown"))));
		assertThat(res, noValue("CENTRE"));
    }
    
    @Test
    public void testQuery() throws Exception {
    	
    	QueryEngine engine = QueryTestUtil.createEngine_WF_GS();
		
		QueryResult res = QueryTestUtil.runQuery(engine, -123.83775, 49, true, TEST_WF_MANY);
		assertThat(res, isSuccess());
		assertThat(res,hasData("CENTRE", "2"));
		assertThat(res,hasData("ZONE", "South Island Zone"));
		assertThat(res,hasData("FIRE_DPT", "Town of Ladysmith FD"));

    }

	static DataRequestDef[] TEST_WF_SINGLE = new DataRequestDef[] {
		DataRequestDef.request(IdentifyService.PROVIDER_WF_GS, "WILDFIRE_ORG_UNIT_FIRE_CENTRE", "GEOMETRY", 10000, DataItemDef.item("WILDFIRE_ORG_UNIT_ID", "CENTRE")),	
	};
	static DataRequestDef[] TEST_WF_SINGLE_BAD_LAYER = new DataRequestDef[] {
		DataRequestDef.request(IdentifyService.PROVIDER_WF_GS, "XXX", "GEOMETRY", 10000, DataItemDef.item("WILDFIRE_ORG_UNIT_ID", "CENTRE")),	
	};

	static DataRequestDef[] TEST_WF_MANY = new DataRequestDef[] {
		DataRequestDef.request(IdentifyService.PROVIDER_WF_GS, "WILDFIRE_ORG_UNIT_FIRE_CENTRE", "GEOMETRY", 10000, DataItemDef.item("INTEGER_ALIAS", "CENTRE")),	
		DataRequestDef.request(IdentifyService.PROVIDER_WF_GS, "WILDFIRE_ORG_UNIT_FIRE_ZONE", "GEOMETRY", 10000, DataItemDef.item("FIRE_ZONE_NAME", "ZONE") ),	
		DataRequestDef.request(IdentifyService.PROVIDER_WF_GS, "BNDY_FIRE_DEPARTMENTS", "SHAPE", 10000, DataItemDef.item("FIRE_DPT"))	
	};

}
