package ca.bc.gov.nrs.wfone.notification.push.service.api.v1.model;

import java.util.Date;

public class TwitterInformation {
	private String idStr;
	private String text;
	private Date createdAt;

	public TwitterInformation(String idStr, String text, Date createdAt) {
		this.idStr = idStr;
		this.text = text;
		this.createdAt = createdAt;
	}

	public String getIdStr() {
		return idStr;
	}

	public void setIdStr(String idStr) {
		this.idStr = idStr;
	}

	public String getText() {
		return text;
	}

	public void setText(String text) {
		this.text = text;
	}

	public Date getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(Date createdAt) {
		this.createdAt = createdAt;
	}
}
