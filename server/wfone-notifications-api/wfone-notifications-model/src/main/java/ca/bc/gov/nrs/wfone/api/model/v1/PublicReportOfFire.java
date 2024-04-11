package ca.bc.gov.nrs.wfone.api.model.v1;

public class PublicReportOfFire{
	
	String fullName;
	
	String phoneNumber;
	
	boolean consentToCall;
	
	int estimatedDistance;
	
	double[] fireLocation;
	
	String fireSize;
	
	String rateOfSpread;
	
	String[] burning;
	
	String[] smokeColor;
	
	String[] weather;
	
	String[] assetsAtRisk;
	
	String[] signsOfResponse;
	
	String otherInfo;
	
	String submissionID;

	public String getFullName() {
		return this.fullName;
	}

	public void setFullName(String fullName) {
		this.fullName = fullName;
	}

	public String getPhoneNumber() {
		return this.phoneNumber;
	}

	public void setPhoneNumber(String phoneNumber) {
		this.phoneNumber = phoneNumber;
	}

	public boolean isConsentToCall() {
		return this.consentToCall;
	}

	public boolean getConsentToCall() {
		return this.consentToCall;
	}

	public void setConsentToCall(Boolean consentToCall) {
		this.consentToCall = consentToCall;
	}

	public int getEstimatedDistance() {
		return this.estimatedDistance;
	}

	public void setEstimatedDistance(int estimatedDistance) {
		this.estimatedDistance = estimatedDistance;
	}

	public double[] getFireLocation() {
		return this.fireLocation;
	}

	public void setFireLocation(double[] fireLocation) {
		this.fireLocation = fireLocation;
	}

	public String getFireSize() {
		return this.fireSize;
	}

	public void setFireSize(String fireSize) {
		this.fireSize = fireSize;
	}

	public String getRateOfSpread() {
		return this.rateOfSpread;
	}

	public void setRateOfSpread(String rateOfSpread) {
		this.rateOfSpread = rateOfSpread;
	}

	public String[] getBurning() {
		return this.burning;
	}

	public void setBurning(String[] burning) {
		this.burning = burning;
	}

	public String[] getSmokeColor() {
		return this.smokeColor;
	}

	public void setSmokeColor(String[] smokeColor) {
		this.smokeColor = smokeColor;
	}

	public String[] getWeather() {
		return this.weather;
	}

	public void setWeather(String[] weather) {
		this.weather = weather;
	}

	public String[] getAssetsAtRisk() {
		return this.assetsAtRisk;
	}

	public void setAssetsAtRisk(String[] assetsAtRisk) {
		this.assetsAtRisk = assetsAtRisk;
	}

	public String[] getSignsOfResponse() {
		return this.signsOfResponse;
	}

	public void setSignsOfResponse(String[] signsOfResponse) {
		this.signsOfResponse = signsOfResponse;
	}

	public String getOtherInfo() {
		return this.otherInfo;
	}

	public void setOtherInfo(String otherInfo) {
		this.otherInfo = otherInfo;
	}
	
	public String getSubmissionID() {
		return this.submissionID;
	}

	public void setSubmissionID(String submissionID) {
		this.submissionID = submissionID;
	}

}