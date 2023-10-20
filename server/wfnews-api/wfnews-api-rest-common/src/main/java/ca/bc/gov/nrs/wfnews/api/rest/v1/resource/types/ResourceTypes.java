package ca.bc.gov.nrs.wfnews.api.rest.v1.resource.types;

import ca.bc.gov.nrs.common.wfone.rest.resource.types.BaseResourceTypes;

public class ResourceTypes extends BaseResourceTypes {
	public static final String NAMESPACE = "http://wfnews.nrs.gov.bc.ca/v1/";

	public static final String ENDPOINTS_NAME = "endpoints";
	public static final String ENDPOINTS = NAMESPACE + ENDPOINTS_NAME;

	public static final String ATTACHMENT_NAME = "attachment";
	public static final String ATTACHMENT = NAMESPACE + ATTACHMENT_NAME;
	public static final String ATTACHMENT_LIST_NAME = "attachmentList";
	public static final String ATTACHMENT_LIST = NAMESPACE + ATTACHMENT_LIST_NAME;
	
	public static final String MAIL_NAME = "mail";
	public static final String MAIL = NAMESPACE + MAIL_NAME;

	public static final String INCIDENT_NAME = "incident";
	public static final String INCIDENT = NAMESPACE + INCIDENT_NAME;
	
	public static final String INCIDENT_LIST_NAME = "incident";
	public static final String INCIDENT_LIST = NAMESPACE + INCIDENT_NAME;
	
	public static final String PUBLISHED_INCIDENT_NAME = "publishedIncident";
	public static final String PUBLISHED_INCIDENT = NAMESPACE + PUBLISHED_INCIDENT_NAME;
	public static final String PUBLISHED_INCIDENT_LIST_NAME = "publishedIncidentList";
	public static final String PUBLISHED_INCIDENT_LIST = NAMESPACE + PUBLISHED_INCIDENT_LIST_NAME;
	
	public static final String EXTERNAL_URI_NAME = "externalUri";
	public static final String EXTERNAL_URI = NAMESPACE + EXTERNAL_URI_NAME;
	public static final String EXTERNAL_URI_LIST_NAME = "externalUriList";
	public static final String EXTERNAL_URI_LIST = NAMESPACE + EXTERNAL_URI_LIST_NAME;
	
	public static final String CREATE_PUBLISHED_INCIDENT = NAMESPACE + "createPublishedIncident";
	public static final String UPDATE_PUBLISHED_INCIDENT = NAMESPACE + "updatePublishedIncident";
	public static final String DELETE_PUBLISHED_INCIDENT = NAMESPACE + "deletePublishedIncident";
	
	public static final String CREATE_EXTERNAL_URI = NAMESPACE + "createExternalUri";
	public static final String UPDATE_EXTERNAL_URI = NAMESPACE + "updateExternalUri";
	public static final String DELETE_EXTERNAL_URI = NAMESPACE + "deleteExternalUri";

	public static final String CREATE_ATTACHMENT = NAMESPACE + "createAttachment";
	public static final String UPDATE_ATTACHMENT = NAMESPACE + "updateAttachment";
	public static final String DELETE_ATTACHMENT = NAMESPACE + "deleteAttachment";
	
	public static final String SITUATION_REPORT_NAME = "situationReport";
	public static final String SITUATION_REPORT = NAMESPACE + SITUATION_REPORT_NAME;
	public static final String SITUATION_REPORT_LIST_NAME = "situationReportList";
	public static final String SITUATION_REPORT_LIST = NAMESPACE + SITUATION_REPORT_LIST_NAME;
	public static final String CREATE_SITUATION_REPORT = NAMESPACE + "createSituationReport";
	public static final String UPDATE_SITUATION_REPORT = NAMESPACE + "updateSituationReport";
	public static final String DELETE_SITUATION_REPORT = NAMESPACE + "deleteSituationReport";

	public static final String STATISTICS_NAME = "statistics";
	public static final String STATISTICS = NAMESPACE + STATISTICS_NAME;
}