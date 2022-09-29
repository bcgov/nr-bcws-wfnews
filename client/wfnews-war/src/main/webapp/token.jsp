<%@ page import="org.springframework.context.ApplicationContext" %>
<%@ page import="org.springframework.web.context.support.WebApplicationContextUtils" %>
<%@ page import="java.util.Properties" %>
<%@ page import="java.util.regex.Pattern" %>
<%@ page import="java.util.regex.Matcher" %>
<%@ page import="java.io.InputStream" %>
<%@ page import="java.io.BufferedReader" %>
<%@ page import="java.io.InputStreamReader" %>
<%@ page import="org.springframework.core.io.Resource" %>
<%@ page import="org.springframework.core.io.ClassPathResource" %>
<%@ page import="ca.bc.gov.nrs.wfnews.util.CheckTokenUtil" %>
<%@ page language="java" contentType="application/json; charset=UTF-8" pageEncoding="UTF-8"%>

<%;
try {
  CheckTokenUtil util = new CheckTokenUtil();
  Object token = util.token(request, response);
  out.write(token.toString());
} catch (Exception e) {
  out.write("{}");
}
%>
