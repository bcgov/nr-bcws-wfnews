package ca.bc.gov.mof.wfpointid.query;

import static ca.bc.gov.mof.wfpointid.dataprovider.DataItemDef.item;
import static ca.bc.gov.mof.wfpointid.test.util.QueryCheck.hasData;
import static ca.bc.gov.mof.wfpointid.test.util.QueryCheck.isSuccess;
import static org.junit.Assert.assertThat;

import org.junit.Test;

import ca.bc.gov.mof.wfpointid.PointIdServiceApplication;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequestDef;
import ca.bc.gov.mof.wfpointid.identify.GeographyQuery;
import ca.bc.gov.mof.wfpointid.identify.IdentifyQuery;
import ca.bc.gov.mof.wfpointid.identify.IdentifyService;
import ca.bc.gov.mof.wfpointid.test.util.QueryTestUtil;

public class BCGWQueryTests {

	@Test
    public void testQuery() throws Exception {
    	
    	QueryEngine engine = QueryTestUtil.createEngine_WF_GS_BCGW();
		System.setProperty("https.protocols", PointIdServiceApplication.HTTPS_PROTOCOLS);
		
		QueryResult res = QueryTestUtil.runQuery(engine, -123.37, 48.419, true, DRD_BCGW);
		assertThat(res, isSuccess());
		assertThat(res, hasData(GeographyQuery.MAPSHEET, "92B.044"));
    }
    
	static DataRequestDef[] DRD_BCGW = new DataRequestDef[] {
		DataRequestDef.request(IdentifyService.PROVIDER_BCGW, "WHSE_BASEMAPPING.BCGS_20K_GRID", IdentifyQuery.GEOMETRY, 10000, 
				item("MAP_TILE_DISPLAY_NAME", GeographyQuery.MAPSHEET))
	};


	

}
