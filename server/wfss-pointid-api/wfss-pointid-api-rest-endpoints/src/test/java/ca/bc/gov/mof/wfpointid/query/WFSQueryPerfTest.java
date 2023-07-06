package ca.bc.gov.mof.wfpointid.query;

import ca.bc.gov.mof.wfpointid.ServiceBusyException;
import ca.bc.gov.mof.wfpointid.dataprovider.DataItemDef;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequestDef;
import ca.bc.gov.mof.wfpointid.dataprovider.geoserver.GeoserverDataProvider;

public class WFSQueryPerfTest {

	public static final int THREAD_NUM = 8;
	
	private static final int REQUEST_WAIT_TIME = 1000;

	static WFSQueryPerfTest TEST;
	
	public static void main(String[] args) {
		TEST = new WFSQueryPerfTest();
		try {
			TEST.testQueryN();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	ServiceRequestDispatcher[] srds;

	public void testQueryN() {

		QueryEngine engine = new QueryEngine();
		engine.addProvider(GeoserverDataProvider.create("WF_GEO_T", "https://wf1geot.nrs.gov.bc.ca/geoserver/wfs", 4, 1000));
		srds = new ServiceRequestDispatcher[THREAD_NUM];
		for (int i = 0; i < THREAD_NUM; i++) {
			srds[i] = runQuery(engine, i * REQUEST_WAIT_TIME);
		}

	}

	public void report() {
		long totalTime = 0;
		long maxTime = 0;
		int count = 0;
		for (ServiceRequestDispatcher srd : srds) {
			long dur = srd.getTotalDuration();
			totalTime += dur;
			
			long max = srd.getMaxTime();
			if (max > maxTime ) { maxTime = max; }
			
			count += srd.getCount();
		}
		double avgTime = (totalTime / (double) count);
		System.out.println("================  Service Stats:  "
				+" Count: " + count
				+ " Avg time: " + avgTime
				+ " Max time: " + maxTime
				);
	}
	
	private ServiceRequestDispatcher runQuery(QueryEngine engine, int sleepTime) {
		QueryPt pt =  QueryPt.create( -123.83775, 49 );
		boolean useBufferedPoint = true;

		DataRequestDef[] dqd = new DataRequestDef[] {
				DataRequestDef.request("WF_GEO_T", "FIRE_CENTRE_ADMIN_AREA_SVW", "GEOMETRY", 10000, DataItemDef.item("WILDFIRE_ORG_UNIT_ID", "CENTRE")),	
				DataRequestDef.request("WF_GEO_T", "FIRE_ZONE_ADMIN_AREA_SVW", "GEOMETRY", 10000, DataItemDef.item("ZONE_NAME") ),	
				DataRequestDef.request("WF_GEO_T", "BNDY_FIRE_DEPARTMENTS", "SHAPE", 10000, DataItemDef.item("FIRE_DPT"))
		};

		QueryDef qd = new QueryDef(dqd);
		ServiceRequestDispatcher srd = new ServiceRequestDispatcher(engine, qd,
				pt, useBufferedPoint, sleepTime);

		Thread t = new Thread(srd);
		t.start();
		return srd;
	}

	class ServiceRequestDispatcher implements Runnable {

		QueryEngine engine;
		QueryDef qd;
		private int sleepTime;
		private long totalTime = 0;
		private long maxTime = 0;
		private int count = 0;
		private QueryPt pt;
		private boolean useBufferedPoint;

		public ServiceRequestDispatcher(QueryEngine engine, QueryDef qd,
				QueryPt pt, boolean useBufferedPoint, int sleepTime) {
			this.engine = engine;
			this.qd = qd;
			this.pt = pt;
			this.useBufferedPoint = useBufferedPoint;
			this.sleepTime = sleepTime;
		}

		public int getCount() {

			return count;
		}

		public long getTotalDuration() {

			return totalTime;
		}

		public long getMaxTime() {
			return maxTime;
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
			QueryResult result = engine.query(pt, null, useBufferedPoint, qd);
			long dur = result.getDuration();
			if (dur > maxTime) { maxTime = dur; }
			totalTime += dur;
			count++;
			System.out.println();
			System.out.println("[time=" + dur+ "] " + result);
			
			TEST.report();

		}

	}
}
