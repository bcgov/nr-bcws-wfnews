package ca.bc.gov.mof.wfpointid.identify;

public class RequestStats {

	private static final int NOT_SET = -1;
	
	long count;
	private int countError;
	long durTotal;
	long durMax;
	long durMin = NOT_SET;

	
	public synchronized void log(long duration, boolean success) {
		count++;
		if (! success) { countError++; }
		
		durTotal += duration;
		if (duration > durMax) { durMax = duration; }
		if (durMin < 0 || duration < durMin) { durMin = duration; }
	}

	public synchronized String report() {
		return String.format("Total: %d  Success: %d Err: %d -- Duration Avg: %d  Min: %d  Max: %d", 
				Long.valueOf(count), 
				Long.valueOf(count-countError), 
				Integer.valueOf(countError),
				Long.valueOf(durTotal/count), 
				Long.valueOf(durMin), 
				Long.valueOf(durMax));
	}

	public synchronized String reportDurationShort() {
		return String.format("%d (%d/%d)", Long.valueOf(getAvg()), Long.valueOf(getMin()), Long.valueOf(getMax()));
	}

	public long getCount() {
		return count;
	}

	public long getAvg() {
		return durTotal/count;
	}

	public long getMin() {
		return durMin;
	}

	public long getMax() {
		return durMax;
	}
}
