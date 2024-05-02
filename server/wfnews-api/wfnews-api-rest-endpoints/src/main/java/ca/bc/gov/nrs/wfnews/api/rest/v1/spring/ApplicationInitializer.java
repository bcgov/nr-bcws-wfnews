package ca.bc.gov.nrs.wfnews.api.rest.v1.spring;

import javax.servlet.FilterRegistration;
import javax.servlet.ServletContext;
import javax.servlet.ServletRegistration;

import org.glassfish.jersey.servlet.ServletContainer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.web.context.AbstractSecurityWebApplicationInitializer;

import ca.bc.gov.nrs.wfnews.api.rest.v1.jersey.JerseyApplication;
import ca.bc.gov.nrs.wfone.common.rest.endpoints.filters.RequestMetricsFilter;
import ca.bc.gov.nrs.wfone.common.rest.endpoints.filters.VersionForwardingFilter;

@Order(Ordered.HIGHEST_PRECEDENCE)
public class ApplicationInitializer extends AbstractSecurityWebApplicationInitializer {

	private static final Logger LOGGER = LoggerFactory.getLogger(ApplicationInitializer.class);
	
	public ApplicationInitializer() {
		super(EndpointsSpringConfig.class);
		LOGGER.info("<ApplicationInitializer");
		
		LOGGER.info(">ApplicationInitializer");
	}	

    private static final String PAR_NAME_CTX_CONFIG_LOCATION = "contextConfigLocation";
	
	protected void beforeSpringSecurityFilterChain(ServletContext servletContext) {
    	LOGGER.info("<beforeSpringSecurityFilterChain");
    	
    	// Disable Jersey Spring Context Loader
    	servletContext.setInitParameter(PAR_NAME_CTX_CONFIG_LOCATION, "java configuration");
    	
        ServletRegistration.Dynamic restServlet = servletContext.addServlet("Rest Servlet", ServletContainer.class);
        restServlet.setInitParameter("javax.ws.rs.Application", JerseyApplication.class.getName());
        restServlet.setLoadOnStartup(1);
        
        restServlet.addMapping("/*");
    	
        FilterRegistration.Dynamic requestMetricsFilter = servletContext.addFilter("Request Metrics Filter", RequestMetricsFilter.class);
        requestMetricsFilter.setInitParameter("id_source", "WFONENOTIFICATIONSAPI");
        requestMetricsFilter.addMappingForUrlPatterns(null, false, "/*");
  
        FilterRegistration.Dynamic versionForwardingFilter = servletContext.addFilter("Version Forwarding Filter", VersionForwardingFilter.class);
        versionForwardingFilter.setInitParameter(VersionForwardingFilter.RESPONSE_VERSION_PARAM, "1");
        versionForwardingFilter.setInitParameter(VersionForwardingFilter.DEFAULT_REQUEST_VERSION_PARAM, "1");
        versionForwardingFilter.addMappingForUrlPatterns(null, false, "/*");

        FilterRegistration.Dynamic corsFilter = servletContext.addFilter("CORS Filter", CorsFilter.class);
        corsFilter.addMappingForUrlPatterns(null, false, "/*");
        
    	LOGGER.info(">beforeSpringSecurityFilterChain");
	}
}
