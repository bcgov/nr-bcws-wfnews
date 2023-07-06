package ca.bc.gov.mof.wfpointid.test.tasktester;

public class Stat {
	
	public final static int COMPLETE = 1;
	public final static int ERROR = 2;
	
	private long durTotal = 0;
	private long durMin = -1;
	private long durMax = 0;
	private long taskTotal = 0;
	private long complete = 0;
	private long error = 0;
	
	public synchronized void status(long duration, boolean isOK) {
		
		durTotal += duration;
		if (duration > durMax) durMax = duration;
		if (durMin < 0 || duration < durMin) durMin = duration;
		
		taskTotal++;
		if (! isOK) {
			error++;
		}
		else {
			complete++;
		}
	}
	
	public synchronized String report() {
		return String.format("Total: %d  Complete: %d Err: %d -- Duration Avg: %d  Min: %d  Max: %d", 
				Long.valueOf(taskTotal), 
				Long.valueOf(complete), 
				Long.valueOf(error),
				Long.valueOf(durTotal/taskTotal), 
				Long.valueOf(durMin), 
				Long.valueOf(durMax));
	}
	
}
