package ca.bc.gov.nrs.wfnews.persistence.v1.dto;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class PagedDtos<T extends BaseDto<?>> implements Serializable {

	private static final long serialVersionUID = 1L;

	private List<T> results;
	
	private int pageNumber;
	
	private int pageRowCount;
	
	private int totalRowCount;
	
	public PagedDtos() {
		this.results = new ArrayList<T>();
	}

	public List<T> getResults() {
		return results;
	}

	public void setResults(List<T> results) {
		this.results = results;
	}

	public int getPageNumber() {
		return pageNumber;
	}

	public void setPageNumber(int pageNumber) {
		this.pageNumber = pageNumber;
	}

	public int getPageRowCount() {
		return pageRowCount;
	}

	public void setPageRowCount(int pageRowCount) {
		this.pageRowCount = pageRowCount;
	}

	public int getTotalRowCount() {
		return totalRowCount;
	}

	public void setTotalRowCount(int totalRowCount) {
		this.totalRowCount = totalRowCount;
	}

}
