package ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.spring;

import jakarta.servlet.FilterRegistration;
import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletRegistration;

import org.glassfish.jersey.servlet.ServletContainer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.web.context.AbstractSecurityWebApplicationInitializer;

import ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.jersey.JerseyApplication;

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
        restServlet.setInitParameter("jakarta.ws.rs.Application", JerseyApplication.class.getName());
        restServlet.setLoadOnStartup(1);
        
        restServlet.addMapping("/*");
        
    	LOGGER.info(">beforeSpringSecurityFilterChain");
	}
}
