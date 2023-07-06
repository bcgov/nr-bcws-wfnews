package ca.bc.gov.nrs.wfone.persistence.v1.spring;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import javax.sql.DataSource;

import org.apache.ibatis.session.LocalCacheScope;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.TypeHandlerRegistry;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.mapper.MapperScannerConfigurer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import ca.bc.gov.nrs.wfone.persistence.v1.dao.NotificationDao;
import ca.bc.gov.nrs.wfone.persistence.v1.dao.NotificationSettingsDao;
import ca.bc.gov.nrs.wfone.persistence.v1.dao.NotificationTopicDao;
import ca.bc.gov.nrs.wfone.persistence.v1.dao.RoFFormDao;
import ca.bc.gov.nrs.wfone.persistence.v1.dao.RoFImageDao;
import ca.bc.gov.nrs.wfone.persistence.v1.dao.mybatis.NotificationDaoImpl;
import ca.bc.gov.nrs.wfone.persistence.v1.dao.mybatis.NotificationSettingsDaoImpl;
import ca.bc.gov.nrs.wfone.persistence.v1.dao.mybatis.NotificationTopicDaoImpl;
import ca.bc.gov.nrs.wfone.persistence.v1.dao.mybatis.RoFFormDaoImpl;
import ca.bc.gov.nrs.wfone.persistence.v1.dao.mybatis.RoFImageDaoImpl;

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
		configurer.setBasePackage("ca.bc.gov.nrs.wfone.persistence.v1.dao.mybatis.mapper");
		configurer.setSqlSessionFactoryBeanName("sqlSessionFactory");
		return configurer;
	}
	
	@Bean
	public NotificationSettingsDao notificationSettingsDao() {
		return new NotificationSettingsDaoImpl();
	}
	
	
	@Bean
	public NotificationDao notificationDao() {
		return new NotificationDaoImpl();
	}
	
	@Bean
	public NotificationTopicDao notificationTopicDao() {
		return new NotificationTopicDaoImpl();
	}

	@Bean
	public RoFFormDao rofFormDao() {
		return new RoFFormDaoImpl();
	}

	@Bean
	public RoFImageDao rofImageDao() {
	  	return new RoFImageDaoImpl();
	}

}
