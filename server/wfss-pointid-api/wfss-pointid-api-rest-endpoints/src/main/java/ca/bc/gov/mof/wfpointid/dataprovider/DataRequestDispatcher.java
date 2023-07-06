package ca.bc.gov.mof.wfpointid.dataprovider;

import java.util.ArrayList;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;

import ca.bc.gov.mof.wfpointid.ServiceBusyException;
import ca.bc.gov.mof.wfpointid.query.QueryPt;

class DataRequestDispatcher {

	private int workerNum;
	private BlockingQueue<DataRequestFutureTask> requestQueue;
	private ArrayList<DataRequestWorker> workers;
	private DataProviderBase dataProvider;

	public DataRequestDispatcher(DataProviderBase dataProvider, int workerNum, int queueSize) {
		this.dataProvider = dataProvider;
		this.workerNum = workerNum;
		requestQueue = new ArrayBlockingQueue<DataRequestFutureTask>(queueSize);
		createWorkers();
	}
	
	private void createWorkers() {
		workers = new ArrayList<DataRequestWorker>(workerNum);
		for (int i = 0; i < workerNum; i++) {
			 DataRequestWorker worker = createWorker(this);
			 workers.add(i, worker);
			 Thread t = new Thread(worker);
			 t.start();
		}
	}

	private DataRequestWorker createWorker(
			DataRequestDispatcher dataRequestDispatcher) {

		return new DataRequestWorker(dataProvider, this);
	}
	
	public DataRequestFutureTask queue(String id, QueryPt lonlat, Double radius, boolean useBufferedPoint, DataRequestDef dataQueryDef) throws ServiceBusyException {
		DataRequest req = new DataRequest(id, lonlat, radius, useBufferedPoint, dataQueryDef);
		DataRequestFutureTask drf = DataRequestFutureTask.create(dataProvider, req);
		try {
			requestQueue.add(drf);
		} catch (IllegalStateException e) {
			throw new ServiceBusyException(dataQueryDef.getProviderName(), e);
		}
		return drf;
	}
	

	public DataRequestFutureTask take() throws InterruptedException {
		return requestQueue.take();
	}

	
}
