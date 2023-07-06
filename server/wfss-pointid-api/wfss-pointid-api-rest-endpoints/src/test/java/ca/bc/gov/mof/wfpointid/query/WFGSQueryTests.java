package ca.bc.gov.mof.wfpointid.query;

import static ca.bc.gov.mof.wfpointid.dataprovider.DataItemDef.item;
import static ca.bc.gov.mof.wfpointid.dataprovider.DataRequestDef.request;
import static ca.bc.gov.mof.wfpointid.test.util.QueryCheck.hasData;
import static ca.bc.gov.mof.wfpointid.test.util.QueryCheck.isNumber;
import static ca.bc.gov.mof.wfpointid.test.util.QueryCheck.isSuccess;
import static org.junit.Assert.assertThat;

import org.junit.Test;

import ca.bc.gov.mof.wfpointid.dataprovider.DataRequestDef;
import ca.bc.gov.mof.wfpointid.dataprovider.geoserver.GeoserverDataProvider;
import ca.bc.gov.mof.wfpointid.identify.GeographyQuery;
import ca.bc.gov.mof.wfpointid.identify.IdentifyService;
import ca.bc.gov.mof.wfpointid.test.util.QueryTestUtil;

public class WFGSQueryTests {

	@Test
    public void testSlope() throws Exception {
    	
    	QueryEngine engine = QueryTestUtil.createEngine_WF_GS();
		
		QueryResult res = QueryTestUtil.runQuery(engine, -123.37, 48.419, true, DRD_WF_SEA);
		assertThat(res, isSuccess());
		assertThat(res, hasData(GeographyQuery.SLOPE, isNumber()));
		assertThat(res, hasData(GeographyQuery.ASPECT, isNumber()));
		assertThat(res, hasData(GeographyQuery.ELEVATION, isNumber()));
    }
       
	static DataRequestDef[] DRD_WF_SEA = new DataRequestDef[] {
			request(IdentifyService.PROVIDER_WF_GS, GeoserverDataProvider.TYPE_WMS, "BC_DEM", null, 10000, 
					item("GRAY_INDEX", 			GeographyQuery.ELEVATION)),
			request(IdentifyService.PROVIDER_WF_GS, GeoserverDataProvider.TYPE_WMS, "BC_SLOPE", null, 10000, 
					item("GRAY_INDEX", 			GeographyQuery.SLOPE)),
			request(IdentifyService.PROVIDER_WF_GS, GeoserverDataProvider.TYPE_WMS, "BC_ASPECT", null, 10000, 
					item("GRAY_INDEX", 			GeographyQuery.ASPECT))
	};

}
