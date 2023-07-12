package ca.bc.gov.mof.wfpointid.rest.resource;

public class HeaderConstants {

	public static final String VERSION_HEADER = "Rest-Version";
	public static final String VERSION_HEADER_DESCRIPTION = "The version of the Rest API supported by the requesting client.";

	public static final String IF_MATCH_HEADER = "If-Match";
	public static final String IF_MATCH_DESCRIPTION = "The If-Match request-header must match the current eTag of the resource or the request will fail.";

	public static final String ETAG_HEADER = "ETag";
	public static final String ETAG_DESCRIPTION = "The ETag response-header field provides the current value of the entity tag for the requested variant.";

	public static final String REQUEST_ID_HEADER = "RequestId";
	
	public static final String ORIGIN_HEADER = "Origin";
	public static final String CONTENT_TYPE_HEADER = "Content-Type";
	public static final String ACCEPT_HEADER = "Accept";
	public static final String AUTHORIZATION_HEADER = "Authorization";
}
