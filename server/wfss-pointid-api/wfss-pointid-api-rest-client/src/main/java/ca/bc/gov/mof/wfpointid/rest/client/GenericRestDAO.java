package ca.bc.gov.mof.wfpointid.rest.client;

import java.util.HashMap;
import java.util.Map;

import org.apache.commons.collections4.MultiValuedMap;

import org.springframework.web.client.RestTemplate;

import ca.bc.gov.mof.wfpointid.rest.resource.transformers.Transformer;

public abstract class GenericRestDAO<T> {
	
	private Class<T> clazz;
	private String clientVersion;
	private String requestIdHeader;
	private String log4jRequestIdMdcKey;

	public GenericRestDAO(Class<T> clazz, String clientVersion, String requestIdHeader, String log4jRequestIdMdcKey) {
		this.clazz = clazz;
		this.clientVersion = clientVersion;
		this.requestIdHeader = requestIdHeader;
		this.log4jRequestIdMdcKey = log4jRequestIdMdcKey;
	}
	
	public abstract Response<T> Process(Transformer transformer, String urlString, String method, String eTag, Object resource, MultipartData[] files, Map<String,String> headerParams, MultiValuedMap<String,String> queryParams, RestTemplate restTemplate) throws RestDAOException;

	protected Map<String, String> parseHeaderDirectives(String contentDisposition) {
		Map<String, String> result = new HashMap<String, String>();
		
		if(contentDisposition!=null&&contentDisposition.trim().length()>0) {
			
			String[] directives = contentDisposition.split(";");
			for(String directive:directives) {

				if(directive.indexOf("=")!=-1) {
					
					String[] pair = directive.split("=");
					if(pair.length==2) {
						
						String name = pair[0].trim();
						String value = pair[1].trim();
						result.put(name, value);
					}
				}
			}
		}
		
		return result;
	}	
	
	@SuppressWarnings({ "unchecked", "hiding" })
	protected <T> T cast(Object item) {
		return (T)item;
	}

	protected Class<T> getClazz() {
		return clazz;
	}

	protected String getClientVersion() {
		return clientVersion;
	}

	protected String getRequestIdHeader() {
		return requestIdHeader;
	}

	protected String getLog4jRequestIdMdcKey() {
		return log4jRequestIdMdcKey;
	}
	
}
