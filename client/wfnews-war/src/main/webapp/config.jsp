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

<%@ page language="java" contentType="application/json; charset=UTF-8" pageEncoding="UTF-8"%>

<%
  ApplicationContext context =  WebApplicationContextUtils.getWebApplicationContext(application);
  Properties properties = (Properties)context.getBean("applicationProperties");
  if (properties != null) {
    StringBuffer url = request.getRequestURL();
    String uri = request.getRequestURI();
    String ctx = request.getContextPath();
    String baseUrl = url.substring(0, url.length() - uri.length() + ctx.length()) + "/";

    StringBuilder json = new StringBuilder("{");

    // General Application Section
    json.append("\"application\":{");
      json.append("\"lazyAuthenticate\":").append("true").append(",");
      json.append("\"acronym\":\"").append(properties.getProperty("project.acronym", "")).append("\"").append(",");
      json.append("\"version\":\"").append(properties.getProperty("application.version", "")).append("\"").append(",");
      json.append("\"buildNumber\":\"").append(properties.getProperty("build.number", "")).append("\"").append(",");
      json.append("\"environment\":\"").append(properties.getProperty("default.application.environment", "")).append("\"").append(",");
      json.append("\"polling\":{");
          json.append("\"audibleAlert\":{");
            json.append("\"unacknowledgedRofPolling\":\"").append(properties.getProperty("audible.alert.rof.polling", "")).append("\"").append(",");
            json.append("\"alertFrequency\":\"").append(properties.getProperty("audible.alert.frequency", "")).append("\"");
          json.append("},");
        json.append("\"mapTool\":{");
          json.append("\"incidentsPolling\":\"").append(properties.getProperty("maptool.incidents.polling", "")).append("\"").append(",");
          json.append("\"rofPolling\":\"").append(properties.getProperty("maptool.rof.polling", "")).append("\"").append(",");
          json.append("\"layerRefreshPolling\":\"").append(properties.getProperty("maptool.layer.refresh.polling", "")).append("\"");
        json.append("},");
        json.append("\"rof\":{");
          json.append("\"refresh\":\"").append(properties.getProperty("rof.refresh.polling", "")).append("\"");
        json.append("},");
      json.append("\"nrof\":{");
      json.append("\"refresh\":\"").append(properties.getProperty("nrof.refresh.polling", "")).append("\"");
      json.append("}");
      json.append("},");
      json.append("\"maxListPageSize\":{");
        json.append("\"incidents\":\"").append(properties.getProperty("wildfire.incidents.maximum.results", "")).append("\"").append(",");
        json.append("\"incidents-table\":\"").append(properties.getProperty("wildfire.incidents.table.maximum.results", "")).append("\"").append(",");
        json.append("\"rofs-table\":\"").append(properties.getProperty("wildfire.incidents.table.maximum.results", "")).append("\"").append(",");
        json.append("\"rofs\":\"").append(properties.getProperty("report.of.fires.maximum.results", "")).append("\"");
      json.append("},");
      json.append("\"baseUrl\":\"").append(baseUrl).append("\"");
    json.append("},");

    // Map Icon Section
    json.append("\"mapIcons\":{");
      json.append("\"iconAnchor\":\"").append(properties.getProperty("map-icons.icon.anchor.size", "")).append("\"").append(",");
      json.append("\"iconSize\":\"").append(properties.getProperty("map-icons.icon.size", "")).append("\"").append(",");
      json.append("\"tooltipOffset\":\"").append(properties.getProperty("map-icons.tooltip.offset", "")).append("\"").append(",");
      json.append("\"shadowSize\":\"").append(properties.getProperty("map-icons.shadow.size", "")).append("\"");
    json.append("},");

    // External Application Section
    json.append("\"externalAppConfig\":{");
      json.append("\"im\":{");
        json.append("\"url\":\"").append(properties.getProperty("externalAppConfig.im.url", "")).append("\"");
      json.append("},");
      json.append("\"pointId\":{");
        json.append("\"url\":\"").append(properties.getProperty("externalAppConfig.pointId.url", "")).append("\"");
      json.append("},");

      json.append("\"AGOLfireCentres\":\"").append("https://services6.arcgis.com/ubm4tcTYICKBpist/ArcGIS/rest/services/British_Columbia_Fire_Centre_Boundaries/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&relationParam=&returnGeodetic=false&outFields=*&returnGeometry=false&returnCentroid=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&defaultSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson&token=").append("\",");
      json.append("\"AGOLevacOrders\":\"").append("https://services6.arcgis.com/ubm4tcTYICKBpist/ArcGIS/rest/services/Evacuation_Orders_and_Alerts/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&relationParam=&returnGeodetic=false&outFields=*&returnGeometry=false&returnCentroid=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&defaultSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson&token=").append("\",");
      json.append("\"AGOLareaRestrictions\":\"").append("https://services6.arcgis.com/ubm4tcTYICKBpist/ArcGIS/rest/services/British_Columbia_Area_Restrictions_-_View/FeatureServer/13/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&relationParam=&returnGeodetic=false&outFields=*&returnGeometry=false&returnCentroid=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&defaultSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson&token=").append("\"");

    json.append("},");

    // External Application Section
    json.append("\"mapServices\":{");
      json.append("\"openmapsBaseUrl\":\"").append(properties.getProperty("openmaps.url", "")).append("\"").append(",");
      json.append("\"#openmapsBaseUrl\":\"").append(properties.getProperty("openmaps.internal.url", "")).append("\"").append(",");
      json.append("\"drivebcBaseUrl\":\"").append(properties.getProperty("drivebc.url", "")).append("\"");
    json.append("},");

    // REST API Section
    String incidentsUri = properties.getProperty("wfim-rest.url", "");
    if (incidentsUri.endsWith("/")) {
      incidentsUri = incidentsUri.substring(0, incidentsUri.length() - 1); //Strip off trailing slash, if it exists.
    }
    String orgunitUri = properties.getProperty("wforg-org-unit-rest.url", "");
    if (orgunitUri.endsWith("/")) {
      orgunitUri = orgunitUri.substring(0, orgunitUri.length() - 1); //Strip off trailing slash, if it exists.
    }
    String wfdmUri = properties.getProperty("wfdm-rest.url", "");
    if (wfdmUri.endsWith("/")) {
      wfdmUri = wfdmUri.substring(0, wfdmUri.length() - 1); //Strip off trailing slash, if it exists.
    }
    String causecodesUri = properties.getProperty("wfim-cause-codes-config.url", "");
    if (causecodesUri.endsWith("/")) {
      causecodesUri = causecodesUri.substring(0, causecodesUri.length() - 1); //Strip off trailing slash, if it exists.
    }
    String localApiUri = properties.getProperty("wfnews.url", "");
    if (causecodesUri.endsWith("/")) {
      causecodesUri = causecodesUri.substring(0, causecodesUri.length() - 1); //Strip off trailing slash, if it exists.
    }
    json.append("\"rest\":{");
      json.append("\"newsLocal\":\"").append(localApiUri).append("\"").append(",");
      json.append("\"incidents\":\"").append(incidentsUri).append("\"").append(",");
      json.append("\"orgunit\":\"").append(orgunitUri).append("\"").append(",");
      json.append("\"wfdm\":\"").append(wfdmUri).append("\"").append(",");
      json.append("\"causecodes\":\"").append(causecodesUri).append("\"");
    json.append("},");

    // WebADE OAuth Section
    json.append("\"webade\":{");
      json.append("\"oauth2Url\":\"").append(properties.getProperty("webade-oauth2.authorize.url", "")).append("\",");
      json.append("\"clientId\":\"WFIM_INCIDENT_MANAGER_UI\",");
      json.append("\"authScopes\":\"WFIM.* WFONE.* WFORG.* WEBADE-REST.* WFDM.*\",");
      json.append("\"enableCheckToken\":true,");
      json.append("\"checkTokenUrl\":\"checkToken.jsp\"");

    json.append("}");

    json.append("}");
    out.write(json.toString());
  } else {
      out.write("{}");
  }
%>
