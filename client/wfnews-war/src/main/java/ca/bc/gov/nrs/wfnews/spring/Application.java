package ca.bc.gov.nrs.wfnews.spring;

import java.util.EnumSet;

import jakarta.servlet.DispatcherType;
import jakarta.servlet.FilterRegistration;
import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletRegistration;

import org.springframework.web.WebApplicationInitializer;
import org.springframework.web.context.ContextLoaderListener;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.filter.DelegatingFilterProxy;
import org.springframework.web.servlet.DispatcherServlet;

public class Application implements WebApplicationInitializer {
    private void newAppServlet(ServletContext servletContext) {
        AnnotationConfigWebApplicationContext dispatcherContext = new AnnotationConfigWebApplicationContext();
        dispatcherContext.register(DispatcherConfig.class);

        ServletRegistration.Dynamic dispatcher = servletContext.addServlet("checkToken",
                new DispatcherServlet(dispatcherContext));
        dispatcher.setLoadOnStartup(1);
        dispatcher.addMapping("/checkToken.jsp");

        ServletRegistration.Dynamic youtubeDispatcher = servletContext.addServlet("youtube",
                new DispatcherServlet(dispatcherContext));
        youtubeDispatcher.setLoadOnStartup(1);
        youtubeDispatcher.addMapping("/youtube.jsp", "/youtube-embed");
    }

    @Override
    public void onStartup(ServletContext container) {
        AnnotationConfigWebApplicationContext rootContext = new AnnotationConfigWebApplicationContext();
        rootContext.register(AppConfig.class);
        container.addListener(new ContextLoaderListener(rootContext));
        container.addFilter("springSecurityFilterChain", new DelegatingFilterProxy("springSecurityFilterChain"))
                .addMappingForUrlPatterns(null, true, "/*");

        newAppServlet(container);

        // Used to allow direct url links to angular routes - otherwise you will get 404
        // as they don't exist as actual server resources
        FilterRegistration.Dynamic urlReWrite = container.addFilter("SpaRoutingFilter", new SpaRoutingFilter());
        EnumSet<DispatcherType> urlReWriteDispatcherTypes = EnumSet.of(DispatcherType.REQUEST, DispatcherType.FORWARD);
        urlReWrite.addMappingForUrlPatterns(urlReWriteDispatcherTypes, true, "/*");
    }
}
