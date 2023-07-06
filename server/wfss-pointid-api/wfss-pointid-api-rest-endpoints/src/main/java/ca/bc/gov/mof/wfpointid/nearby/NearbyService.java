package ca.bc.gov.mof.wfpointid.nearby;

import javax.annotation.PostConstruct;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import ca.bc.gov.mof.wfpointid.PointIdServiceParams;
import ca.bc.gov.mof.wfpointid.ServiceBusyException;
import ca.bc.gov.mof.wfpointid.ServiceErrorException;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequestDef;
import ca.bc.gov.mof.wfpointid.dataprovider.DataResult;
import ca.bc.gov.mof.wfpointid.dataprovider.arcgis.ArcgisDataProvider;
import ca.bc.gov.mof.wfpointid.dataprovider.fireweather.FireweatherDataProvider;
import ca.bc.gov.mof.wfpointid.dataprovider.wfnews.WildfireNewsDataProvider;
import ca.bc.gov.mof.wfpointid.identify.DataStats;
import ca.bc.gov.mof.wfpointid.identify.RequestStats;
import ca.bc.gov.mof.wfpointid.query.QueryDef;
import ca.bc.gov.mof.wfpointid.query.QueryEngine;
import ca.bc.gov.mof.wfpointid.query.QueryPt;
import ca.bc.gov.mof.wfpointid.query.QueryResult;
import ca.bc.gov.mof.wfpointid.rest.model.NearbyResource;
import ca.bc.gov.mof.wfpointid.rest.model.QueryResource;
import ca.bc.gov.mof.wfpointid.util.GeoUtil;

@Component
public class NearbyService {
	
	@Autowired
	private NearbyQuery nearByQuery;
	
	@Autowired
	PointIdServiceParams param;

	private static final int TRIGGER_ORD_LAT = 1;
	private static final int TRIGGER_ORD_LON = -1;

	/**
	 * Hard to determine what the best # of workers is. 4 seems like a reasonable
	 * guess, based on known heuristics about Geoserver that 4 cores are a sweet
	 * spot for processing. This will be heavily data and location dependent.
	 */
	private static final int REQUEST_WORKERS = 4;

	private static Logger LOG = LoggerFactory.getLogger(NearbyService.class);

	public static final String PROVIDER_WF_ARCGIS = "WFARCGIS";
	public static final String PROVIDER_WF_FIREWEATHER = "WFFIREWEATHER";
	public static final String PROVIDER_WF_NEWS = "WFNEWS";

	public static RequestStats queryStats = new RequestStats();

	@PostConstruct
	public void initEngine() {
		LOG.debug("<initEngine");
		
		QueryEngine queryEngine = new QueryEngine();

		queryEngine.addProvider(
				ArcgisDataProvider.create(PROVIDER_WF_ARCGIS, param.getWfArcGisURL(), REQUEST_WORKERS, param.getWfArcGisLayerQueueSize()));
		queryEngine.addProvider(FireweatherDataProvider.create(
				NearbyService.PROVIDER_WF_FIREWEATHER,
				param.getFireweatherBaseURL(), 
				param.getWebadeOauth2ClientId(), 
				param.getWebadeOauth2ClientSecret(), 
				param.getWebadeOauth2TokenUrl(), 
				param.getWebadeOauth2ClientScopes(), 
				REQUEST_WORKERS, param.getFireweatherQueueSize()));
		queryEngine.addProvider(WildfireNewsDataProvider.create(
				NearbyService.PROVIDER_WF_NEWS,
				param.getWfNewsBaseURL(), 
				REQUEST_WORKERS, param.getWfNewsQueueSize()));

		this.engine = queryEngine;
		
		LOG.debug(">initEngine");
	}

	private QueryEngine engine;

	public QueryEngine getEngine() {
		return engine;
	}

	public void setEngine(QueryEngine engine) {
		this.engine = engine;
	}

	private static DataStats dataStats = new DataStats();

	public NearbyResource queryNearbyData(String lon, String lat, String radius, boolean useBufferedPoint) throws ServiceBusyException, ServiceErrorException {
		return (NearbyResource) runQuery(lon, lat, radius, useBufferedPoint, nearByQuery.NEARBY, nearByQuery);
	}

	public NearbyResource fetchNearbyDataResults(String lon, String lat, String radius, boolean useBufferedPoint) throws ServiceBusyException {
		return (NearbyResource) fetchQueryDataResults(lon, lat, radius, useBufferedPoint, nearByQuery.NEARBY, nearByQuery);
	}

	/**
	 * This does not throw a ServiceException because it still returns a data
	 * resource even if upstream service access fails.
	 * 
	 * @param lon
	 * @param lat
	 * @param drd
	 * @param query
	 * @return
	 * @throws ServiceBusyException
	 * @throws ServiceErrorException 
	 */
	private QueryResource runQuery(String lon, String lat, String rad, boolean useBufferedPoint, DataRequestDef[] drd, NearbyQuery query)
			throws ServiceBusyException, ServiceErrorException {

		QueryPt pt = QueryPt.create(GeoUtil.parseLonLat(lon, lat));

		Double radius = Double.valueOf(rad);

		QueryDef qd = new QueryDef(drd);
		LOG.debug("engine="+engine);
		
		QueryResult queryResult = engine.query(pt, radius, useBufferedPoint, qd);

		boolean isLogStat = isQueryPtTrigger(pt) || LOG.isDebugEnabled();
		if (isLogStat)
			logStat(queryResult);

		QueryResource result = query.createResource(pt, radius, queryResult);
		return result;
	}

	private QueryResource fetchQueryDataResults(String lon, String lat, String rad, boolean useBufferedPoint, DataRequestDef[] drd,
			NearbyQuery query) throws ServiceBusyException {

		QueryPt pt = QueryPt.create(GeoUtil.parseLonLat(lon, lat));

		Double radius = null;
		if(rad!=null) {
			
			radius = Double.valueOf(rad);
		}

		QueryDef qd = new QueryDef(drd);
		QueryResult queryResult = engine.query(pt, radius, useBufferedPoint, qd);

		boolean isLogStat = isQueryPtTrigger(pt) || LOG.isDebugEnabled();
		if (isLogStat)
			logStat(queryResult);

		QueryResource result = query.getQueryResultRsrc(pt, radius, queryResult);
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

		LOG.info("Identify Query Stats: " + queryStats.report());
		LOG.info("Identify Data Stats: " + dataStats.report());
	}
}
