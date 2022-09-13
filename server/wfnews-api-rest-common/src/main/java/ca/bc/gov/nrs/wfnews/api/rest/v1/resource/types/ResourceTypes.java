package ca.bc.gov.nrs.wfnews.api.rest.v1.resource.types;

import ca.bc.gov.nrs.common.wfone.rest.resource.types.BaseResourceTypes;

public class ResourceTypes extends BaseResourceTypes {
	public static final String NAMESPACE = "http://wfnews.nrs.gov.bc.ca/v1/";

  public static final String ENDPOINTS_NAME = "endpoints";
	public static final String ENDPOINTS = NAMESPACE + ENDPOINTS_NAME;

	public static final String ATTACHMENT_NAME = "attachment";
	public static final String ATTACHMENT = NAMESPACE + ATTACHMENT_NAME;
	
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
	
	public static final String CREATE_WILDFIRE_INCIDENT = NAMESPACE + "createWildfireIncident";
	public static final String UPDATE_WILDFIRE_INCIDENT = NAMESPACE + "updateWildfireIncident";
	public static final String DELETE_WILDFIRE_INCIDENT = NAMESPACE + "deleteWildfireIncident";
	
}