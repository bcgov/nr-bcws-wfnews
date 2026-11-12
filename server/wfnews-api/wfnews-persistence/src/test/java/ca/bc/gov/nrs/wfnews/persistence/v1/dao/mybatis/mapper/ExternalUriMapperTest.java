package ca.bc.gov.nrs.wfnews.persistence.v1.dao.mybatis.mapper;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.io.InputStream;
import java.lang.reflect.Proxy;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.builder.xml.XMLMapperBuilder;
import org.apache.ibatis.executor.parameter.ParameterHandler;
import org.apache.ibatis.mapping.BoundSql;
import org.apache.ibatis.mapping.MappedStatement;
import org.apache.ibatis.mapping.ParameterMapping;
import org.apache.ibatis.mapping.ResultMap;
import org.apache.ibatis.mapping.ResultMapping;
import org.apache.ibatis.session.Configuration;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.TypeHandler;
import org.junit.Before;
import org.junit.Test;

import ca.bc.gov.nrs.wfnews.persistence.v1.dto.ExternalUriDto;

public class ExternalUriMapperTest {

	private Configuration configuration;

	@Before
	public void setUp() throws Exception {
		configuration = new Configuration();
		String resource = "ca/bc/gov/nrs/wfnews/persistence/v1/dao/mybatis/mapper/ExternalUriMapper.xml";
		try (InputStream inputStream = getClass().getClassLoader().getResourceAsStream(resource)) {
			assertNotNull("Mapper XML resource not found", inputStream);
			XMLMapperBuilder builder = new XMLMapperBuilder(inputStream, configuration, resource, configuration.getSqlFragments());
			builder.parse();
		}
	}

	@Test
	public void testExternalUriMapperXml() {
		ResultMap resultMap = configuration.getResultMap("ca.bc.gov.nrs.wfnews.persistence.v1.dao.mybatis.mapper.ExternalUriMapper.ExternalUriDtoMap");
		assertNotNull(resultMap);

		int verifiedResultMappings = 0;
		for (ResultMapping rm : resultMap.getResultMappings()) {
			if ("createDate".equals(rm.getProperty())) {
				assertEquals(JdbcType.TIMESTAMP, rm.getJdbcType());
				verifiedResultMappings++;
			} else if ("updateDate".equals(rm.getProperty())) {
				assertEquals(JdbcType.TIMESTAMP, rm.getJdbcType());
				verifiedResultMappings++;
			} else if ("createdTimestamp".equals(rm.getProperty())) {
				assertEquals(JdbcType.TIMESTAMP, rm.getJdbcType());
				verifiedResultMappings++;
			}
		}
		assertEquals("Should have verified 3 timestamp result mappings", 3, verifiedResultMappings);

		MappedStatement insertStatement = configuration.getMappedStatement("ca.bc.gov.nrs.wfnews.persistence.v1.dao.mybatis.mapper.ExternalUriMapper.insert");
		assertNotNull(insertStatement);
		List<ParameterMapping> insertParams = insertStatement.getBoundSql(null).getParameterMappings();
		int verifiedInsertParams = 0;
		for (ParameterMapping pm : insertParams) {
			if ("dto.createDate".equals(pm.getProperty()) || "dto.updateDate".equals(pm.getProperty()) || "dto.createdTimestamp".equals(pm.getProperty())) {
				assertEquals("Expected TIMESTAMP for " + pm.getProperty(), JdbcType.TIMESTAMP, pm.getJdbcType());
				verifiedInsertParams++;
			}
		}
		assertEquals("Should have verified 3 timestamp insert parameters", 3, verifiedInsertParams);

		MappedStatement updateStatement = configuration.getMappedStatement("ca.bc.gov.nrs.wfnews.persistence.v1.dao.mybatis.mapper.ExternalUriMapper.update");
		assertNotNull(updateStatement);
		List<ParameterMapping> updateParams = updateStatement.getBoundSql(null).getParameterMappings();
		int verifiedUpdateParams = 0;
		for (ParameterMapping pm : updateParams) {
			if ("dto.createDate".equals(pm.getProperty()) || "dto.updateDate".equals(pm.getProperty()) || "dto.createdTimestamp".equals(pm.getProperty())) {
				assertEquals("Expected TIMESTAMP for " + pm.getProperty(), JdbcType.TIMESTAMP, pm.getJdbcType());
				verifiedUpdateParams++;
			}
		}
		assertEquals("Should have verified 3 timestamp update parameters", 3, verifiedUpdateParams);
	}

