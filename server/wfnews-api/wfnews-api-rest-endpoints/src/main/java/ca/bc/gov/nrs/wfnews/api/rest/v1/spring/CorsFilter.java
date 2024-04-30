package ca.bc.gov.nrs.wfnews.api.rest.v1.spring;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Enumeration;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorsFilter implements Filter {
	private static final Logger logger = LoggerFactory.getLogger(CorsFilter.class);

	public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
			throws IOException, ServletException {
		HttpServletResponse response = (HttpServletResponse) res;
		HttpServletRequest request = (HttpServletRequest) req;
		response.setHeader("Access-Control-Allow-Credentials", "true");
		response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS, HEAD, PUT, POST, DELETE");
		response.setHeader("Access-Control-Max-Age", "3600");
		
		// Set Access-Control-Allow-Headers explicitly
		Enumeration<String> headerNames = request.getHeaderNames();
		ArrayList<String> headersList = new ArrayList<String>();
		
		if (headerNames != null) {
			while (headerNames.hasMoreElements()) {
				headersList.add(headerNames.nextElement());
				headersList.add("Content-type");
				headersList.add("Authorization");
			}
		}

		if (!headersList.isEmpty()) {
			String headers = String.join(", ", headersList);
			if (headers != null) {
				response.setHeader("Access-Control-Allow-Headers", headers);
			}else response.setHeader("Access-Control-Allow-Headers", "*");
		} else
			response.setHeader("Access-Control-Allow-Headers", "*");
			
		// Set Access-Control-Allow-Origin explicitly	
		String origin = null;
		
		if(request.getHeader("Origin") != null) {
			origin = request.getHeader("Origin");
		} else origin = request.getHeader("origin");
		
		if(origin != null) {
			response.setHeader("Access-Control-Allow-Origin", origin);
		} else response.setHeader("Access-Control-Allow-Origin", "*");
		

		if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
			response.setStatus(HttpServletResponse.SC_OK);
			response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS, HEAD, PUT, POST, DELETE");
			response.setHeader("Access-Control-Allow-Headers", "Content-type, Authorization");
			response.setHeader("Access-Control-Allow-Origin", "*");
		} else {
			chain.doFilter(req, res);
		}
	}

	public void init(FilterConfig filterConfig) {
		logger.info("Initializing CORS filter");
	}

	public void destroy() {
		logger.info("Destructing CORS filter");
	}
}
