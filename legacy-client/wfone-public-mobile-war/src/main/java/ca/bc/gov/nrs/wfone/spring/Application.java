package ca.bc.gov.nrs.wfone.spring;

import org.springframework.web.WebApplicationInitializer;
import org.springframework.web.context.ContextLoaderListener;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.servlet.DispatcherServlet;
import org.tuckey.web.filters.urlrewrite.UrlRewriteFilter;

import javax.servlet.DispatcherType;
import javax.servlet.FilterRegistration;
import javax.servlet.ServletContext;
import javax.servlet.ServletRegistration;
import java.util.EnumSet;

public class Application implements WebApplicationInitializer {

    @Override
    public void onStartup(ServletContext container) {

        // Set up annotation config context
        AnnotationConfigWebApplicationContext rootContext =
                new AnnotationConfigWebApplicationContext();
        rootContext.register(AppConfig.class);

        
        container.addListener(new ContextLoaderListener(rootContext));
        container.addFilter("corsFilter", new ca.bc.gov.nrs.wfone.filter.CORSFilter())
                .addMappingForUrlPatterns(null, true, "/*");

        // Register check token servlet, spring security context will be available from above configuration
        ServletRegistration.Dynamic dispatcher =
                container.addServlet("Check Token Servlet", new DispatcherServlet(rootContext));
        dispatcher.setLoadOnStartup(1);
        dispatcher.addMapping("/checkToken.jsp");

        // Set up url rewrite filter - will automatically use WEB-INF/urlrewrite.xml
        // Used to allow direct url links to angular routes - otherwise you will get 404 as they don't exist as actual server resources
        FilterRegistration.Dynamic urlReWrite = container.addFilter("UrlRewriteFilter", new UrlRewriteFilter());
        EnumSet<DispatcherType> urlReWriteDispatcherTypes = EnumSet.of(DispatcherType.REQUEST, DispatcherType.FORWARD);
        urlReWrite.addMappingForUrlPatterns(urlReWriteDispatcherTypes, true, "/*");
    }
}