	@Test
	public void testCreateWithUtcDateTimeTimestamps() {
		// UTC Timestamp with both date and non-zero time (14:23:53.789 UTC)
		Instant createUtc = Instant.parse("2026-11-10T14:23:53.789Z");
		Instant updateUtc = Instant.parse("2026-11-10T14:23:53.789Z");
		Instant createdTimestampUtc = Instant.parse("2026-11-10T08:15:30.456Z");

		Date createDate = Date.from(createUtc);
		Date updateDate = Date.from(updateUtc);
		Date createdTimestamp = Date.from(createdTimestampUtc);

		// Verify test setup has non-zero hours/minutes/seconds/millis in UTC
		assertFalse("createDate time portion should not be midnight", (createDate.getTime() % 86400000L) == 0);
		assertFalse("createdTimestamp time portion should not be midnight", (createdTimestamp.getTime() % 86400000L) == 0);

		ExternalUriDto dto = new ExternalUriDto();
		dto.setExternalUriGuid("TEST-GUID-1234");
		dto.setSourceObjectNameCode("PUB_INC_DT");
		dto.setSourceObjectUniqueId("5FA497B8FD51974AE0630409228E50CB");
		dto.setExternalUriCategoryTag("VIDEO");
		dto.setExternalUriDisplayLabel("Incident Video");
		dto.setExternalUri("https://www.youtube.com/watch?v=example");
		dto.setPublishedInd(Boolean.TRUE);
		dto.setPrivateInd(Boolean.FALSE);
		dto.setArchivedInd(Boolean.FALSE);
		dto.setPrimaryInd(Boolean.TRUE);
		dto.setRevisionCount(1L);
		dto.setCreateUser("TEST_USER");
		dto.setUpdateUser("TEST_USER");
		dto.setCreateDate(createDate);
		dto.setUpdateDate(updateDate);
		dto.setCreatedTimestamp(createdTimestamp);

		Map<String, Object> parameters = new HashMap<>();
		parameters.put("dto", dto);
		parameters.put("externalUriGuid", dto.getExternalUriGuid());

		MappedStatement insertStatement = configuration.getMappedStatement("ca.bc.gov.nrs.wfnews.persistence.v1.dao.mybatis.mapper.ExternalUriMapper.insert");
		Map<Integer, String> methodCalls = new HashMap<>();
		Map<Integer, Object> setParams = recordPreparedStatementParameters(insertStatement, parameters, methodCalls);

		BoundSql boundSql = insertStatement.getBoundSql(parameters);
		List<ParameterMapping> pms = boundSql.getParameterMappings();

		for (int i = 0; i < pms.size(); i++) {
			int paramIndex = i + 1;
			String property = pms.get(i).getProperty();

			if ("dto.createDate".equals(property)) {
				assertEquals("createDate must be set using setTimestamp to preserve time", "setTimestamp", methodCalls.get(paramIndex));
				assertTrue("Param must be java.sql.Timestamp", setParams.get(paramIndex) instanceof Timestamp);
				Timestamp ts = (Timestamp) setParams.get(paramIndex);
				assertEquals("createDate timestamp in UTC must match exact milliseconds including time", createDate.getTime(), ts.getTime());
				assertEquals("createDate Instant string must match UTC date-time", createUtc.toString(), ts.toInstant().toString());
			} else if ("dto.updateDate".equals(property)) {
				assertEquals("updateDate must be set using setTimestamp to preserve time", "setTimestamp", methodCalls.get(paramIndex));
				assertTrue("Param must be java.sql.Timestamp", setParams.get(paramIndex) instanceof Timestamp);
				Timestamp ts = (Timestamp) setParams.get(paramIndex);
				assertEquals("updateDate timestamp in UTC must match exact milliseconds including time", updateDate.getTime(), ts.getTime());
				assertEquals("updateDate Instant string must match UTC date-time", updateUtc.toString(), ts.toInstant().toString());
			} else if ("dto.createdTimestamp".equals(property)) {
				assertEquals("createdTimestamp must be set using setTimestamp to preserve time", "setTimestamp", methodCalls.get(paramIndex));
				assertTrue("Param must be java.sql.Timestamp", setParams.get(paramIndex) instanceof Timestamp);
				Timestamp ts = (Timestamp) setParams.get(paramIndex);
				assertEquals("createdTimestamp in UTC must match exact milliseconds including time", createdTimestamp.getTime(), ts.getTime());
				assertEquals("createdTimestamp Instant string must match UTC date-time", createdTimestampUtc.toString(), ts.toInstant().toString());
			}
		}
	}

