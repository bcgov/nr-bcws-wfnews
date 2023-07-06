package ca.bc.gov.mof.wfpointid.identify;

import ca.bc.gov.mof.wfpointid.Messages;
import ca.bc.gov.mof.wfpointid.query.QueryPt;
import ca.bc.gov.mof.wfpointid.query.QueryResult;
import ca.bc.gov.mof.wfpointid.rest.model.QueryResource;

public abstract class IdentifyQuery {
	
	static final String SHAPE = "SHAPE";
	public static final String GEOMETRY = "GEOMETRY";
	
	public abstract QueryResource createResource(QueryPt pt, QueryResult queryResult);
	
	protected void setMetadata(QueryPt pt, QueryResult queryResult,  QueryResource result) {
		result.setLon(pt.getLon());
		result.setLat(pt.getLat());
		result.setErrorCount(queryResult.getErrorCount());
		if (queryResult.getErrorCount() > 0) {
			result.setErrorMsg(Messages.ERROR_IDENTIFY_DATA);
			result.setErrorDetail(queryResult.getErrorMsg());
		}

	}
	

}
