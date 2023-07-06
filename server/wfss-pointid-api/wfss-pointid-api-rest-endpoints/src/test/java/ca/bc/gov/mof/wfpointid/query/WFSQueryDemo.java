package ca.bc.gov.mof.wfpointid.query;

import org.junit.Test;

import ca.bc.gov.mof.wfpointid.ServiceBusyException;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequestDef;
import ca.bc.gov.mof.wfpointid.dataprovider.geoserver.GeoserverDataProvider;
import ca.bc.gov.mof.wfpointid.identify.OwnershipQuery;
import ca.bc.gov.mof.wfpointid.util.Stopwatch;

public class WFSQueryDemo {
    
    @Test
    public void testQuery() throws Exception {
    	
    	QueryEngine engine = new QueryEngine();
		engine.addProvider(GeoserverDataProvider.create("WFGS", "https://wf1geot.nrs.gov.bc.ca/geoserver/wfs", 4, 1000));
		engine.addProvider(GeoserverDataProvider.create("BCGW", "https://openmaps.gov.bc.ca/geo/pub/wfs", 4, 1000));
		
		runQuery(engine);
    }
    	
	private static void runQuery(QueryEngine engine) throws ServiceBusyException {
		QueryPt lonlat = QueryPt.create( -123.83775, 49 );
		
		DataRequestDef[] dqd = OwnershipQuery.OWNERSHIP;
		
		QueryDef qd = new QueryDef(dqd);
		
		Stopwatch sw = new Stopwatch();
		QueryResult result = engine.query(lonlat, null, false, qd);
		
		System.out.println();
		System.out.println("[" + sw.getTimeString() + "] " + result);
		System.out.println(result.toReportString());
	}
}
	