	@Test
	public void testUpdateWithUtcDateTimeTimestamps() {
		// UTC Timestamp with both date and non-zero time (18:45:12.345 UTC)
		Instant createUtc = Instant.parse("2026-11-10T14:23:53.789Z");
		Instant updateUtc = Instant.parse("2026-11-10T18:45:12.345Z");
		Instant createdTimestampUtc = Instant.parse("2026-11-10T08:15:30.456Z");

		Date createDate = Date.from(createUtc);
		Date updateDate = Date.from(updateUtc);
		Date createdTimestamp = Date.from(createdTimestampUtc);

		ExternalUriDto dto = new ExternalUriDto();
		dto.setExternalUriGuid("TEST-GUID-1234");
		dto.setSourceObjectNameCode("PUB_INC_DT");
		dto.setSourceObjectUniqueId("5FA497B8FD51974AE0630409228E50CB");
		dto.setExternalUriCategoryTag("VIDEO");
		dto.setExternalUriDisplayLabel("Incident Video Updated");
		dto.setExternalUri("https://www.youtube.com/watch?v=example-updated");
		dto.setPublishedInd(Boolean.TRUE);
		dto.setPrivateInd(Boolean.FALSE);
		dto.setArchivedInd(Boolean.FALSE);
		dto.setPrimaryInd(Boolean.TRUE);
		dto.setRevisionCount(2L);
		dto.setCreateUser("TEST_USER");
		dto.setUpdateUser("UPDATE_USER");
		dto.setCreateDate(createDate);
		dto.setUpdateDate(updateDate);
		dto.setCreatedTimestamp(createdTimestamp);

		Map<String, Object> parameters = new HashMap<>();
		parameters.put("dto", dto);
		parameters.put("externalUriGuid", dto.getExternalUriGuid());

		MappedStatement updateStatement = configuration.getMappedStatement("ca.bc.gov.nrs.wfnews.persistence.v1.dao.mybatis.mapper.ExternalUriMapper.update");
		Map<Integer, String> methodCalls = new HashMap<>();
		Map<Integer, Object> setParams = recordPreparedStatementParameters(updateStatement, parameters, methodCalls);

		BoundSql boundSql = updateStatement.getBoundSql(parameters);
		List<ParameterMapping> pms = boundSql.getParameterMappings();

		for (int i = 0; i < pms.size(); i++) {
			int paramIndex = i + 1;
			String property = pms.get(i).getProperty();

			if ("dto.createDate".equals(property)) {
				assertEquals("createDate must be set using setTimestamp on update", "setTimestamp", methodCalls.get(paramIndex));
				assertTrue("Param must be java.sql.Timestamp", setParams.get(paramIndex) instanceof Timestamp);
				Timestamp ts = (Timestamp) setParams.get(paramIndex);
				assertEquals("createDate timestamp in UTC must match exact milliseconds", createDate.getTime(), ts.getTime());
				assertEquals("createDate Instant string must match UTC date-time", createUtc.toString(), ts.toInstant().toString());
			} else if ("dto.updateDate".equals(property)) {
				assertEquals("updateDate must be set using setTimestamp on update", "setTimestamp", methodCalls.get(paramIndex));
				assertTrue("Param must be java.sql.Timestamp", setParams.get(paramIndex) instanceof Timestamp);
				Timestamp ts = (Timestamp) setParams.get(paramIndex);
				assertEquals("updateDate timestamp in UTC must match exact milliseconds", updateDate.getTime(), ts.getTime());
				assertEquals("updateDate Instant string must match UTC date-time", updateUtc.toString(), ts.toInstant().toString());
			} else if ("dto.createdTimestamp".equals(property)) {
				assertEquals("createdTimestamp must be set using setTimestamp on update", "setTimestamp", methodCalls.get(paramIndex));
				assertTrue("Param must be java.sql.Timestamp", setParams.get(paramIndex) instanceof Timestamp);
				Timestamp ts = (Timestamp) setParams.get(paramIndex);
				assertEquals("createdTimestamp in UTC must match exact milliseconds", createdTimestamp.getTime(), ts.getTime());
				assertEquals("createdTimestamp Instant string must match UTC date-time", createdTimestampUtc.toString(), ts.toInstant().toString());
			}
		}
	}

