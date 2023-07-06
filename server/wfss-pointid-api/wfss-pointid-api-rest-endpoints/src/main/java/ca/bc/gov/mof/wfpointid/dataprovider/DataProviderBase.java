package ca.bc.gov.mof.wfpointid.dataprovider;

import ca.bc.gov.mof.wfpointid.ServiceBusyException;
import ca.bc.gov.mof.wfpointid.query.QueryPt;
import ca.bc.gov.mof.wfpointid.util.StringUtil;

public abstract class DataProviderBase implements DataProvider {

	private String name;
	private DataRequestDispatcher dispatcher;
	private int workerNum;

	public DataProviderBase(String name, int workerNum, int queueSize) {
		this.name = name;
		this.workerNum = workerNum;
		this.dispatcher = new DataRequestDispatcher(this, workerNum, queueSize);
		
		// error checking
		if (StringUtil.isEmpty(name)) {
			throw new RuntimeException(String.format("DataProvider name is empty"));
		}

	}

	@Override
	public String getName() {
		return name;
	}

	public int getWorkerNum() {
		return workerNum;
	}
	
	public DataRequestFutureTask execute(String id, QueryPt lonlat, Double radius, boolean useBufferedPoint, DataRequestDef dataQueryDef) throws ServiceBusyException {
		return dispatcher.queue(id, lonlat, radius, useBufferedPoint, dataQueryDef );
	}
	

	DataRequestWorker createWorker(DataRequestDispatcher d) {
		return new DataRequestWorker(this, d);
	}

	public abstract DataRequestCall prepareCall(DataRequest req) throws InterruptedException;
	

}
