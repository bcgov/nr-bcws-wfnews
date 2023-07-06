package ca.bc.gov.mof.wfpointid.query;

import java.util.concurrent.ExecutionException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.mof.wfpointid.ServiceBusyException;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequestDef;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequestFutureTask;
import ca.bc.gov.mof.wfpointid.dataprovider.DataResult;


public class QueryExecutor {

	@SuppressWarnings("unused")
	private static Logger logger = LoggerFactory.getLogger(QueryExecutor.class);
	private static final int POLL_INTERVAL = 50;
	private QueryEngine engine;
	private String id;
	
	public QueryExecutor(QueryEngine queryEngine, String id) {
		this.engine = queryEngine;
		this.id = id;
	}

	public QueryResult query(QueryPt lonlat, Double radius, boolean useBufferedPoint, QueryDef queryDef) throws ServiceBusyException {
		long startTime = System.currentTimeMillis();
		DataRequestFutureTask[] requests = start(lonlat,  radius, useBufferedPoint, queryDef);
		
		wait(requests, POLL_INTERVAL);
		
		// get results from requests
		QueryResult result = createResult(requests);
		long dur = System.currentTimeMillis() - startTime;
		result.setDuration(dur);
		return result;
	}
	
	private synchronized DataRequestFutureTask[] start(QueryPt lonlat, Double radius, boolean useBufferedPoint, QueryDef queryDef) throws ServiceBusyException {
		DataRequestDef[] dataQueries = queryDef.getDataQueries();
		
		DataRequestFutureTask[] requests = new DataRequestFutureTask[dataQueries.length];
		
		for (int i = 0; i < dataQueries.length; i++) {
			requests[i] = engine.execute(id, lonlat, radius, useBufferedPoint, dataQueries[i]);
		}
		
		return requests;
		
	}
	
	private QueryResult createResult(DataRequestFutureTask[] requests) {
		DataResult[] results = new DataResult[requests.length];
		for (int i = 0; i < requests.length; i++) {
			try {
				DataResult dr = requests[i].get();
				results[i] = dr;
			} catch (InterruptedException | ExecutionException e) {
				results[i] = DataResult.createError(requests[i].getReq().getDataRequestDef(), e.getMessage());
			}
		}
		QueryResult qr = new QueryResult(id, results);
		return qr;
	}

	private static void wait(DataRequestFutureTask[] requests, long pollInterval ) {
		try {
			while (!isDone(requests)) {
				Thread.sleep(pollInterval);
			}
		} catch (InterruptedException e) {	
			e.printStackTrace();
		}
	}
	
	private static boolean isDone(DataRequestFutureTask[] requests) {
		for (DataRequestFutureTask r : requests) {
			if (! r.isDone()) {
				return false;
			}
		}
		return true;
	}


}
