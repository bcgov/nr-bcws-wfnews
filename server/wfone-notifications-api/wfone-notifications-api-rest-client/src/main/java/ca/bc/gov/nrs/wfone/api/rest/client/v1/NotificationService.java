package ca.bc.gov.nrs.wfone.api.rest.client.v1;

import java.time.LocalDate;

import ca.bc.gov.nrs.common.wfone.rest.resource.CodeHierarchyListRsrc;
import ca.bc.gov.nrs.common.wfone.rest.resource.CodeHierarchyRsrc;
import ca.bc.gov.nrs.common.wfone.rest.resource.CodeTableListRsrc;
import ca.bc.gov.nrs.common.wfone.rest.resource.CodeTableRsrc;
import ca.bc.gov.nrs.common.wfone.rest.resource.HealthCheckResponseRsrc;
import ca.bc.gov.nrs.wfone.api.rest.v1.resource.EndpointsRsrc;
import ca.bc.gov.nrs.wfone.api.rest.v1.resource.NotificationSettingsRsrc;
import ca.bc.gov.nrs.wfone.common.rest.client.RestClientServiceException;

public interface NotificationService {
	
	EndpointsRsrc getTopLevelEndpoints() throws WildfireResourceServiceException;

	String getSwaggerString() throws RestClientServiceException;

	HealthCheckResponseRsrc getHealthCheck(String callstack) throws RestClientServiceException;

	CodeTableListRsrc getCodeTables(
			EndpointsRsrc parent,
			String codeTableName, 
			LocalDate effectiveAsOfDate) throws WildfireResourceServiceException;

	CodeTableRsrc getCodeTable(CodeTableRsrc codeTable, LocalDate effectiveAsOfDate) throws WildfireResourceServiceException;

	CodeTableRsrc updateCodeTable(CodeTableRsrc codeTable) throws WildfireResourceServiceException, ValidationException;

	CodeHierarchyListRsrc getCodeHierarchys(
			EndpointsRsrc parent,
			String codeHierarchyName, 
			LocalDate effectiveAsOfDate) throws WildfireResourceServiceException;

	CodeHierarchyRsrc getCodeHierarchy(CodeHierarchyRsrc codeHierarchy, LocalDate effectiveAsOfDate) throws WildfireResourceServiceException;

	CodeHierarchyRsrc updateCodeHierarchy(CodeHierarchyRsrc codeHierarchy) throws WildfireResourceServiceException, ValidationException;
	
	<T> T getPreviousPage(T pagedResource, Class<T> clazz) throws WildfireResourceServiceException;

	<T> T getNextPage(T pagedResource, Class<T> clazz) throws WildfireResourceServiceException;


	NotificationSettingsRsrc getNotificationSettings(String subscriberGuid) throws WildfireResourceServiceException;

	NotificationSettingsRsrc updateNotificationSettings(NotificationSettingsRsrc resource) throws WildfireResourceServiceException, ValidationException;
	
}
