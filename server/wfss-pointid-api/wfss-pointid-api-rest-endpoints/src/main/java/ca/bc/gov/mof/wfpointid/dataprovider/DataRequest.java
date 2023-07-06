package ca.bc.gov.mof.wfpointid.dataprovider;

import ca.bc.gov.mof.wfpointid.query.QueryPt;

public class DataRequest {

	private DataRequestDef dataQueryDef;
	private String id;
	private QueryPt pt;
	private Double radius;
	private boolean useBufferedPoint;
	
	public DataRequest(String id, QueryPt pt, Double radius, boolean useBufferedPoint,  DataRequestDef dataQueryDef) {
		this.id = id;
		this.pt = pt;
		this.radius = radius;
		this.useBufferedPoint = useBufferedPoint;
		this.dataQueryDef = dataQueryDef;
	}

	public DataRequestDef getDataRequestDef() {
		return dataQueryDef;
	}

	public String getId() {
		return id;
	}

	public QueryPt getQueryPt() {
		return pt;
	}

	public String toString() {
		return "DataRequest[" + id + "] " + dataQueryDef;
	}

	public Double getRadius() {
		return radius;
	}

	public void setRadius(Double radius) {
		this.radius = radius;
	}


	public boolean useBufferedPoint() {
		return useBufferedPoint;
	}
}
