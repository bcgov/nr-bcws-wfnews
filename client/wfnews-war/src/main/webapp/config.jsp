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
<%@ page import="ca.bc.gov.nrs.wfnews.util.EnvironmentVariable" %>

<%@ page language="java" contentType="application/json; charset=UTF-8" pageEncoding="UTF-8"%>

<%
  ApplicationContext context =  WebApplicationContextUtils.getWebApplicationContext(application);
  Properties properties = (Properties)context.getBean("applicationProperties");
  if (properties != null) {
    StringBuffer url = request.getRequestURL();
    String uri = request.getRequestURI();
    String ctx = request.getContextPath();
    String baseUrl = EnvironmentVariable.getVariable("BASE_URL");
    String env = EnvironmentVariable.getVariable("APPLICATION_ENVIRONMENT");
    String siteminderPrefix = EnvironmentVariable.getVariable("SITEMINDER_URL_PREFIX");
    String syncIntervalMinutes = EnvironmentVariable.getVariable("SYNC_INTERVAL_MINUTES");

    String wfnewsApiKey = EnvironmentVariable.getVariable("WFNEWS_API_KEY");
    StringBuilder json = new StringBuilder("{");

    // General Application Section
    json.append("\"application\":{");
      json.append("\"lazyAuthenticate\":").append("true").append(",");
      json.append("\"acronym\":\"").append(properties.getProperty("project.acronym", "")).append("\"").append(",");
      json.append("\"version\":\"").append(properties.getProperty("application.version", "")).append("\"").append(",");
      json.append("\"buildNumber\":\"").append(properties.getProperty("build.number", "")).append("\"").append(",");
      json.append("\"environment\":\"").append(env).append("\"").append(",");
      json.append("\"baseUrl\":\"").append(baseUrl).append("\"").append(",");
      json.append("\"siteminderUrlPrefix\":\"").append(siteminderPrefix).append("\"").append(",");
      json.append("\"syncIntervalMinutes\":\"").append(syncIntervalMinutes).append("\"").append(",");

      json.append("\"wfnewsApiKey\":\"").append(wfnewsApiKey).append("\"");
    json.append("},");

    // Map Icon Section
    json.append("\"mapIcons\":{");
      json.append("\"iconAnchor\":\"").append(properties.getProperty("map-icons.icon.anchor.size", "")).append("\"").append(",");
      json.append("\"iconSize\":\"").append(properties.getProperty("map-icons.icon.size", "")).append("\"").append(",");
      json.append("\"tooltipOffset\":\"").append(properties.getProperty("map-icons.tooltip.offset", "")).append("\"").append(",");
      json.append("\"shadowSize\":\"").append(properties.getProperty("map-icons.shadow.size", "")).append("\"");
    json.append("},");

    String agolAreaRestrictions = EnvironmentVariable.getVariable("AGOL_AREA_RESTRICTIONS");
    String agolBansAndProhibitions = EnvironmentVariable.getVariable("AGOL_BANS_AND_PROHIBITIONS");
    String agolDangerRatings = EnvironmentVariable.getVariable("AGOL_DANGER_RATINGS");
    String agolEvacOrders = EnvironmentVariable.getVariable("AGOL_EVAC_ORDERS");

    // External Application Section
    json.append("\"externalAppConfig\":{");
      json.append("\"im\":{");
        json.append("\"url\":\"").append(properties.getProperty("externalAppConfig.im.url", "")).append("\"");
      json.append("},");
      json.append("\"pointId\":{");
        json.append("\"url\":\"").append(properties.getProperty("externalAppConfig.pointId.url", "")).append("\"");
      json.append("},");
      json.append("\"bcWildFireSupportPage\":\"").append(properties.getProperty("bcWildFireSupportPage", "")).append("\",");
      json.append("\"bcWildfireResponsePage\":\"").append("https://www2.gov.bc.ca/gov/content/safety/wildfire-status/wildfire-response/wildfire-personnel-and-response-tools").append("\",");
      json.append("\"appStoreUrl\":\"").append(properties.getProperty("appStoreUrl", "")).append("\",");
      json.append("\"googlePlayUrl\":\"").append(properties.getProperty("googlePlayUrl", "")).append("\",");
      json.append("\"AGOLfireCentres\":\"").append("https://services6.arcgis.com/ubm4tcTYICKBpist/ArcGIS/rest/services/British_Columbia_Fire_Centre_Boundaries/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&relationParam=&returnGeodetic=false&outFields=*&returnGeometry=false&returnCentroid=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&defaultSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson&token=").append("\",");
      json.append("\"AGOLevacOrders\":\"").append(agolEvacOrders).append("\",");
      json.append("\"AGOLareaRestrictions\":\"").append(agolAreaRestrictions).append("\",");
      json.append("\"AGOLBansAndProhibitions\":\"").append(agolBansAndProhibitions).append("\",");
      json.append("\"AGOLDangerRatings\":\"").append(agolDangerRatings).append("\",");
      json.append("\"AGOLperimetres\":\"").append("https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/BCWS_FirePerimeters_PublicView/FeatureServer/0/").append("\",");
      json.append("\"AGOLactiveFirest\":\"").append("https://services6.arcgis.com/ubm4tcTYICKBpist/ArcGIS/rest/services/BCWS_ActiveFires_PublicView/FeatureServer/0/").append("\",");
      json.append("\"evacDefaultUrl\":\"").append("https://www.emergencyinfobc.gov.bc.ca/current-wildfire-information-2023").append("\",");
      json.append("\"evacDefaultBulletin\":\"").append("https://www.emergencyinfobc.gov.bc.ca").append("\",");
      json.append("\"currentRestrictions\":\"").append("https://www2.gov.bc.ca/gov/content/safety/wildfire-status/prevention/fire-bans-and-restrictions").append("\",");
      json.append("\"recSiteTrailsClosures\":\"").append("http://www.sitesandtrailsbc.ca/closures.aspx").append("\",");
      json.append("\"parksClosures\":\"").append("https://bcparks.ca/active-advisories/?type=wildfire").append("\",");
      json.append("\"localAuthoritiesUrl\":\"").append("https://www.civicinfo.bc.ca/directories").append("\",");
      json.append("\"wildfirePreparednessUrl\":\"").append("https://www2.gov.bc.ca/assets/gov/public-safety-and-emergency-services/emergency-preparedness-response-recovery/embc/preparedbc/preparedbc-guides/wildfire_preparedness_guide.pdf").append("\",");
      json.append("\"buildEmergencyKitUrl\":\"").append("https://www2.gov.bc.ca/gov/content/safety/emergency-management/preparedbc/build-an-emergency-kit-and-grab-and-go-bag").append("\",");
      json.append("\"preparedBCUrl\":\"").append("https://www2.gov.bc.ca/gov/content/safety/emergency-management/preparedbc").append("\",");
      json.append("\"preparedBCFacebook\":\"").append("https://www.facebook.com/PreparedBC").append("\",");
      json.append("\"preparedBCTwitter\":\"").append("https://twitter.com/PreparedBC").append("\",");
      json.append("\"embcUrl\":\"").append("https://www.emergencyinfobc.gov.bc.ca").append("\",");
      json.append("\"embcTwitter\":\"").append("http://www.twitter.com/emergencyinfobc").append("\",");
      json.append("\"evacGuidanceUrl\":\"").append("https://www2.gov.bc.ca/gov/content/safety/emergency-management/preparedbc/evacuation-recovery/evacuee-guidance").append("\",");
      json.append("\"localGovUrl\":\"").append("https://www2.gov.bc.ca/gov/content/governments/local-governments/facts-framework/systems").append("\",");
      json.append("\"emergencyAlertUrl\":\"").append("https://www2.gov.bc.ca/gov/content/safety/public-safety/emergency-alerts").append("\",");
      json.append("\"driveBCUrl\":\"").append("https://www.drivebc.ca/mobile/index.html").append("\",");
      json.append("\"evacServicesUrl\":\"").append("https://ess.gov.bc.ca").append("\",");
	  
	  json.append("\"contactInformation\":{");
      json.append("\"rofPhoneNumber\":\"1 800 663-5555\",");
      json.append("\"reportAWildfirePhone\":\"1 800 663-5555 or *5555 on a cell\",");
      json.append("\"wildFireInformationLine\":\"1 888 336-7378\",");
      json.append("\"burnRegistrationLine\":\"1 888 797-1717\",");
	   json.append("\"socialMedia\":{");
			json.append("\"facebook\":\"https://www.facebook.com/BCForestFireInfo/\",");
			json.append("\"twitter\":\"https://twitter.com/bcgovfireinfo/\"");
	   json.append("},");
	   json.append("\"moreInformationLink\":\"https://www2.gov.bc.ca/gov/content/safety/wildfire-status/contact-channels#:~:text=Immediately%20call%201%20800%20663,wildfire%20regulations%20in%20British%20Columbia.\"");
	   json.append("},");
	  json.append("\"wfdmProxy\":\"wfdmProxy.jsp\""); 
    json.append("},");

    String wfnewsUri = EnvironmentVariable.getVariable("WFNEWS_API_URL"); 
    if (wfnewsUri != null && wfnewsUri.endsWith("/")) {
      wfnewsUri = wfnewsUri.substring(0, wfnewsUri.length() - 1); //Strip off trailing slash, if it exists.
    }

    String driveBc = EnvironmentVariable.getVariable("DRIVEBC_BASE_URL"); 
    if (driveBc != null && driveBc.endsWith("/")) {
      driveBc = driveBc.substring(0, driveBc.length() - 1); //Strip off trailing slash, if it exists.
    }

    String openmaps = EnvironmentVariable.getVariable("OPENMAPS_BASE_URL"); 
    if (openmaps != null && openmaps.endsWith("/")) {
      openmaps = openmaps.substring(0, openmaps.length() - 1); //Strip off trailing slash, if it exists.
    }

    // External Application Section
    json.append("\"mapServices\":{");
      json.append("\"openmapsBaseUrl\":\"").append(openmaps).append("\"").append(",");
      json.append("\"wfnews\":\"").append(wfnewsUri).append("\"").append(",");
      json.append("\"drivebcBaseUrl\":\"").append(driveBc).append("\"");
    json.append("},");

    // REST API Section
    String incidentsUri = EnvironmentVariable.getVariable("WFIM_REST_URL"); 
    if (incidentsUri != null && incidentsUri.endsWith("/")) {
      incidentsUri = incidentsUri.substring(0, incidentsUri.length() - 1); //Strip off trailing slash, if it exists.
    }
    String orgunitUri = EnvironmentVariable.getVariable("ORG_UNIT_URL"); 
    if (orgunitUri != null && orgunitUri.endsWith("/")) {
      orgunitUri = orgunitUri.substring(0, orgunitUri.length() - 1); //Strip off trailing slash, if it exists.
    }
    String wfdmUri = EnvironmentVariable.getVariable("WFDM_API_URL"); 
    if (wfdmUri != null && wfdmUri.endsWith("/")) {
      wfdmUri = wfdmUri.substring(0, wfdmUri.length() - 1); //Strip off trailing slash, if it exists.
    }

    String fireReportUri = EnvironmentVariable.getVariable("FIRE_REPORT_API_URL"); 
    if (fireReportUri != null && fireReportUri.endsWith("/")) {
      fireReportUri = fireReportUri.substring(0, fireReportUri.length() - 1); //Strip off trailing slash, if it exists.
    }

    String notificationUri = EnvironmentVariable.getVariable("NOTIFICATION_API_URL"); 
    if (notificationUri != null && notificationUri.endsWith("/")) {
      notificationUri = notificationUri.substring(0, notificationUri.length() - 1); //Strip off trailing slash, if it exists.
    }

    String pointidUri = EnvironmentVariable.getVariable("POINT_ID_URL"); 
    if (pointidUri != null && pointidUri.endsWith("/")) {
      pointidUri = pointidUri.substring(0, pointidUri.length() - 1); //Strip off trailing slash, if it exists.
    }

    json.append("\"rest\":{");
      json.append("\"newsLocal\":\"").append(wfnewsUri).append("\"").append(",");
      json.append("\"incidents\":\"").append(incidentsUri).append("\"").append(",");
      json.append("\"wfnews\":\"").append(wfnewsUri).append("\"").append(",");
      json.append("\"wfdm\":\"").append(wfdmUri).append("\"").append(",");
      json.append("\"fire-report-api\":\"").append(fireReportUri).append("\"").append(",");
      json.append("\"notification-api\":\"").append(notificationUri).append("\"").append(",");
      json.append("\"pointId\":\"").append(pointidUri).append("\"");
    json.append("},");

    // WebADE OAuth Section
    String webadeOauth2AuthorizeUrl = EnvironmentVariable.getVariable("WEBADE_OAUTH2_AUTHORIZE_URL"); 
    if (webadeOauth2AuthorizeUrl != null && webadeOauth2AuthorizeUrl.endsWith("/")) {
      webadeOauth2AuthorizeUrl = webadeOauth2AuthorizeUrl.substring(0, webadeOauth2AuthorizeUrl.length() - 1); //Strip off trailing slash, if it exists.
    }
    String checktokenUrl = EnvironmentVariable.getVariable("WEBADE-OAUTH2_CHECK_TOKEN_V2_URL"); 
    if (checktokenUrl != null && checktokenUrl.endsWith("/")) {
      checktokenUrl = checktokenUrl.substring(0, checktokenUrl.length() - 1); //Strip off trailing slash, if it exists.
    }

    json.append("\"webade\":{");
      json.append("\"oauth2Url\":\"").append(webadeOauth2AuthorizeUrl).append("\"").append(",");
      json.append("\"clientId\":\"WFNEWS-UI\",");
      json.append("\"authScopes\":\"WFIM.* WFORG.* WFDM.* WFNEWS.*\",");
      json.append("\"enableCheckToken\":true,");
      json.append("\"checkTokenUrl\":\"").append(properties.getProperty("check.token.url", "")).append("\"");

    json.append("}");
	
    json.append("}");
    out.write(json.toString());
  } else {
      out.write("{}");
  }
%>
