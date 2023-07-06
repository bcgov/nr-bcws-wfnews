package ca.bc.gov.mof.wfpointid.weather.util;

public class TimeRange {
	private final String startStamp;
	private final String endStamp;
	private final long startMillis;
	private final long endMillis;
	private final int duration;
	
	TimeRange(String startStamp, String endStamp, long startMillis, long endMillis, int duration) {
		super();
		this.startStamp = startStamp;
		this.endStamp = endStamp;
		this.startMillis = startMillis;
		this.endMillis = endMillis;
		this.duration = duration;
	}

	public String getStartStamp() {
		return startStamp;
	}

	public String getEndStamp() {
		return endStamp;
	}

	public long getStartMillis() {
		return startMillis;
	}

	public long getEndMillis() {
		return endMillis;
	}

	public int getDuration() {
		return duration;
	}
}
