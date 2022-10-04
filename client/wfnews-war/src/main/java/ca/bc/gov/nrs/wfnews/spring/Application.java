package ca.bc.gov.nrs.wfnews.spring;

import org.springframework.web.WebApplicationInitializer;
import org.springframework.web.context.ContextLoaderListener;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.filter.DelegatingFilterProxy;
import org.springframework.web.servlet.DispatcherServlet;
import org.tuckey.web.filters.urlrewrite.UrlRewriteFilter;

import javax.servlet.ServletContext;
import javax.servlet.ServletRegistration;
import javax.servlet.DispatcherType;
import javax.servlet.FilterRegistration;
import java.util.EnumSet;

public class Application implements WebApplicationInitializer {
    private void newAppServlet(ServletContext servletContext) {
        AnnotationConfigWebApplicationContext dispatcherContext = new AnnotationConfigWebApplicationContext();
    
        dispatcherContext.register(DispatcherConfig.class);
        
        DispatcherServlet dispatcherServlet = new DispatcherServlet(dispatcherContext);
        
        ServletRegistration.Dynamic dispatcher = servletContext.addServlet("checkToken", dispatcherServlet);
        dispatcher.setLoadOnStartup(1);
        dispatcher.addMapping("/checkToken.jsp");
    }

    @Override
    public void onStartup(ServletContext container) {
        AnnotationConfigWebApplicationContext rootContext = new AnnotationConfigWebApplicationContext();
        rootContext.register(AppConfig.class);
        container.addListener(new ContextLoaderListener(rootContext));
        container.addFilter("springSecurityFilterChain", new DelegatingFilterProxy("springSecurityFilterChain")).addMappingForUrlPatterns(null, true, "/*");

        newAppServlet(container);

        // Used to allow direct url links to angular routes - otherwise you will get 404 as they don't exist as actual server resources
        FilterRegistration.Dynamic urlReWrite = container.addFilter("UrlRewriteFilter", new UrlRewriteFilter());
        EnumSet<DispatcherType> urlReWriteDispatcherTypes = EnumSet.of(DispatcherType.REQUEST, DispatcherType.FORWARD);
        urlReWrite.addMappingForUrlPatterns(urlReWriteDispatcherTypes, true, "/*");
    }
}
