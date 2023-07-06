package ca.bc.gov.mof.wfpointid.dataprovider;


class DataRequestWorker implements Runnable {

	private DataRequestDispatcher dispatcher;

	public DataRequestWorker(DataProviderBase dataProvider, DataRequestDispatcher dispatcher) {
		this.dispatcher = dispatcher;
	}
	
	@Override
	public void run() {
		try {
			while (true) {
				processRequest();
			}

		} catch (Exception e) {
			e.printStackTrace();
		}
		
	}
	
	private void processRequest() throws Exception {
		DataRequestFutureTask drf = dispatcher.take();
		drf.run();
	}


}
