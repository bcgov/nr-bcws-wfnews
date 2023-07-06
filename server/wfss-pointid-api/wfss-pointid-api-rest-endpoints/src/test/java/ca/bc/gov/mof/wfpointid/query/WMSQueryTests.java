package ca.bc.gov.mof.wfpointid.query;

import static ca.bc.gov.mof.wfpointid.test.util.QueryCheck.hasData;
import static ca.bc.gov.mof.wfpointid.test.util.QueryCheck.isSuccess;
import static ca.bc.gov.mof.wfpointid.test.util.QueryCheck.noValue;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

import ca.bc.gov.mof.wfpointid.dataprovider.DataItemDef;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequestDef;
import ca.bc.gov.mof.wfpointid.dataprovider.geoserver.GeoserverDataProvider;
import ca.bc.gov.mof.wfpointid.identify.IdentifyQuery;
import ca.bc.gov.mof.wfpointid.identify.IdentifyService;
import ca.bc.gov.mof.wfpointid.test.util.QueryCheck;
import ca.bc.gov.mof.wfpointid.test.util.QueryTestUtil;

public class WMSQueryTests {


	
	@Test
    public void testQuery() throws Exception {
    	
    	QueryEngine engine = QueryTestUtil.createEngine_WF_GS();
		
		QueryResult res = QueryTestUtil.runQuery(engine, -123.37, 48.419, true, DRD_WF_FUEL);
		assertThat(res, isSuccess());
		assertThat(res, hasData("FUEL_TYPE_CD", "O-1a/b"));
    }
    
    @Test
    public void testBadHost() throws Exception {
    	
    	QueryEngine engine = QueryTestUtil.createBadHost_WF_GS();
		
		QueryResult res = QueryTestUtil.runQuery(engine, -123.83775, 49, true, DRD_WF_FUEL);
		assertTrue(QueryCheck.isError(res));
		assertTrue(QueryCheck.isErrorMsgLike(res, "FUEL_TYPE_CD", "UnknownHostException"));
    }
    
    @Test
    public void testBadLayer() throws Exception {
    	QueryEngine engine = QueryTestUtil.createEngine_WF_GS();
		
		QueryResult res = QueryTestUtil.runQuery(engine, -123.83775, 49, true, DRD_WF_SINGLE_BAD_LAYER);
		assertTrue(QueryCheck.isError(res));
		assertThat(res, noValue("FUEL_TYPE_CD"));
    }
    
	static DataRequestDef[] DRD_WF_FUEL = new DataRequestDef[] {
		DataRequestDef.request(IdentifyService.PROVIDER_WF_GS, GeoserverDataProvider.TYPE_WMS, "FM_FUEL_TYPE_BC", IdentifyQuery.GEOMETRY, 10000, 
				DataItemDef.item("Fuel_Type_CD", 			"FUEL_TYPE_CD")),
	};
	
	static DataRequestDef[] DRD_WF_SINGLE_BAD_LAYER = new DataRequestDef[] {
		DataRequestDef.request(IdentifyService.PROVIDER_WF_GS, GeoserverDataProvider.TYPE_WMS, "XXX_BAD_LAYER", IdentifyQuery.GEOMETRY,  10000,
				DataItemDef.item("Fuel_Type_CD", 			"FUEL_TYPE_CD")),
	};

	

}
