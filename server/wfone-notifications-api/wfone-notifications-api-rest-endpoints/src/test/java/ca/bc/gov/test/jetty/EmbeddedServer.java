package ca.bc.gov.test.jetty;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import javax.sql.DataSource;

import org.eclipse.jetty.annotations.AnnotationConfiguration;
import org.eclipse.jetty.annotations.ClassInheritanceHandler;
import org.eclipse.jetty.plus.jndi.Resource;
import org.eclipse.jetty.security.SecurityHandler;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.webapp.Configuration;
import org.eclipse.jetty.webapp.WebAppContext;
import org.glassfish.jersey.server.spring.SpringWebApplicationInitializer;
import org.junit.Assert;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.WebApplicationInitializer;

import ca.bc.gov.nrs.wfone.api.rest.v1.spring.ApplicationInitializer;

public class EmbeddedServer {
	
	private static final Logger logger = LoggerFactory.getLogger(EmbeddedServer.class);

	private static Server server;

	public static void startIfRequired(int port, String contextPath, Map<String, DataSource> dataSources) throws Exception {
		logger.debug("<startIfRequired "+port+"/"+contextPath);

		logger.debug("server="+server);
		if (server == null) {

			System.setProperty("java.naming.factory.url.pkgs", "org.eclipse.jetty.jndi");
			System.setProperty("java.naming.factory.initial", "org.eclipse.jetty.jndi.InitialContextFactory");

			server = new Server(port);

	        WebAppContext context = new WebAppContext();
	        AnnotationConfiguration annotationConfiguration = new AnnotationConfiguration() {
				@Override
				public void preConfigure(WebAppContext ctx) throws Exception {

					ClassInheritanceMap map = new ClassInheritanceMap();
					Set<String> set = new HashSet<>();
					set.add(ApplicationInitializer.class.getName());
					set.add(SpringWebApplicationInitializer.class.getName());
					map.put(WebApplicationInitializer.class.getName(), set);
					ctx.setAttribute(CLASS_INHERITANCE_MAP, map);

					_classInheritanceHandler = new ClassInheritanceHandler(map);
				}
			};
			
			context.setConfigurations(new Configuration[] {annotationConfiguration});
	        
	        context.setContextPath(contextPath);
			context.setResourceBase("src/main/webapp");
	        context.setParentLoaderPriority(true);
	        
			SecurityHandler securityHandler = context.getSecurityHandler();
			Assert.assertNotNull(securityHandler);
			securityHandler.setLoginService(new TestLoginService());

			if(dataSources!=null) {
				for(String dataSourceName:dataSources.keySet()) {
					DataSource dataSource = dataSources.get(dataSourceName);
					Resource resource = new Resource("java:comp/env/" + dataSourceName, dataSource);
					server.setAttribute(dataSourceName, resource);
				}
			}

			server.setHandler(context);
			server.start();
		}

		logger.debug(">startIfRequired");
	}

	public static void stop() throws Exception {
		if (server != null) {
			server.stop();
			server.join();
			server.destroy();
			server = null;
		}
	}
}