package ca.bc.gov.nrs.wfnews.persistence.v1.dto;

import java.util.Date;

public abstract class AuditDto<T> extends BaseDto<T> {
	
	private static final long serialVersionUID = 1L;
	
	protected Long revisionCount;
	protected String createUser;
	protected Date createDate;
	protected String updateUser;
	protected Date updateDate;

	public final Long getRevisionCount() {
		return revisionCount;
	}

	public final void setRevisionCount(Long revisionCount) {
		this.revisionCount = revisionCount;
	}

	public final String getCreateUser() {
		return createUser;
	}

	public final void setCreateUser(String createUser) {
		this.createUser = createUser;
	}

	public final Date getCreateDate() {
		return createDate;
	}

	public final void setCreateDate(Date createDate) {
		this.createDate = createDate;
	}

	public final String getUpdateUser() {
		return updateUser;
	}

	public final void setUpdateUser(String updateUser) {
		this.updateUser = updateUser;
	}

	public final Date getUpdateDate() {
		return updateDate;
	}

	public final void setUpdateDate(Date updateDate) {
		this.updateDate = updateDate;
	}

}
