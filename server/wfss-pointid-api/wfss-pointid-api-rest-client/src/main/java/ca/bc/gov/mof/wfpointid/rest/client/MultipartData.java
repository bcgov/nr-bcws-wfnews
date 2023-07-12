package ca.bc.gov.mof.wfpointid.rest.client;

import java.io.Serializable;

public class MultipartData implements Serializable {

	private static final long serialVersionUID = 1L;

	private String fileName;
	private String contentType;
	private byte[] bytes;

	public MultipartData() {
	}

	public MultipartData(String fileName, String contentType, byte[] bytes) {
		this.fileName = fileName;
		this.contentType = contentType;
		this.bytes = bytes;
	}

	public String getFileName() {
		return fileName;
	}

	public void setFileName(String fileName) {
		this.fileName = fileName;
	}

	public String getContentType() {
		return contentType;
	}

	public void setContentType(String contentType) {
		this.contentType = contentType;
	}

	public byte[] getBytes() {
		return bytes;
	}

	public void setBytes(byte[] bytes) {
		this.bytes = bytes;
	}
}
