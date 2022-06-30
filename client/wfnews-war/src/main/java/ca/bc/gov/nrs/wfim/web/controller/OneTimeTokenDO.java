package ca.bc.gov.nrs.wfim.web.controller;


public class OneTimeTokenDO {

	private String guid;
	private String userId;
	
	public String getGuid() {
		return guid;
	}

	public void setGuid(String guid) {
		this.guid = guid;
	}

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}
}
