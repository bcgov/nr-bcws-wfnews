package ca.bc.gov.mof.wfpointid.fireweather.rest.v1.resource;

import java.util.List;

public abstract class Page<T> {
	List<T> items;
	public List<T> getItems() {
		return items;
	}

	public void setItems(List<T> items) {
		this.items = items;
	}
	
	public abstract boolean isLast();
	public abstract int getTotal();
}
