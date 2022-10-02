<%@ page import="java.io.*" %>
<%@ page import="java.net.*" %>
<%@ page import="org.springframework.context.*" %>
<%@ page import="org.springframework.web.context.support.*" %>
<%@ page import="java.util.Properties" %>
<%@ page import="java.util.Collections" %>
<%@ page import="ca.bc.gov.nrs.wfnews.util.EnvironmentVariable" %>
<%! org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger("wfdmBytes"); %>
<%
  String documentId = request.getParameter("documentId");

  String token = (String) request.getSession().getAttribute("authToken");
  if (token == null) {
    response.sendError(401, "No token available in session to authenticate to WFDM.  Use checkToken to set it.");
    return;
  };

  try {
      String baseUrl = EnvironmentVariable.getVariable("WFDM_API_URL");

      logger.info("Proxying WFDM bytes request for document {} to WFDM instance {}", documentId, baseUrl);
      URL url = new URL(new URL(baseUrl), String.format("documents/%s/bytes", URLEncoder.encode(documentId)));

      logger.info("Proxying WFDM bytes request to {}", url.toString());

      // Setup connection
      HttpURLConnection urlConn = (HttpURLConnection) url.openConnection();
      urlConn.setRequestMethod("GET");
      for (String header : Collections.list((java.util.Enumeration<String>) request.getHeaderNames())) {
          urlConn.setRequestProperty(header, request.getHeader(header));
      }
      urlConn.setRequestProperty("Authorization", token);
      urlConn.connect();

      try (
          InputStream is = urlConn.getInputStream(); 
          OutputStream os = response.getOutputStream();
      ) {
          urlConn.getHeaderFields().entrySet();
          response.setStatus(urlConn.getResponseCode());
          byte[] buf = new byte[32 * 1024];
          int len = 0;
          while ((len = is.read(buf)) != -1) {
              os.write(buf, 0, len);
          }
      }

  } catch (Throwable t) {
      response.sendError(500, t.getMessage());
  }
%>
