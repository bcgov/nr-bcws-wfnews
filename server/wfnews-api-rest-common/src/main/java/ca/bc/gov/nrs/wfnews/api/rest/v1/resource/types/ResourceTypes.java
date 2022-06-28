package ca.bc.gov.nrs.wfnews.api.rest.v1.resource.types;

import ca.bc.gov.nrs.common.wfone.rest.resource.types.BaseResourceTypes;

public class ResourceTypes extends BaseResourceTypes {
	public static final String NAMESPACE = "http://wfnews.nrs.gov.bc.ca/v1/";

  public static final String ENDPOINTS_NAME = "endpoints";
	public static final String ENDPOINTS = NAMESPACE + ENDPOINTS_NAME;

	public static final String ATTACHMENT_NAME = "attachment";
	public static final String ATTACHMENT = NAMESPACE + ATTACHMENT_NAME;
}