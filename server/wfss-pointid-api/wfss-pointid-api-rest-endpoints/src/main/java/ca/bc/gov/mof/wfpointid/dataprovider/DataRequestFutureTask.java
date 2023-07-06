package ca.bc.gov.mof.wfpointid.dataprovider;

import java.util.concurrent.Callable;
import java.util.concurrent.FutureTask;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.mof.wfpointid.util.Stopwatch;

public class DataRequestFutureTask extends FutureTask<DataResult> {

	static Logger LOG = LoggerFactory.getLogger(DataRequestFutureTask.class);
	
	final private DataRequest req;

	public static DataRequestFutureTask create(DataProvider dataProvider, DataRequest req) {
		return new DataRequestFutureTask(new DataRequestCallable(dataProvider, req), req);
	}
	
	DataRequestFutureTask(DataRequestCallable drc, DataRequest req) {
		super(drc);
		this.req=req;
	}

	public DataRequest getReq() {
		return req;
	}

	private static class DataRequestCallable implements Callable<DataResult> {

		private DataRequest req;
		private DataProvider dataProvider;

		DataRequestCallable(DataProvider dataProvider, DataRequest req) {
			this.dataProvider = dataProvider;
			this.req = req;
		}

		@Override
		public DataResult call() throws Exception {
			DataRequestCall drc = dataProvider.prepareCall(req);
			Stopwatch sw = new Stopwatch();
			LOG.trace( taskStamp() + " - request start");
			DataResult res = drc.perform(req);
			long dur = sw.getTime();
			LOG.trace( taskStamp() + " - request complete in " + dur);
			res.setDuration(dur);
			return res;
		}
		
		String taskStamp() {
			String s = dataProvider.getName() + " Thread-" + Thread.currentThread().getId() + " time=" + System.currentTimeMillis();
			return s;
		}	}

}
