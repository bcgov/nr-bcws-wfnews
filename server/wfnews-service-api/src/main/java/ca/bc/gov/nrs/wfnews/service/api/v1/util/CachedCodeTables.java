//package ca.bc.gov.nrs.wfnews.service.api.v1.util;
//
//
//import java.util.ArrayList;
//import java.util.HashMap;
//import java.util.List;
//import java.util.Map;
//
//import ca.bc.gov.nrs.common.persistence.dao.DaoException;
//import ca.bc.gov.nrs.common.persistence.v1.code.dao.CodeTableConfig;
//import ca.bc.gov.nrs.common.persistence.v1.code.dao.CodeTableDao;
//import ca.bc.gov.nrs.common.persistence.v1.code.dto.CodeDto;
//import ca.bc.gov.nrs.common.persistence.v1.code.dto.CodeTableDto;
//
//public class CachedCodeTables {
//	
//	// 8 hrs
//	private static final long DEFAULT_CACHE_VALIDITY_MILLIS = 8*60*60*1000; 	
//	
//	private CodeTableDao codeTableDao;
//	private List<CodeTableConfig> codeTableConfigs = new ArrayList<>();
//
//	private Map<String, List<CodeDto>> cache = new HashMap<String, List<CodeDto>>();
//
//	private long cacheValidityMillis;
//	
//	private Map<String, Cache> tableCaches = new HashMap<>();
//	
//	public CachedCodeTables() {
//		
//		this.cacheValidityMillis = DEFAULT_CACHE_VALIDITY_MILLIS;
//	}
//	
//	public CodeDto get(String codeTableName, String value, long effectiveAsOfMillis) throws DaoException {
//		CodeDto result = null;
//		
//		List<CodeDto> dtos = getCache(codeTableName);
//		if(dtos!=null) {
//
//			for(CodeDto dto:dtos) {
//				if(dto.getCode().equals(value)&&dto.getEffectiveDate().getTime()<=effectiveAsOfMillis&&dto.getExpiryDate().getTime()>effectiveAsOfMillis) {
//					
//					result = dto;
//					break;
//				}
//			}
//		}
//		
//		return result;
//	}
//	
//	class Cache {
//		long expiryMills;
//		public List<CodeDto> list;
//	}
//	
//	private List<CodeDto> getCache(String codeTableName) throws DaoException {
//		List<CodeDto> result = null;
//		
//		Cache tableCache = tableCaches.get(codeTableName);
//		
//		if(tableCache==null||tableCache.expiryMills<System.currentTimeMillis()) {
//			
//			tableCache = new Cache(); 
//			
//			CodeTableConfig codeTableConfig = getCodeTableConfig(codeTableName);
//			if(codeTableConfig==null) {
//				
//				// do nothing
//			} else {
//			
//				CodeTableDto dto = codeTableDao.fetch(codeTableConfig, null);
//				
//				List<CodeDto> list = cache.get(codeTableName);
//				if(list==null) {
//					list = new ArrayList<>();
//					cache.put(codeTableName, list);
//				}
//				
//				for(CodeDto code:dto.getCodes()) {
//	
//					list.add(code);
//				}
//				
//				tableCache.expiryMills = System.currentTimeMillis()+cacheValidityMillis;
//				tableCache.list = list;
//				
//				tableCaches.put(codeTableName, tableCache);
//			}
//			
//		}
//		
//		result = tableCache.list;
//		
//		return result;
//	}
//	
//	private CodeTableConfig getCodeTableConfig(String codeTableName) {
//		CodeTableConfig result = null;
//		
//		for(CodeTableConfig codeTableConfig:this.codeTableConfigs) {
//			
//			if(codeTableName.equals(codeTableConfig.getCodeTableName())) {
//				
//				result = codeTableConfig;
//				break;
//			}
//			
//		}
//		
//		return result;
//	}
//
//	public void setCodeTableDao(CodeTableDao codeTableDao) {
//		this.codeTableDao = codeTableDao;
//	}
//
//	public void setCodeTableConfigs(List<CodeTableConfig> codeTableConfigs) {
//		this.codeTableConfigs = codeTableConfigs;
//	}
//
//	public void setCacheValidityMillis(long cacheValidityMillis) {
//		this.cacheValidityMillis = cacheValidityMillis;
//	}
//}
