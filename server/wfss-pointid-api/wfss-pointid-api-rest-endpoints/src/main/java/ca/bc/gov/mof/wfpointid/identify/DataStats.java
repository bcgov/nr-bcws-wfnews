package ca.bc.gov.mof.wfpointid.identify;

import java.util.Collection;
import java.util.TreeMap;

public class DataStats {

	TreeMap<String, RequestStats> dataStat = new TreeMap<String, RequestStats>();
	
	public synchronized void log(String name, long duration) {
		if (!dataStat.containsKey(name)) {
			dataStat.put(name, new RequestStats());
		}
		RequestStats st = dataStat.get(name);
		st.log(duration, true);
	}
	
	public synchronized String report() {
		StringBuilder sb = new StringBuilder();
		Collection<String> names = dataStat.keySet();
		for (String name: names) {
			RequestStats st = dataStat.get(name);
			if (sb.length() > 0) sb.append(",");
			sb.append(
					String.format("%s: %s", name, st.reportDurationShort()));
		}
		return sb.toString();
	}
	
}
