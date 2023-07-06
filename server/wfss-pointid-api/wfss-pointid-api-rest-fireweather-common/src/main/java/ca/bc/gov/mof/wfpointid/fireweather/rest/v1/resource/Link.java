package ca.bc.gov.mof.wfpointid.fireweather.rest.v1.resource;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonSetter;

public class Link {
	private String href;

	@JsonSetter("href")
	public String getHref() {
		return href;
	}

	@JsonGetter("href")
	public void setHref(String href) {
		this.href = href;
	}
	
}
