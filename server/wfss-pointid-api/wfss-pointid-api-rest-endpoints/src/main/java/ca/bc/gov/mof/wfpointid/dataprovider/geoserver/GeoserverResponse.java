package ca.bc.gov.mof.wfpointid.dataprovider.geoserver;

import ca.bc.gov.mof.wfpointid.util.RegExUtil;

public class GeoserverResponse {

	private static final String SERVICE_EXCEPTION_REPORT = "<ServiceExceptionReport";
	private static final String OWS_EXCEPTION_REPORT = "<ows:ExceptionReport";
	
	private static final String REGEX_OWS_EXCEPTION = "<ows:ExceptionText>" 
			+ "(.+?)"
			+ "</ows:ExceptionText>";
	
	private static final String REGEX_SERVICE_EXCEPTION = "<ServiceException[\\s\\>].+?>" 
			+ "(.+?)"
			+ "</ServiceException>";
	
	static final String FRAGMENT_FEATURE_MEMBER = "<gml:featureMember";
	
	private String xml;
	
	public GeoserverResponse(String response) {
		this.xml = response;
	}

	public boolean hasGMLFeatures() {
		return xml.contains(FRAGMENT_FEATURE_MEMBER);
	}
	
	public String exceptionMsg() {
		/**
		 * Handle both exception formats
		 */
		String regex = REGEX_OWS_EXCEPTION;
		if (xml.contains(SERVICE_EXCEPTION_REPORT)) {
			regex = REGEX_SERVICE_EXCEPTION;
		}
		return RegExUtil.extract(xml, regex).trim();
	}

	public boolean isException() {
		return xml.contains(OWS_EXCEPTION_REPORT)
				|| xml.contains(SERVICE_EXCEPTION_REPORT);
	}

	/**
	 * Gets value of response attribute if present, or null if not present.
	 * 
	 * @param gml
	 * @param attrName
	 * @return value of attribute
	 * @return null if attribute not present
	 */
	public String extractGMLPropertyValue(String attrName) {
		String regex = attrName + ">" 
				+ "(.+?)"
				+ "<";
		String val = RegExUtil.extract(xml, regex);
		return val;
	}


}
