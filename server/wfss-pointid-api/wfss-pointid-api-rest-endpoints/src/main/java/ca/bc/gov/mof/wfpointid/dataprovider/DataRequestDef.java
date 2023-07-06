package ca.bc.gov.mof.wfpointid.dataprovider;

import org.apache.commons.lang3.ArrayUtils;

public class DataRequestDef {

	public static DataRequestDef request(String providerName,
			String datasetName,
			int timeout,
			DataItemDef[] items) {
		return new DataRequestDef(providerName, null, datasetName, null, timeout, items);
	}

	public static DataRequestDef request(String providerName,
			String datasetName,
			int timeout,
			DataItemDef item) {
		return new DataRequestDef(providerName, null, datasetName, null, timeout, new DataItemDef[] { item } );
	}
	
	public static DataRequestDef request(String providerName,
			String datasetName,
			String geomName, 
			int timeout,
			DataItemDef item) {
		return request(providerName, datasetName, geomName, timeout, new DataItemDef[] { item } );
	}

	public static DataRequestDef request(String providerName,
			String datasetName,
			String geomName, 
			int timeout,
			DataItemDef[] items) {
		return new DataRequestDef(providerName, null, datasetName, geomName, timeout, items);
	}
	
	public static DataRequestDef request(String providerName,
			String requestType,
			String datasetName,
			String geomName, 
			int timeout,
			DataItemDef item) {
		return new DataRequestDef(providerName, requestType, datasetName, geomName, timeout, new DataItemDef[] { item });
	}
	
	public static DataRequestDef request(String providerName,
			String requestType,
			String datasetName,
			String geomName, 
			int timeout,
			DataItemDef[] items) {
		return new DataRequestDef(providerName, requestType, datasetName, geomName, timeout, items);
	}
	

	protected String providerName;
	protected String datasetName;
	private String geomName;
	protected DataItemDef[] items;
	protected int timeout;
	private String requestType;
	
	public DataRequestDef(
			String providerName,
			String requestType,
			String datasetName,
			String geomName,
			int timeout,
			DataItemDef[] items
			) {
		this.providerName = providerName;
		this.requestType = requestType;
		this.datasetName = datasetName;
		this.geomName = geomName;
		this.timeout = timeout;
		this.items = items;
	}

	public String getProviderName() {
		return providerName;
	}

	public String getRequestType() {
		return requestType;
	}

	public String getDatasetName() {
		return datasetName;
	}

	public void setDatasetName(String datasetName) {
		this.datasetName = datasetName;
	}

	public int getTimeout() {
		return timeout;
	}
	
	public DataItemDef[] getItems() {
		return items;
	}

	public String toString() {
		return providerName	+ ":" +  datasetName;
	}

	public String getGeometryName() {
		return geomName;
	}
	
	public String getAttributeNameList() {
		StringBuilder sb = new StringBuilder();
		for (DataItemDef dd : items) {
			if (sb.length() > 0) sb.append(",");
			sb.append(dd.getAttributeName());
		}
		return sb.toString();
	}
	
	public void addDateItemDefs(DataItemDef newDataItemDef) {
		ArrayUtils.add(this.items, newDataItemDef);
	}
}
