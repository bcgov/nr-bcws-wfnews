package ca.bc.gov.nrs.wfone.service.api.v1.validation.constraints;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import ca.bc.gov.nrs.wfone.service.api.v1.validation.Errors;

public interface PublicReportOfFireConstraints {
	
	@NotNull(message=Errors.ROF_CONSENT_NOT_NULL, groups=PublicReportOfFireConstraints.class)
	Boolean getConsentToCall();
	
	@NotNull(message=Errors.ROF_BURNING_NOT_NULL, groups=PublicReportOfFireConstraints.class)
	@Size(min=0, max=20, message=Errors.ROF_BURNING_SIZE, groups=PublicReportOfFireConstraints.class)
	String[] getBurning();
	
	@NotNull(message=Errors.ROF_SMOKE_COLOUR_NOT_NULL, groups=PublicReportOfFireConstraints.class)
	@Size(min=0, max=20, message=Errors.ROF_SMOKE_COLOUR_SIZE, groups=PublicReportOfFireConstraints.class)
	String[] getSmokeColor();
	
	@NotNull(message=Errors.ROF_WEATHER_NOT_NULL, groups=PublicReportOfFireConstraints.class)
	@Size(min=0, max=20, message=Errors.ROF_WEATHER_SIZE, groups=PublicReportOfFireConstraints.class)
	String[] getWeather();
	
	@NotNull(message=Errors.ROF_ASSETS_NOT_NULL, groups=PublicReportOfFireConstraints.class)
	@Size(min=0, max=20, message=Errors.ROF_ASSETS_SIZE, groups=PublicReportOfFireConstraints.class)
	String[] getAssetsAtRisk();
	
	@NotNull(message=Errors.ROF_SIGNS_NOT_NULL, groups=PublicReportOfFireConstraints.class)
	@Size(min=0, max=20, message=Errors.ROF_SIGNS_SIZE, groups=PublicReportOfFireConstraints.class)
	String[] getSignsOfResponse();
	
	@NotNull(message=Errors.ROF_FIRE_LOCATION_NOT_NULL, groups=PublicReportOfFireConstraints.class)
	@Size(min=2, max=2, message=Errors.ROF_FIRE_LOCATION_SIZE, groups=PublicReportOfFireConstraints.class)
	double[] getFireLocation();
	
	@Size(min=0, max=500, message=Errors.ROF_OTHER_INFO_SIZE, groups=PublicReportOfFireConstraints.class)
	String getOtherInfo();
	
	
	
}
