package ca.bc.gov.mof.wfpointid.dataprovider;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class DataResult {
	
	private static Logger LOG = LoggerFactory.getLogger(DataResult.class);

	public static final String RESULT_VALUE_EMPTY = "";

	public static boolean isValueEmpty(String val) {
		return RESULT_VALUE_EMPTY.equalsIgnoreCase(val);
	}

	private DataRequestDef dataDef;
	private Object[] value;
	private long duration;
	private boolean isSuccess = true;
	private boolean hasData = false;
	private String errMsg = "";
	private List<Map<String, String>> mappedValues = Collections.emptyList();

	public static DataResult createValue(DataRequestDef dataQueryDef, Object val) {
		DataResult res = new DataResult(dataQueryDef);
		res.setValue(val);
		res.isSuccess = true;
		return res;
	}
	
	public static DataResult createValue(DataRequestDef dataQueryDef, Object[] val) {
		DataResult res = new DataResult(dataQueryDef);
		res.setValues(val);
		res.isSuccess = true;
		return res;
	}
	
	public static DataResult createNoData(DataRequestDef dataQueryDef) {
		DataResult res = new DataResult(dataQueryDef);
		res.hasData = false;
		return res;
	}
	
	public static DataResult createError(DataRequestDef dataQueryDef, String errMsg) {
		LOG.info(">DataResult-createError");
		DataResult res = new DataResult(dataQueryDef);
		res.isSuccess = false;
		res.errMsg = errMsg;
		res.setValues(new Object[dataQueryDef.getItems().length]);
		LOG.info("<DataResult-createError");
		return res;
	}
		
	DataResult(DataRequestDef dataQueryDef) {
		this.dataDef = dataQueryDef;
	}
	
	void setValue(Object val) {
		value = new Object[] { val };
		hasData = true;
	}

	void setValues(Object[] val) {
		value = val;
		hasData = true;
	}
	
	public DataRequestDef getDataRequestDef() {
		return dataDef;
	}
	
	public long getDuration() {
		return duration;
	}

	public void setDuration(long duration) {
		this.duration = duration;
	}

	public boolean isSuccess() {
		return isSuccess;
	}

	public boolean hasData() {
		return hasData;
	}

	public String getErrMsg() {
		return errMsg;
	}

	public String toString() {
		String result = "";
		if (value != null) result = toValuesList();
		
		if (! hasData) {
			result = "<NO DATA>";
		}
		if (! isSuccess) {
			result = "<FAIL:" + errMsg + ">";
		}
		return "[" + duration + "ms] " + result;
	}

	public String toValuesList() {
		StringBuilder sb = new StringBuilder();
		DataItemDef[] items = dataDef.getItems();
		for (int i = 0; i < items.length; i++) {
			if (sb.length() > 0)
				sb.append(", ");
			if (i >= value.length) {
				sb.append(items[i].getName() + "=" + null);
			} else {
				sb.append(items[i].getName() + "=" + value[i]);
			}
		}
		return sb.toString();
	}
	
	public Object getValue(int i) {
		return value[i];
	}
	public Object[] getValue() {
		return value;
	}

	public List<Map<String, String>> getMappedValues() {
		return mappedValues;
	}

	public void setMappedValues(List<Map<String, String>> mappedValues) {
		this.mappedValues = mappedValues;
	}
}
