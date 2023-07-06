package ca.bc.gov.nrs.wfone.notification.push.service.api.v1.spring;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.context.support.ResourceBundleMessageSource;

import ca.bc.gov.nrs.wfone.common.persistence.code.dao.CodeTableConfig;
import ca.bc.gov.nrs.wfone.common.persistence.code.spring.CodePersistenceSpringConfig;

@Configuration
@Import({ CodePersistenceSpringConfig.class })
public class CodeTableSpringConfig {

	private static final Logger logger = LoggerFactory.getLogger(CodeTableSpringConfig.class);

	public CodeTableSpringConfig() {
		logger.debug("<CodeTableSpringConfig");

		logger.debug(">CodeTableSpringConfig");
	}

	// Beans provided by EndpointsSpringConfig
	@Autowired
	ResourceBundleMessageSource messageSource;

	// Imported Spring Config
	@Autowired
	CodePersistenceSpringConfig codePersistenceSpringConfig;

	@Bean
	public CodeTableConfig resourceAgencyCodeTableConfig() {
		CodeTableConfig result;

		result = new CodeTableConfig();
		result.setCodeTableName("RESOURCE_AGENCY_CODE");
		result.setReadScope("WFONE.GET_CODE_TABLES");
		result.setUpdateScope("WFONE.UPDATE_RESOURCE_AGENCY_CODE");
		result.setUseRevisionCount(Boolean.TRUE);
		result.setCodeTableDao(codePersistenceSpringConfig.codeTableDao());
		result.setFetchSql(
				"SELECT T.AGENCY_NAME CODE,T.AGENCY_NAME DESCRIPTION, T.DISPLAY_ORDER, T.EFFECTIVE_DATE, T.EXPIRY_DATE, T.REVISION_COUNT, T.CREATE_USER, T.CREATE_DATE, T.UPDATE_USER, T.UPDATE_DATE FROM RESOURCE_AGENCY T ORDER BY T.DISPLAY_ORDER");

		return result;
	}

	@Bean
	public CodeTableConfig codeTableConfig() {
		CodeTableConfig result;

		result = new CodeTableConfig();
		result.setCodeTableName("RESOURCE_AGENCY_CODE");
		result.setReadScope("WFONE.GET_CODE_TABLES");
		result.setUpdateScope("WFONE.UPDATE_RESOURCE_AGENCY_CODE");
		result.setUseRevisionCount(Boolean.TRUE);
		result.setCodeTableDao(codePersistenceSpringConfig.codeTableDao());
		result.setFetchSql(
				"SELECT T.AGENCY_NAME CODE,T.AGENCY_NAME DESCRIPTION, T.DISPLAY_ORDER, T.EFFECTIVE_DATE, T.EXPIRY_DATE, T.REVISION_COUNT, T.CREATE_USER, T.CREATE_DATE, T.UPDATE_USER, T.UPDATE_DATE FROM RESOURCE_AGENCY T ORDER BY T.DISPLAY_ORDER");

		return result;
	}

	@Bean
	public List<CodeTableConfig> codeTableConfigs() {
		List<CodeTableConfig> result = new ArrayList<CodeTableConfig>();
		result.add(codeTableConfig());
		return result;

	}

}
