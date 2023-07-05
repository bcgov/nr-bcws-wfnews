package ca.bc.gov.nrs.wfone.api.model.v1;

import java.io.Serializable;
import java.util.Date;

public interface PartyUsage extends Serializable {

	public String getPartyUsageTypeCode();
	public void setPartyUsageTypeCode(String partyUsageTypeCode);

	public Integer getDisplayOrder();
	public void setDisplayOrder(Integer displayOrder);

	public Date getEffectiveDate();
	public void setEffectiveDate(Date effectiveDate);

	public Date getExpiryDate();
	public void setExpiryDate(Date expiryDate);
}