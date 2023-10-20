package ca.bc.gov.nrs.wfnews.service.api.v1.model.factory;

import java.util.List;

import ca.bc.gov.nrs.common.service.model.factory.FactoryException;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.StatisticsResource;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.StatisticsDto;
import ca.bc.gov.nrs.wfone.common.service.api.model.factory.FactoryContext;

public interface StatisticsFactory {
  	List<StatisticsResource> getStatistics(
			List<StatisticsDto> dto, 
			FactoryContext context) 
			throws FactoryException;
}
