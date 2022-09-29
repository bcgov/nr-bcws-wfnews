package ca.bc.gov.nrs.wfnews.spring;

import org.springframework.web.WebApplicationInitializer;
import org.springframework.web.context.ContextLoaderListener;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.filter.DelegatingFilterProxy;
import org.springframework.web.servlet.DispatcherServlet;
import org.tuckey.web.filters.urlrewrite.UrlRewriteFilter;

import ca.bc.gov.nrs.wfnews.web.controller.CheckTokenController;

import java.util.EnumSet;

import javax.servlet.DispatcherType;
import javax.servlet.FilterRegistration;
import javax.servlet.ServletContext;
import javax.servlet.ServletRegistration;

public class Application implements WebApplicationInitializer {
     private void registerEndpoint(ServletContext container, AnnotationConfigWebApplicationContext rootContext, String name, String mapping) {
        ServletRegistration.Dynamic dispatcher = container.addServlet(name, new DispatcherServlet(rootContext));
        dispatcher.setLoadOnStartup(1);
        dispatcher.addMapping(mapping);
    }
	
    @Override
    public void onStartup(ServletContext container) {
        // Set up annotation config context
        AnnotationConfigWebApplicationContext rootContext = new AnnotationConfigWebApplicationContext();
        rootContext.register(AppConfig.class);
        // Add delegating filter proxy and use springSecurityFilterChain bean, this is part of spring
        // when using @EnableWebSecurity as part of the AppConfig
        container.addListener(new ContextLoaderListener(rootContext));
        // Register check token servlet, spring security context will be available from above configuration
        registerEndpoint(container, rootContext, "Check Token Servlet", "/checkToken.jsp");
    }
}
