package ca.bc.gov.mof.wfpointid.dataprovider.mock;

import ca.bc.gov.mof.wfpointid.dataprovider.DataProviderBase;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequest;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequestCall;

public class MockDataProvider extends DataProviderBase {

	public static final int MOCK_COMPUTE_TIME = 500;
	
	public MockDataProvider(String name, int workerNum, int queueSize) {
		super(name, workerNum, queueSize);
	}


	public DataRequestCall prepareCall(DataRequest req) throws InterruptedException {
		return new MockDataRequestCall(this);
	}


}
