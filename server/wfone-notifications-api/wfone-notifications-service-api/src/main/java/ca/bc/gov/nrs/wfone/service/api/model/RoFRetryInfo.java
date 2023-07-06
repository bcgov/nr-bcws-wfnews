package ca.bc.gov.nrs.wfone.service.api.model;

import java.time.LocalDateTime;

public class RoFRetryInfo {
	
	private String rofCacheGuid;
	private int retries;
	private LocalDateTime nextRetry;
	
	public String getRofCacheGuid() {
		return rofCacheGuid;
	}
	public void setRofCacheGuid(String rofCacheGuid) {
		this.rofCacheGuid = rofCacheGuid;
	}
	public int getRetries() {
		return retries;
	}
	public void setRetries(int retries) {
		this.retries = retries;
	}
	public LocalDateTime getNextRetry() {
		return nextRetry;
	}
	public void setNextRetry(LocalDateTime nextRetry) {
		this.nextRetry = nextRetry;
	}
	
}
