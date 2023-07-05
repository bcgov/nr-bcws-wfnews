package ca.bc.gov.nrs.wfone.api.model.v1;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

public interface WildfireParty<U extends PartyUsage> extends Serializable {

	public String getWildfirePartyGuid();
	public void setWildfirePartyGuid(String wildfirePartyGuid);

	public String getPartyName();
	public void setPartyName(String partyName);

	public Date getEffectiveDate();
	public void setEffectiveDate(Date effectiveDate);

	public Date getExpiryDate();
	public void setExpiryDate(Date expiryDate);

	public List<U> getPartyUsages();
	public void setPartyUsages(List<U> partyUsages);
}