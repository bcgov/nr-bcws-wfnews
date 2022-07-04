package ca.bc.gov.nrs.wfnews.api.rest.v1.parameters.validation;

public class Errors {
	
	public static final String PAGING_PAGE_NUMBER = "error.paging.page.number";
	public static final String PAGING_PAGE_ROW_COUNT = "error.paging.page.row.count";
	
	public static final String EFFECTIVE_AS_OF_QUERY_PARAM_DATEFORMAT = "error.effective.as.of.date.query.parameter.date.format";
	public static final String WILDFIRE_YEAR_QUERY_PARAM_NUMBERFORMAT = "error.wildfire.year.query.parameter.number.format";
	public static final String INCIDENT_NUMBER_SEQUENCE_QUERY_PARAM_NUMBERFORMAT = "error.incident.number.query.parameter.number.format";
	public static final String INCIDENT_ID_QUERY_PARAM_NUMBERFORMAT = "error.incident.id.query.parameter.number.format";
	public static final String PROFESSIONAL_REPORT_OF_FIRE_NO_QUERY_PARAM_NUMBERFORMAT = "error.profession.report.of.fire.no.query.parameter.number.format";
	
	public static final String FIRE_CENTRE_ORG_UNIT_IDENTIFIER_QUERY_PARAM_NUMBERFORMAT = "error.fire.centre.org.unit.no.query.parameter.number.format";
	public static final String ZONE_ORG_UNIT_IDENTIFIER_QUERY_PARAM_NUMBERFORMAT = "error.zone.org.unit.no.query.parameter.number.format";
	
	public static final String MINIMUM_REPORTED_DATE_DATEFORMAT = "error.minimum.reported.date.dateformat";
	public static final String MINIMUM_REPORT_OF_FIRE_CAPTURED_DATE_DATEFORMAT = "error.minimum.report.of.fire.captured.date.dateformat";
	public static final String LAST_STATE_CHANGE_AS_OF_TIMESTAMP_DATEFORMAT = "error.last.state.change.as.of.timestamp.dateformat";
	public static final String SUBMITTED_AS_OF_TIMESTAMP_DATEFORMAT = "error.submitted.as.of.timestamp.dateformat";

	public static final String INVALID_LOCAL_DATE_FORMAT = "error.invalid.local.date.format";
	public static final String INVALID_TIMESTAMP_FORMAT = "error.invalid.timestamp.format";

}
