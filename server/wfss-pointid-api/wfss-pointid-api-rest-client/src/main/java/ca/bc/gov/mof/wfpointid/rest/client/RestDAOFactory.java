package ca.bc.gov.mof.wfpointid.rest.client;

public class RestDAOFactory {

	public static final String DEFAULT_CLIENT_VERSION_HEADER = null;

	public static final String DEFAULT_REQUEST_ID_HEADER = "requestId";

	public static final String DEFAULT_REQUEST_IDLOG4J_MDC_KEY = "requestId";

	protected String requestIdHeader;
	protected String log4jRequestIdMdcKey;

	private String clientVersion;
	
	public RestDAOFactory(String clientVersion) {
		this.clientVersion = clientVersion;
		this.requestIdHeader = DEFAULT_REQUEST_ID_HEADER;
		this.log4jRequestIdMdcKey = DEFAULT_REQUEST_IDLOG4J_MDC_KEY;
	}
	
	public <T> GenericRestDAO<T> getGenericRestDAO(Class<T> clazz) {
		GenericRestDAO<T> result = null;
		
		result = new SpringGenericRestDAO<T>(clazz, clientVersion, requestIdHeader, log4jRequestIdMdcKey);
		
		return result;
	}

	public void setRequestIdHeader(String requestIdHeader) {
		this.requestIdHeader = requestIdHeader;
	}

	public void setLog4jRequestIdMdcKey(String log4jRequestIdMdcKey) {
		this.log4jRequestIdMdcKey = log4jRequestIdMdcKey;
	}
}
