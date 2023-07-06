package ca.bc.gov.nrs.wfone.notification.push.persistence.v1.spring;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import javax.sql.DataSource;

import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.postgresql.PostgreSqlAreaOfInterestQuery;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.postgresql.PostgreSpatialQuery;
import org.apache.commons.dbcp2.BasicDataSource;
import org.apache.ibatis.session.LocalCacheScope;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.TypeHandlerRegistry;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.mapper.MapperScannerConfigurer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import ca.bc.gov.nrs.wfone.common.persistence.dao.mybatis.BooleanTypeHandler;
import ca.bc.gov.nrs.wfone.common.persistence.dao.mybatis.InstantTypeHandler;
import ca.bc.gov.nrs.wfone.common.persistence.dao.mybatis.LocalDateTimeTypeHandler;
import ca.bc.gov.nrs.wfone.common.persistence.dao.mybatis.LocalDateTypeHandler;
import ca.bc.gov.nrs.wfone.common.persistence.dao.mybatis.LocalTimeTypeHandler;
import ca.bc.gov.nrs.wfone.common.persistence.dao.mybatis.ResetDirtyInterceptor;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dao.NotificationPushItemDao;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dao.NotificationSettingsDao;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dao.mybatis.NotificationPushItemDaoImpl;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dao.mybatis.NotificationSettingsDaoImpl;

@EnableTransactionManagement
@Configuration
public class PersistenceSpringConfig {

	private static final Logger logger = LoggerFactory.getLogger(PersistenceSpringConfig.class);
	
	public PersistenceSpringConfig() {
		logger.debug("<PersistenceSpringConfig");
		
		logger.debug(">PersistenceSpringConfig");
	}

	@Bean
	public PlatformTransactionManager transactionManager(DataSource wfoneDataSource) {
		return new DataSourceTransactionManager(wfoneDataSource);
	}

	@Bean
	public SqlSessionFactoryBean sqlSessionFactory(DataSource wfoneDataSource) {
		SqlSessionFactoryBean sessionFactory = new SqlSessionFactoryBean();
		sessionFactory.setDataSource(wfoneDataSource);
		
		org.apache.ibatis.session.Configuration configuration = new org.apache.ibatis.session.Configuration();
		
		configuration.setCacheEnabled(true);
		configuration.setLazyLoadingEnabled(true);
		configuration.setAggressiveLazyLoading(false);
		configuration.setLocalCacheScope(LocalCacheScope.SESSION);
		
		TypeHandlerRegistry typeHandlerRegistry = configuration.getTypeHandlerRegistry();
		typeHandlerRegistry.register(Boolean.class, JdbcType.VARCHAR, BooleanTypeHandler.class);
		typeHandlerRegistry.register(LocalTime.class, JdbcType.VARCHAR, LocalTimeTypeHandler.class);
		typeHandlerRegistry.register(LocalDate.class, JdbcType.DATE, LocalDateTypeHandler.class);
		typeHandlerRegistry.register(LocalDateTime.class, JdbcType.TIMESTAMP, LocalDateTimeTypeHandler.class);
		typeHandlerRegistry.register(Instant.class, JdbcType.TIMESTAMP, InstantTypeHandler.class);
		
		sessionFactory.setConfiguration(configuration);
		
		sessionFactory.setPlugins(new ResetDirtyInterceptor());
		
		return sessionFactory;
	}

	@Bean
	public static MapperScannerConfigurer mapperScannerConfigurer() {
		MapperScannerConfigurer configurer = new MapperScannerConfigurer();
		configurer.setBasePackage("ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dao.mybatis");
		configurer.setSqlSessionFactoryBeanName("sqlSessionFactory");
		return configurer;
	}
	
	@Bean
	public NotificationSettingsDao notificationSettingsDao() {
		return new NotificationSettingsDaoImpl();
	}

	@Bean
	public NotificationPushItemDao notificationPushItemDao() {
		return new NotificationPushItemDaoImpl();
	}

	@Value("${wfone.datasource.url}")
	private String wfoneDataSourceUrl;

	@Value("${wfone.datasource.username}")
	private String wfoneDataSourceUsername;

	@Value("${wfone.datasource.password}")
	private String wfoneDataSourcePassword;

	@Value("${wfone.datasource.max.connections}")
	private String wfoneDataSourceMaxConnections;

	@Bean
	public DataSource wfoneDataSource() {
		logger.debug("Creating datasource for " + wfoneDataSourceUrl);
		BasicDataSource result;

		String dbUrl = wfoneDataSourceUrl;
		result = new BasicDataSource();

		result.setUsername(wfoneDataSourceUsername);
		result.setPassword(wfoneDataSourcePassword);
		result.setDriverClassName(org.postgresql.Driver.class.getName());
		result.setUrl(dbUrl);
		result.setInitialSize(1);
		logger.debug("wfoneDataSourceMaxConnections=" + wfoneDataSourceMaxConnections);
		result.setMaxTotal(Integer.parseInt(wfoneDataSourceMaxConnections));

		return result;
	}

	@Bean
	public PostgreSqlAreaOfInterestQuery postgreSpatialQuery() {
		return new PostgreSpatialQuery(wfoneDataSource());
	}
}
