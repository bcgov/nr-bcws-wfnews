package ca.bc.gov.nrs.wfnews.spring;

import org.springframework.web.WebApplicationInitializer;
import org.springframework.web.context.ContextLoaderListener;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.context.support.GenericWebApplicationContext;
import org.springframework.web.servlet.DispatcherServlet;
import javax.servlet.ServletContext;
import javax.servlet.ServletRegistration;

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
        newAppServlet(container);
    }
}
