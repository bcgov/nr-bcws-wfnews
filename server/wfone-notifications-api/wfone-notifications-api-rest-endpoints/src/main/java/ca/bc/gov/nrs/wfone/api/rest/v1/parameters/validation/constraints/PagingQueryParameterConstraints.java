package ca.bc.gov.nrs.wfone.api.rest.v1.parameters.validation.constraints;

import javax.validation.constraints.Pattern;
import ca.bc.gov.nrs.wfone.api.rest.v1.parameters.validation.Errors;

public interface PagingQueryParameterConstraints {
	
	@Pattern(regexp="[\\d]{0,4}", message = Errors.PAGING_PAGE_NUMBER, groups = PagingQueryParameterConstraints.class)
	public String getPageNumber();

	@Pattern(regexp="[\\d]{0,4}", message = Errors.PAGING_PAGE_ROW_COUNT, groups = PagingQueryParameterConstraints.class)
	public String getPageRowCount();
}