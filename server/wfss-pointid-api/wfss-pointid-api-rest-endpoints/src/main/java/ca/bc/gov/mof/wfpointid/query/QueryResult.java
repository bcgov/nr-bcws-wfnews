package ca.bc.gov.mof.wfpointid.query;

import java.util.HashSet;

import ca.bc.gov.mof.wfpointid.dataprovider.DataItemDef;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequestDef;
import ca.bc.gov.mof.wfpointid.dataprovider.DataResult;
import ca.bc.gov.mof.wfpointid.util.TypeUtil;

public class QueryResult {

	private int errorCount = 0;
	private String errorMsg = "";
	private long duration;
	private DataResult[] dataResults;
	private String id;

	public QueryResult(String id, DataResult[] dataResults) {
		this.id = id;
		this.dataResults = dataResults;
		updateStatus();
	}

	private void updateStatus() {
		HashSet<String> msgs = new HashSet<String>();
		for (DataResult dr : dataResults) {
			if (! dr.isSuccess()) {
				errorCount++;
				msgs.add(dr.getErrMsg());
			}
		}
		// create string list of unique error msgs
		if (errorCount > 0) errorMsg = join(msgs, "; "); 
	}

	private static String join(HashSet<String> msgs, String sep) {
		StringBuilder sb = new StringBuilder();
		for (String s : msgs) {
			sb.append(s);
			sb.append(sep);
		}
		return sb.toString();
	}

	public String getErrorMsg() {
		return errorMsg;
	}

	public boolean isSuccess() {
		return errorCount == 0;
	}

	public int getErrorCount() {
		return errorCount;
	}
	public DataResult[] getDataResults() {
		return dataResults;
	}

	public long getDuration() {
		return duration;
	}

	public void setDuration(long duration) {
		this.duration = duration;
	}

	public String getId() {
		return id;
	}

	public String toString() {
		StringBuilder sb = new StringBuilder();
		sb.append("QueryResult["+id +"]");
		
		String statusMsg = isSuccess() ? " OK " : "FAIL";
		sb.append( " " + statusMsg + " ");
		
		for (DataResult dr : dataResults) {
			sb.append(dr);	
			sb.append("; ");	
		}
		return sb.toString();

	}

	public String toReportString() {
		StringBuilder sb = new StringBuilder();
		sb.append("QueryResult["+id +"]");
		
		String statusMsg = isSuccess() ? " OK " : "FAIL";
		sb.append( " " + statusMsg + " ");
		sb.append( "\n");
		
		sb.append( " " + getErrorMsg() + " ");		
		sb.append( "\n");
		
		for (DataResult dr : dataResults) {
			sb.append(dr);	
			sb.append("\n");	
		}
		return sb.toString();

	}

	public Object getValue(String dataName) {
		for (DataResult dr : dataResults) {			
			DataRequestDef qd = dr.getDataRequestDef();
			DataItemDef[] items = qd.getItems();
			for (int i = 0; i < items.length; i++) {
				if (items[i].getName().equals(dataName)) {
					return dr.getValue(i);
				}
			}
		}
		return null;
	}

	public Integer getValueAsInteger(String dataname) {
		Object v = getValue(dataname);
		return TypeUtil.toInteger(v);
	}
	
	public DataResult findResultFor(String dataName) {
		for (DataResult dr : dataResults) {			
			DataRequestDef qd = dr.getDataRequestDef();
			DataItemDef[] items = qd.getItems();
			for (int i = 0; i < items.length; i++) {
				if (items[i].getName().equals(dataName)) {
					return dr;
				}
			}
		}
		return null;
	}

}
