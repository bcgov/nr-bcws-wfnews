package ca.bc.gov.nrs.wfone.notification.push.service.api.v1.util;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import ca.bc.gov.nrs.wfone.common.persistence.code.dao.CodeTableConfig;
import ca.bc.gov.nrs.wfone.common.persistence.code.dao.CodeTableDao;
import ca.bc.gov.nrs.wfone.common.persistence.code.dto.CodeDto;
import ca.bc.gov.nrs.wfone.common.persistence.code.dto.CodeTableDto;
import ca.bc.gov.nrs.wfone.common.persistence.dao.DaoException;

public class CachedCodeTables {

	// 8 hrs
	private static final long DEFAULT_CACHE_VALIDITY_MILLIS = 8 * 60 * 60 * 1000;

	private CodeTableDao codeTableDao;
	private List<CodeTableConfig> codeTableConfigs = new ArrayList<>();

	private Map<String, List<CodeDto>> cache = new HashMap<String, List<CodeDto>>();

	private long cacheValidityMillis;
	private long cacheExpiryMillis;

	public CachedCodeTables() {

		this.cacheValidityMillis = DEFAULT_CACHE_VALIDITY_MILLIS;
		this.cacheExpiryMillis = 0;
	}

	public CodeDto get(String codeTableName, String value, LocalDate effectiveAsOfDate) throws DaoException {
		CodeDto result = null;

		loadCache();

		List<CodeDto> dtos = cache.get(codeTableName);
		if (dtos != null) {

			for (CodeDto dto : dtos) {
				if (dto.getCode().equals(value) && !dto.getEffectiveDate().isAfter(effectiveAsOfDate)
						&& dto.getExpiryDate().isBefore(effectiveAsOfDate)) {

					result = dto;
					break;
				}
			}
		}

		return result;
	}

	protected synchronized void loadCache() throws DaoException {

		long now = System.currentTimeMillis();

		if (now > cacheExpiryMillis) {

			cache.clear();

			for (CodeTableConfig codeTableConfig : this.codeTableConfigs) {

				String codeTableName = codeTableConfig.getCodeTableName();

				CodeTableDto dto = codeTableDao.fetch(codeTableConfig, null);

				List<CodeDto> list = cache.get(codeTableName);
				if (list == null) {
					list = new ArrayList<>();
					cache.put(codeTableName, list);
				}

				for (CodeDto code : dto.getCodes()) {

					list.add(code);
				}
			}

			cacheExpiryMillis = now + cacheValidityMillis;
		}
	}

	public void setCodeTableDao(CodeTableDao codeTableDao) {
		this.codeTableDao = codeTableDao;
	}

	public void setCodeTableConfigs(List<CodeTableConfig> codeTableConfigs) {
		this.codeTableConfigs = codeTableConfigs;
	}

	public void setCacheValidityMillis(long cacheValidityMillis) {
		this.cacheValidityMillis = cacheValidityMillis;
	}
}
