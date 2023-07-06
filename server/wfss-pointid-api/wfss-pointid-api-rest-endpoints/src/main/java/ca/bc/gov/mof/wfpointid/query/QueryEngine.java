package ca.bc.gov.mof.wfpointid.query;

import java.util.HashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.mof.wfpointid.ServiceBusyException;
import ca.bc.gov.mof.wfpointid.dataprovider.DataProviderBase;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequestDef;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequestFutureTask;

public class QueryEngine {
	
	private static Logger LOG = LoggerFactory.getLogger(QueryEngine.class);

	private static long queryId = 0;
	
	private synchronized static String newId() {
		return Long.toString( queryId++ );
	}	
	
	private HashMap<String, DataProviderBase> providerMap = new HashMap<String, DataProviderBase>();

	public QueryEngine() {
		
	}
	
	public void addProvider(DataProviderBase provider) {
		LOG.info("Added Data Provider " + provider );
		providerMap.put(provider.getName(), provider);
	}
	
	public QueryResult query(QueryPt lonlat, Double radius, boolean useBufferedPoint, QueryDef queryDef) throws ServiceBusyException {
		String id = newId();
		QueryExecutor exec = new QueryExecutor(this, id);
		return exec.query(lonlat, radius, useBufferedPoint, queryDef);
	}

	public synchronized DataRequestFutureTask execute(String id, QueryPt lonlat, Double radius, boolean useBufferedPoint, DataRequestDef dataQueryDef) throws ServiceBusyException {
		String providerName = dataQueryDef.getProviderName();
		DataProviderBase dp = providerMap.get(providerName);
		if (dp == null) {
			throw new RuntimeException("No definition for Data Provider " + providerName);
		}
		return dp.execute(id, lonlat, radius, useBufferedPoint, dataQueryDef);
	}
	



}
