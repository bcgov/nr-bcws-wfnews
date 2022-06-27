package ca.bc.gov.nrs.wfnews.api.rest.v1.spring;

import javax.servlet.ServletContainerInitializer;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.web.WebApplicationInitializer;
import javax.servlet.annotation.HandlesTypes;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Set;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
@HandlesTypes(WebApplicationInitializer.class)
@Order(Ordered.HIGHEST_PRECEDENCE)
public class FooServletContainerInitializer implements ServletContainerInitializer {
	
	private static final Logger logger = LoggerFactory.getLogger(FooServletContainerInitializer.class);

    @Override
    public void onStartup(Set<Class<?>> c, ServletContext ctx) throws ServletException {
        for (Class<?> clazz : c) {
            logger.debug("clazz = "+clazz);
            logger.debug(clazz.getResource('/' + clazz.getName().replace('.', '/') + ".class").toString());
            logger.debug("----------------");
        }

 
    }
}