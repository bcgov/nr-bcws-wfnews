package ca.bc.gov.nrs.wfnews.spring;

import java.io.IOException;
import java.net.MalformedURLException;
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

        // Bypass for static files, well-known paths, youtube-embed, or specific servlets.
        // youtube.jsp and checkToken.jsp are servlet mappings (see Application.newAppServlet),
        // not files on disk, so existsInWebapp cannot cover them -- these entries are load-bearing.
        if (uri.startsWith("/.well-known/")
                || uri.startsWith("/youtube-embed")
                || uri.startsWith("/youtube.jsp")
                || uri.startsWith("/checkToken.jsp")
                || STATIC_ASSETS_PATTERN.matcher(uri).matches()
                || existsInWebapp(uri)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Forward to index.html for Angular SPA routes
        request.getRequestDispatcher("/index.html").forward(request, response);
    }

    /**
     * Mirrors the notfile/notdir conditions of the urlrewrite.xml rule this filter replaced:
     * anything that really exists in the webapp is served as-is instead of being rewritten to
     * the Angular shell. The extension allowlist above cannot cover config.jsp / wfdmProxy.jsp,
     * and rewriting config.jsp hands the app HTML where it expects JSON, which breaks bootstrap.
     */
    private boolean existsInWebapp(String uri) {
        if (uri.isEmpty() || "/".equals(uri)) {
            return false;
        }
        try {
            return getServletContext().getResource(uri) != null;
        } catch (MalformedURLException e) {
            return false;
        }
    }
}
