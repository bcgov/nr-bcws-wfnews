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
      json.append("\"lazyAuthenticate\":\"").append("true").append(",");
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

    // User Prefs Section
    json.append("\"userPreferences\":{");
    json.append("\"preferencesUrl\":\"").append(properties.getProperty("user-preferences.url", "")).append("\"");
    json.append("},");

    // External Application Section
    json.append("\"externalAppConfig\":{");
      json.append("\"im\":{");
      json.append("\"url\":\"").append(properties.getProperty("externalAppConfig.im.url", "")).append("\"");
    json.append("},");
      json.append("\"rof\":{");
        json.append("\"url\":\"").append(properties.getProperty("externalAppConfig.rof.url", "")).append("\"");
      json.append("},");
    json.append("\"nrof\":{");
    json.append("\"url\":\"").append(properties.getProperty("externalAppConfig.nrof.url", "")).append("\"");
    json.append("},");
      json.append("\"pointId\":{");
        json.append("\"url\":\"").append(properties.getProperty("externalAppConfig.pointId.url", "")).append("\"");
      json.append("},");
      json.append("\"jasper\":{");
        json.append("\"url\":\"").append(properties.getProperty("externalAppConfig.jasper.url", "")).append("\"").append(",");
        json.append("\"authentication\":\"").append(properties.getProperty("externalAppConfig.jasper.authentication", "")).append("\"").append(",");
        json.append("\"user\":\"").append(properties.getProperty("externalAppConfig.jasper.user", "")).append("\"").append(",");
        json.append("\"password\":\"").append(properties.getProperty("externalAppConfig.jasper.password", "")).append("\"").append(",");
        json.append("\"themeHash\":\"").append(properties.getProperty("externalAppConfig.jasper.theme.hash", "")).append("\"").append(",");
        json.append("\"scriptsHash\":\"").append(properties.getProperty("externalAppConfig.jasper.scripts.hash", "")).append("\"");
      json.append("}");
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
    json.append("\"rest\":{");
      json.append("\"incidents\":\"").append(incidentsUri).append("\"").append(",");
      json.append("\"orgunit\":\"").append(orgunitUri).append("\"").append(",");
      json.append("\"wfdm\":\"").append(wfdmUri).append("\"").append(",");
      json.append("\"causecodes\":\"").append(causecodesUri).append("\"");
    json.append("},");

    // WebADE OAuth Section


    // mapServiceConfig Section
    json.append("\"mapServiceConfig\":{");
      json.append("\"map\":{");
        json.append("\"center\":[");
          json.append(properties.getProperty("mapServiceConfig.map.center.lon", "")).append(",");
          json.append(properties.getProperty("mapServiceConfig.map.center.lat", ""));
        json.append("],");
        json.append("\"zoom\":").append(properties.getProperty("mapServiceConfig.map.zoom", "")).append(",");
        json.append("\"leafOpt\":{");
          json.append("\"zoomControl\":").append(properties.getProperty("mapServiceConfig.leafOpt.zoomControl", "")).append(",");
          json.append("\"attributionControl\":").append(properties.getProperty("mapServiceConfig.leafOpt.attributionControl", ""));
        json.append("},");
        json.append("\"baseMaps\":").append(properties.getProperty("mapServiceConfig.baseMaps", "").replaceAll("'", "\""));
      json.append("},");

      // mapServiceConfig.basemapUI Section
      boolean isFirst = true;
      String baseMaps = properties.getProperty("mapServiceConfig.baseMaps", "");
      Pattern p = Pattern.compile("'(\\w*)'");
      Matcher m = p.matcher(baseMaps);
      json.append("\"basemapUI\":{");
      while (m.find()) {
        String currentTilemapLayer = m.group().replaceAll("'", "");
          if (!isFirst) {
            json.append(",");
          } else {
            isFirst = false;
          }
        json.append("\"").append(currentTilemapLayer).append("\":{");
          json.append("\"title\":\"").append(properties.getProperty("mapServiceConfig.basemapUI." + currentTilemapLayer + ".title", "")).append("\",");
          json.append("\"thumbnail\":\"").append(properties.getProperty("mapServiceConfig.basemapUI." + currentTilemapLayer + ".thumbnail", "")).append("\"");
        json.append("}");
      }
      json.append("},");

      // mapServiceConfig.layerSettings Section
      json.append("\"layerSettings\":{");
        json.append("\"layerServices\":{");
          String wfUrl = properties.getProperty("geoserver.wms.url", "");
          // String xwfUrl = properties.getProperty("geoserver.wms.oracle.url", wfUrl);
          // String bcgwUrl = properties.getProperty("geoserver.wms.bcgw.url", wfUrl);
          String resourcesUrl = properties.getProperty("geoserver.wf.ows.url", "");

          json.append("\"bcgw\":{");
            json.append("\"name\":\"WF\",");
            json.append("\"url\":\"").append(wfUrl).append("\"");
          json.append("},");

          json.append("\"wildfire\":{");
            json.append("\"name\":\"WF\",");
            json.append("\"url\":\"").append(wfUrl).append("\"");
          json.append("},");

          json.append("\"mobileResource\":{");
            json.append("\"type\": \"wfs\",");
            json.append("\"name\":\"Wildfire-WFS\",");
            json.append("\"url\":\"").append(resourcesUrl).append("\"");
          json.append("},");

          String wfUrlSecured = properties.getProperty("geoserver.wms.url.secured", "");
          String resourcesUrlSecured = properties.getProperty("geoserver.wf.ows.url.secured", "");

          json.append("\"bcgw-secured\":{");
            json.append("\"name\":\"WF\",");
            json.append("\"url\":\"").append(wfUrlSecured).append("\"");
          json.append("},");

          json.append("\"wildfire-secured\":{");
            json.append("\"name\":\"WF\",");
            json.append("\"url\":\"").append(wfUrlSecured).append("\"");
          json.append("},");

          json.append("\"mobileResource-secured\":{");
            json.append("\"type\": \"wfs\",");
            json.append("\"name\":\"Wildfire-WFS\",");
            json.append("\"url\":\"").append(resourcesUrlSecured).append("\"");
          json.append("}");

        json.append("},");

        //String layerConfig = "";
        Resource resource = new ClassPathResource("config-layers.json");
        InputStream resourceInputStream = resource.getInputStream();

        BufferedReader br = new BufferedReader( new InputStreamReader( resourceInputStream ));
        String line;

        // skip first line
        br.readLine();

        while(( line = br.readLine()) != null ) {
          json.append( line );
        }
      // last line of config-layers.json will close layerSettings

    json.append("},");

    //causeCode section
    json.append("\"causeCodeConfig\":{");
      json.append("\"web\":{");
        json.append("\"url\":\"").append(properties.getProperty("wfim-cause-codes-web.url", "")).append("\"");
      json.append("},");
      json.append("\"rest\":{");
        json.append("\"url\":\"").append(properties.getProperty("wfim-cause-codes-rest.url", "")).append("\"");
      json.append("}");
    json.append("}");

    json.append("}");
    out.write(json.toString());
  } else {
      out.write("{}");
  }
%>
