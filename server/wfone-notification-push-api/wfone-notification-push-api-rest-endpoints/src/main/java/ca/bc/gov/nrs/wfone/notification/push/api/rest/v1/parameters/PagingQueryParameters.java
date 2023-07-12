package ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.parameters;

import java.io.Serializable;

import ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.parameters.validation.constraints.PagingQueryParameterConstraints;

public class PagingQueryParameters implements PagingQueryParameterConstraints, Serializable {

	private static final long serialVersionUID = 1L;
	
	private String pageNumber;
	private String pageRowCount;
	
	public PagingQueryParameters() {}

	@Override
	public String getPageNumber() {
		return pageNumber;
	}

	public void setPageNumber(String pageNumber) {
		this.pageNumber = pageNumber;
	}

	@Override
	public String getPageRowCount() {
		return pageRowCount;
	}

	public void setPageRowCount(String pageRowCount) {
		this.pageRowCount = pageRowCount;
	}

}

