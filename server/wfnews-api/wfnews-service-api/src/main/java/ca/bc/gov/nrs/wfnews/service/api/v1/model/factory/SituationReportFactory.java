package ca.bc.gov.nrs.wfnews.service.api.v1.model.factory;

import ca.bc.gov.nrs.wfone.common.service.api.model.factory.FactoryContext;
import ca.bc.gov.nrs.common.service.model.factory.FactoryException;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.PagedDtos;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.SituationReportDto;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.SituationReportListResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.SituationReportResource;

public interface SituationReportFactory {
	
	SituationReportResource getSituationReport(
			SituationReportDto dto, 
			FactoryContext context) 
			throws FactoryException;
	
	SituationReportListResource getSituationReportList(
			PagedDtos<SituationReportDto> dto, 
			Integer pageNumber,
			Integer pageRowCount,
			FactoryContext context) 
			throws FactoryException;
}