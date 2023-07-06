package ca.bc.gov.test.jetty;

import java.util.Map;

import javax.sql.DataSource;

import org.eclipse.jetty.plus.jndi.Resource;
import org.eclipse.jetty.security.SecurityHandler;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.webapp.WebAppContext;
import org.junit.Assert;

public class EmbeddedServer {

	private static Server server;

	public static void startIfRequired(int port, String contextPath, Map<String, DataSource> dataSources) throws Exception {
		if (server == null) {

			System.setProperty("java.naming.factory.url.pkgs", "org.eclipse.jetty.jndi");
			System.setProperty("java.naming.factory.initial", "org.eclipse.jetty.jndi.InitialContextFactory");

			server = new Server(port);

			WebAppContext context = new WebAppContext();
			context.setDescriptor("src/main/webapp/WEB-INF/web.xml");
			context.setResourceBase("src/main/webapp");
			context.setContextPath(contextPath);
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