	@Test
	public void testResultMapWithUtcDateTimeTimestamps() throws Exception {
		// When reading from DB resultSet, verify the TypeHandler uses getTimestamp and preserves UTC date and time
		Instant createUtc = Instant.parse("2026-11-10T14:23:53.789Z");
		Instant updateUtc = Instant.parse("2026-11-10T18:45:12.345Z");
		Instant createdTimestampUtc = Instant.parse("2026-11-10T08:15:30.456Z");

		Map<String, Timestamp> columnValues = new HashMap<>();
		columnValues.put("CREATE_DATE", Timestamp.from(createUtc));
		columnValues.put("UPDATE_DATE", Timestamp.from(updateUtc));
		columnValues.put("CREATED_TIMESTAMP", Timestamp.from(createdTimestampUtc));

		Map<String, String> methodCalls = new HashMap<>();
		ResultSet rs = (ResultSet) Proxy.newProxyInstance(
			ResultSet.class.getClassLoader(),
			new Class<?>[] { ResultSet.class },
			(proxy, method, args) -> {
				if ("getTimestamp".equals(method.getName()) && args != null && args.length == 1) {
					String colName = (String) args[0];
					methodCalls.put(colName, method.getName());
					return columnValues.get(colName);
				}
				if ("wasNull".equals(method.getName())) {
					return false;
				}
				return null;
			}
		);

		ResultMap resultMap = configuration.getResultMap("ca.bc.gov.nrs.wfnews.persistence.v1.dao.mybatis.mapper.ExternalUriMapper.ExternalUriDtoMap");
		for (ResultMapping rm : resultMap.getResultMappings()) {
			String property = rm.getProperty();
			String column = rm.getColumn();
			TypeHandler<?> handler = rm.getTypeHandler();

			if ("createDate".equals(property)) {
				Date result = (Date) handler.getResult(rs, column);
				assertNotNull(result);
				assertEquals("Must read via getTimestamp to preserve time", "getTimestamp", methodCalls.get(column));
				assertEquals("createDate must preserve full UTC timestamp with time", createUtc.toEpochMilli(), result.getTime());
				assertEquals("createDate Instant representation must match", createUtc.toString(), result.toInstant().toString());
			} else if ("updateDate".equals(property)) {
				Date result = (Date) handler.getResult(rs, column);
				assertNotNull(result);
				assertEquals("Must read via getTimestamp to preserve time", "getTimestamp", methodCalls.get(column));
				assertEquals("updateDate must preserve full UTC timestamp with time", updateUtc.toEpochMilli(), result.getTime());
				assertEquals("updateDate Instant representation must match", updateUtc.toString(), result.toInstant().toString());
			} else if ("createdTimestamp".equals(property)) {
				Date result = (Date) handler.getResult(rs, column);
				assertNotNull(result);
				assertEquals("Must read via getTimestamp to preserve time", "getTimestamp", methodCalls.get(column));
				assertEquals("createdTimestamp must preserve full UTC timestamp with time", createdTimestampUtc.toEpochMilli(), result.getTime());
				assertEquals("createdTimestamp Instant representation must match", createdTimestampUtc.toString(), result.toInstant().toString());
			}
		}
	}

	private Map<Integer, Object> recordPreparedStatementParameters(MappedStatement mappedStatement, Object parameterObject, Map<Integer, String> methodCalls) {
		BoundSql boundSql = mappedStatement.getBoundSql(parameterObject);
		ParameterHandler parameterHandler = configuration.newParameterHandler(mappedStatement, parameterObject, boundSql);

		Map<Integer, Object> setParams = new HashMap<>();
		PreparedStatement ps = (PreparedStatement) Proxy.newProxyInstance(
			PreparedStatement.class.getClassLoader(),
			new Class<?>[] { PreparedStatement.class },
			(proxy, method, args) -> {
				if (method.getName().startsWith("set") && args != null && args.length >= 2 && args[0] instanceof Integer) {
					int index = (Integer) args[0];
					setParams.put(index, args[1]);
					if (methodCalls != null) {
						methodCalls.put(index, method.getName());
					}
				}
				return null;
			}
		);

		try {
			parameterHandler.setParameters(ps);
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
		return setParams;
	}
}
