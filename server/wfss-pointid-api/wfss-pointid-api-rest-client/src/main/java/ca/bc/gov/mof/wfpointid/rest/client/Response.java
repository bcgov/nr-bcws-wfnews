package ca.bc.gov.mof.wfpointid.rest.client;

public class Response<T> {
	private int responseCode;
	private T resource;
	private String contentType;
	private String filename;

	public Response(int responseCode, T resource) {
		this.responseCode = responseCode;
		this.resource = resource;
	}

	public Response(int responseCode, T resource, String contentType) {
		this.responseCode = responseCode;
		this.resource = resource;
		this.contentType = contentType;
	}

	public Response(int responseCode, T resource, String contentType, String filename) {
		this.responseCode = responseCode;
		this.resource = resource;
		this.contentType = contentType;
		this.filename = filename;
	}

	public int getResponseCode() {
		return responseCode;
	}

	public T getResource() {
		return resource;
	}

	public String getContentType() {
		return contentType;
	}

	public String getFilename() {
		return filename;
	}

}
