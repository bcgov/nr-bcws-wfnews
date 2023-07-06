package ca.bc.gov.mof.wfpointid.query;

import ca.bc.gov.mof.wfpointid.dataprovider.DataRequestDef;


public class QueryDef {

	private DataRequestDef[] dataRequestDef;

	public QueryDef(DataRequestDef[] drd) {
		this.dataRequestDef = drd;
	}

	public DataRequestDef[] getDataQueries() {
		return dataRequestDef;
	}


}
