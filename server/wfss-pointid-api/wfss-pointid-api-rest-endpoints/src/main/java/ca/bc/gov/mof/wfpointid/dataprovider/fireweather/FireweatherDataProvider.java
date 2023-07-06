package ca.bc.gov.mof.wfpointid.dataprovider.fireweather;

import ca.bc.gov.mof.wfpointid.dataprovider.DataProviderBase;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequest;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequestCall;
import ca.bc.gov.mof.wfpointid.fireweather.rest.client.v1.impl.WildfireFireweatherServiceImpl;

public class FireweatherDataProvider extends DataProviderBase {
		
	private WildfireFireweatherServiceImpl service;
	
	public static FireweatherDataProvider create (String name, String baseUrl, String webadeOauth2ClientId, String webadeOauth2ClientSecret, String webadeOauth2TokenUrl, String scopes, int workerNum, int queueSize) {
		return new FireweatherDataProvider(name, baseUrl, webadeOauth2ClientId, webadeOauth2ClientSecret, webadeOauth2TokenUrl, scopes, workerNum, queueSize);
	}
	
	public FireweatherDataProvider(String name, String baseUrl, String webadeOauth2ClientId, String webadeOauth2ClientSecret, String webadeOauth2TokenUrl, String scopes, int workerNum, int queueSize) {
		super(name, workerNum, queueSize);
		
		this.service = new WildfireFireweatherServiceImpl(webadeOauth2ClientId, webadeOauth2ClientSecret, webadeOauth2TokenUrl, scopes);
		this.service.setTopLevelRestURL(baseUrl);
	}

	public DataRequestCall prepareCall(DataRequest req) throws InterruptedException {
		return new FireweatherDataRequestCall(this);
	}
	
	public String toString() {
		return String.format("Fireweather Data Provider %s (workers = %d)", getName(), Integer.valueOf(getWorkerNum()));
	}

	public WildfireFireweatherServiceImpl getService() {
		return service;
	}
}

