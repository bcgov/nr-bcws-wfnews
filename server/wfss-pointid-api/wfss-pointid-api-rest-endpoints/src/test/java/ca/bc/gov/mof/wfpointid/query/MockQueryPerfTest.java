package ca.bc.gov.mof.wfpointid.query;

import ca.bc.gov.mof.wfpointid.ServiceBusyException;
import ca.bc.gov.mof.wfpointid.dataprovider.DataItemDef;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequestDef;
import ca.bc.gov.mof.wfpointid.dataprovider.mock.MockDataProvider;

public class MockQueryPerfTest {

	public static final int THREAD_NUM = 20;
	
	private static final int REQUEST_WAIT_TIME = 500;

	static MockQueryPerfTest TEST;
	
	public static void main(String[] args) {
		TEST = new MockQueryPerfTest();
		try {
			TEST.testQueryN();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	

	ServiceRequestDispatcher[] srds;

	public void testQueryN() {

		QueryEngine engine = new QueryEngine();
		engine.addProvider(new MockDataProvider("MOCK1", 10, 1000));
		engine.addProvider(new MockDataProvider("MOCK2", 10, 1000));
		engine.addProvider(new MockDataProvider("MOCK3", 10, 1000));

		srds = new ServiceRequestDispatcher[THREAD_NUM];
		for (int i = 0; i < THREAD_NUM; i++) {
			srds[i] = runQuery(engine, i * REQUEST_WAIT_TIME);
		}

	}

	public void report() {
		long totalDur = 0;
		int count = 0;
		for (ServiceRequestDispatcher srd : srds) {
			totalDur += srd.getTotalDuration();
			count += srd.getCount();
		}
		double avgDur = (totalDur / (double) count);
		System.out.println("Service Stats:  "
				+" count = " + count
				+ " avg dur = " + avgDur);
	}
	
	private ServiceRequestDispatcher runQuery(QueryEngine engine, int sleepTime) {
		double[] lonlat = new double[] { -123, 49 };
		boolean useBufferedPoint = true;

		DataRequestDef[] dqd = new DataRequestDef[] {
				DataRequestDef.request("MOCK1", "ds1", "geom", 500, DataItemDef.item("attr1") ),
				DataRequestDef.request("MOCK1", "ds2", "geom", 500, DataItemDef.item("attr2") ),
				DataRequestDef.request("MOCK2", "ds3", "geom", 500, DataItemDef.item("attr4") ),
				DataRequestDef.request("MOCK2", "ds3", "geom", 500, DataItemDef.item("attr5",  "ATTR_3") ),
				DataRequestDef.request("MOCK3", "ds2", "geom", 500, DataItemDef.item("attr3",  "ATTR_2") ),
				DataRequestDef.request("MOCK3", "ds3", "geom", 500, DataItemDef.item("attr6",  "ATTR_3") ) 
				};

		QueryDef qd = new QueryDef(dqd);
		ServiceRequestDispatcher srd = new ServiceRequestDispatcher(engine, qd,
				lonlat, useBufferedPoint, sleepTime);

		Thread t = new Thread(srd);
		t.start();
		return srd;
	}

	class ServiceRequestDispatcher implements Runnable {

		QueryEngine engine;
		QueryDef qd;
		private double[] lonlat;
		private boolean useBufferedPoint;
		private int sleepTime;
		private long totalDur = 0;
		private int count = 0;

		public ServiceRequestDispatcher(QueryEngine engine, QueryDef qd,
				double[] lonlat, boolean useBufferedPoint, int sleepTime) {
			this.engine = engine;
			this.qd = qd;
			this.lonlat = lonlat;
			this.sleepTime = sleepTime;
		}

		public int getCount() {

			return count;
		}

		public long getTotalDuration() {

			return totalDur;
		}

		@Override
		public void run() {
			while (true) {
				System.out.println("Issuing request");
				try {
					issueRequest();
				} catch (ServiceBusyException e1) {
					e1.printStackTrace();
				}

				try {
					Thread.sleep(sleepTime);
				} catch (InterruptedException e) {
					// do nothing
				}
			}

		}

		private void issueRequest() throws ServiceBusyException {
			
			QueryResult result = engine.query(QueryPt.create(lonlat), null, useBufferedPoint, qd);
			totalDur += result.getDuration();
			count++;
			System.out.println();
			System.out.println("[time=" + result.getDuration() + "] " + result);
			
			TEST.report();

		}

	}

}
