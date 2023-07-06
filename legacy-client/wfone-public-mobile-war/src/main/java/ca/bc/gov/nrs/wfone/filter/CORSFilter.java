package ca.bc.gov.nrs.wfone.filter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class CORSFilter implements Filter {

    private static final Logger logger = LoggerFactory.getLogger(CORSFilter.class);
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        String url = ((HttpServletRequest)request).getRequestURL().toString();
        logger.info("corsfilter dofilter..." + url);
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        httpResponse.addHeader("Access-Control-Allow-Origin", "*");
        httpResponse.addHeader("Access-Control-Allow-Methods", "POST, GET, PUT, UPDATE, OPTIONS");
        httpResponse.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, X-Auth-Token, Content-Type");
        if ("OPTIONS".equalsIgnoreCase(((HttpServletRequest) request).getMethod())) {
            logger.info("corsfilter dofilter - options request");
            ((HttpServletResponse) response).setStatus(HttpServletResponse.SC_OK);
        } else {
            logger.info("corsfilter dofilter - request");
            chain.doFilter(request, response);
        }
    }

    @Override
    public void destroy() {

    }
}
