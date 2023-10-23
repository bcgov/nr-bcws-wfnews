package ca.bc.gov.nrs.wfnews.persistence.v1.spring;

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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import ca.bc.gov.nrs.wfnews.persistence.v1.dao.AttachmentDao;
import ca.bc.gov.nrs.wfnews.persistence.v1.dao.ExternalUriDao;
import ca.bc.gov.nrs.wfnews.persistence.v1.dao.PublishedIncidentDao;
import ca.bc.gov.nrs.wfnews.persistence.v1.dao.SituationReportDao;
import ca.bc.gov.nrs.wfnews.persistence.v1.dao.StatisticsDao;
import ca.bc.gov.nrs.wfnews.persistence.v1.dao.mybatis.AttachmentDaoImpl;
import ca.bc.gov.nrs.wfnews.persistence.v1.dao.mybatis.ExternalUriDaoImpl;
import ca.bc.gov.nrs.wfnews.persistence.v1.dao.mybatis.PublishedIncidentDaoImpl;
import ca.bc.gov.nrs.wfnews.persistence.v1.dao.mybatis.SituationReportDaoImpl;
import ca.bc.gov.nrs.wfnews.persistence.v1.dao.mybatis.StatisticsDaoImpl;
import ca.bc.gov.nrs.wfone.common.persistence.dao.mybatis.BooleanTypeHandler;
import ca.bc.gov.nrs.wfone.common.persistence.dao.mybatis.InstantTypeHandler;
import ca.bc.gov.nrs.wfone.common.persistence.dao.mybatis.LocalDateTimeTypeHandler;
import ca.bc.gov.nrs.wfone.common.persistence.dao.mybatis.LocalDateTypeHandler;
import ca.bc.gov.nrs.wfone.common.persistence.dao.mybatis.LocalTimeTypeHandler;
import ca.bc.gov.nrs.wfone.common.persistence.dao.mybatis.ResetDirtyInterceptor;
import ca.bc.gov.webade.oauth2.spring.security.core.WebAdeAuthentication;

@EnableTransactionManagement
@Configuration
public class PersistenceSpringConfig {

	private static final Logger logger = LoggerFactory.getLogger(PersistenceSpringConfig.class);
	
	public PersistenceSpringConfig() {
		logger.debug("<PersistenceSpringConfig");
		
		logger.debug(">PersistenceSpringConfig");
	}
	
	@Bean
	public WebAdeAuthentication webAdeAuthentication() {
		return (WebAdeAuthentication) SecurityContextHolder.getContext().getAuthentication();
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
		configurer.setBasePackage("ca.bc.gov.nrs.wfnews.persistence.v1.dao.mybatis.mapper");
		configurer.setSqlSessionFactoryBeanName("sqlSessionFactory");
		return configurer;
	}
	
	@Bean
	public PublishedIncidentDao publishedIncidentDao() {
		return new PublishedIncidentDaoImpl();
	}
	
	@Bean
	public ExternalUriDao externalUriDao() {
		return new ExternalUriDaoImpl();
	}
	
	@Bean
	public AttachmentDao attachmentDao() {
		return new AttachmentDaoImpl();
	}

	@Bean
	public SituationReportDao situationReportDao() {
		return new SituationReportDaoImpl();
	}
	
	@Bean
	public StatisticsDao statisticsDao() {
		return new StatisticsDaoImpl();
	}
}
