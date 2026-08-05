package ca.bc.gov.nrs.wfnews.spring;

import java.io.IOException;
import java.util.regex.Pattern;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.web.filter.OncePerRequestFilter;

public class SpaRoutingFilter extends OncePerRequestFilter {

    private static final Pattern STATIC_ASSETS_PATTERN = Pattern.compile(
        ".*\\.(html|js|png|gif|jpg|jpeg|css|svg|ico|wav|woff|woff2|ttf|json)$",
        Pattern.CASE_INSENSITIVE
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String uri = request.getRequestURI();
        String contextPath = request.getContextPath();
        if (contextPath != null && !contextPath.isEmpty() && uri.startsWith(contextPath)) {
            uri = uri.substring(contextPath.length());
        }

        // Bypass for static files, well-known paths, youtube-embed, or specific servlets
        if (uri.startsWith("/.well-known/") 
                || uri.startsWith("/youtube-embed") 
                || uri.startsWith("/youtube.jsp")
                || uri.startsWith("/checkToken.jsp")
                || STATIC_ASSETS_PATTERN.matcher(uri).matches()) {
            filterChain.doFilter(request, response);
            return;
        }

        // Forward to index.html for Angular SPA routes
        request.getRequestDispatcher("/index.html").forward(request, response);
    }
}
