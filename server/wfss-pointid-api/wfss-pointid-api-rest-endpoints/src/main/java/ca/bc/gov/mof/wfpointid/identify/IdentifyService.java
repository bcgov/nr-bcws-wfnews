package ca.bc.gov.mof.wfpointid.identify;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.mof.wfpointid.Messages;
import ca.bc.gov.mof.wfpointid.ServiceBusyException;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequestDef;
import ca.bc.gov.mof.wfpointid.dataprovider.DataResult;
import ca.bc.gov.mof.wfpointid.dataprovider.geoserver.GeoserverDataProvider;
import ca.bc.gov.mof.wfpointid.query.QueryDef;
import ca.bc.gov.mof.wfpointid.query.QueryEngine;
import ca.bc.gov.mof.wfpointid.query.QueryPt;
import ca.bc.gov.mof.wfpointid.query.QueryResult;
import ca.bc.gov.mof.wfpointid.rest.model.GeographyResource;
import ca.bc.gov.mof.wfpointid.rest.model.OwnershipResource;
import ca.bc.gov.mof.wfpointid.rest.model.QueryResource;
import ca.bc.gov.mof.wfpointid.util.GeoUtil;

public class IdentifyService {
	
	private static final int TRIGGER_ORD_LAT = 1;
	private static final int TRIGGER_ORD_LON = -1;

	private static final int REQUEST_QUEUE_SIZE = 1000;

	/**
	 * Hard to determine what the best # of workers is. 
	 * 4 seems like a reasonable guess, based on known heuristics about Geoserver 
	 * that 4 cores are a sweet spot for processing.
	 * This will be heavily data and location dependent.
	 */
	private static final int REQUEST_WORKERS = 4;

	private static Logger LOG = LoggerFactory.getLogger(IdentifyService.class);
	
	public static final String PROVIDER_BCGW = "BCGW";
	public static final String PROVIDER_WF_GS = "WFGS";
	
	public static RequestStats queryStats = new RequestStats();
	
	static QueryEngine initEngine(String wfGeoServerURL, String bcgwGeoServerURL) {
		QueryEngine engine = new QueryEngine();
		
		
		engine.addProvider(GeoserverDataProvider.create(PROVIDER_WF_GS, wfGeoServerURL, REQUEST_WORKERS, REQUEST_QUEUE_SIZE));
		engine.addProvider(GeoserverDataProvider.create(PROVIDER_BCGW, bcgwGeoServerURL, REQUEST_WORKERS, REQUEST_QUEUE_SIZE));
		
		return engine;
	}
	
	private QueryEngine engine;

	private static DataStats dataStats = new DataStats();
	
	public IdentifyService(String wf1URL, String bcgwURL) {
		LOG.info(String.format("Init Identify Service: WF URL=%s, BCGW URL=%s ", wf1URL, bcgwURL));
		engine = initEngine(wf1URL, bcgwURL);
	}
	
	public OwnershipResource queryOwnership(String lon, String lat) throws ServiceBusyException {
		return (OwnershipResource) runQuery(lon, lat, true, OwnershipQuery.OWNERSHIP, new OwnershipQuery());
	}

	public GeographyResource queryGeography(String lon, String lat) throws ServiceBusyException {
		return (GeographyResource) runQuery(lon, lat, true, GeographyQuery.GEOGRAPHY, new GeographyQuery());
	}
	
	/**
	 * This does not throw a ServiceException because it still returns a data resource even if upstream service access fails.
	 * 
	 * @param lon
	 * @param lat
	 * @param drd
	 * @param query
	 * @return
	 * @throws ServiceBusyException 
	 */
	private QueryResource runQuery(String lon, String lat, boolean useBufferedPoint, 
			DataRequestDef[] drd, IdentifyQuery query) throws ServiceBusyException {
		
		QueryPt pt = QueryPt.create(GeoUtil.parseLonLat(lon, lat));
		QueryDef qd = new QueryDef(drd);
		QueryResult queryResult = engine.query(pt, null, useBufferedPoint, qd);

		boolean isLogStat = isQueryPtTrigger(pt) || LOG.isDebugEnabled();
		if (isLogStat) logStat(queryResult);
		
		if (LOG.isDebugEnabled()) {
			LOG.debug( pt + " -> " + queryResult );
		}
		
		QueryResource result = query.createResource(pt, queryResult);
		return result;
	}

	private static boolean isQueryPtTrigger(QueryPt pt) {
		return pt.getLat() == TRIGGER_ORD_LAT || pt.getLon() == TRIGGER_ORD_LON;
	}

	private static void logStat(QueryResult queryResult) {
		queryStats.log(queryResult.getDuration(), queryResult.isSuccess());
		for (DataResult dres : queryResult.getDataResults()) {
			String name = dres.getDataRequestDef().toString();
			dataStats.log(name, dres.getDuration());
		}
		
		LOG.info( "Identify Query Stats: " + queryStats.report() );
		LOG.info( "Identify Data Stats: " + dataStats.report() );
	}

}
