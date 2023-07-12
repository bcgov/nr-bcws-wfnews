package ca.bc.gov.mof.wfpointid.dataprovider.wfnews;

import ca.bc.gov.mof.wfpointid.dataprovider.DataProviderBase;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequest;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequestCall;
import ca.bc.gov.mof.wfpointid.rest.client.v1.impl.WildfireNewsServiceImpl;

public class WildfireNewsDataProvider extends DataProviderBase {
		
	private WildfireNewsServiceImpl service;
	
	public static WildfireNewsDataProvider create (String name, String baseUrl, int workerNum, int queueSize) {
		return new WildfireNewsDataProvider(name, baseUrl, workerNum, queueSize);
	}
	
	public WildfireNewsDataProvider(String name, String baseUrl, int workerNum, int queueSize) {
		super(name, workerNum, queueSize);
		
		this.service = new WildfireNewsServiceImpl();
		this.service.setTopLevelRestURL(baseUrl);
	}

	public DataRequestCall prepareCall(DataRequest req) throws InterruptedException {
		return new WildfireNewsDataRequestCall(this);
	}
	
	public String toString() {
		return String.format("Fireweather Data Provider %s (workers = %d)", getName(), Integer.valueOf(getWorkerNum()));
	}

	public WildfireNewsServiceImpl getService() {
		return service;
	}
}

