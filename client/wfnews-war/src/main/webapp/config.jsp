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

    String services6 = EnvironmentVariable.getVariable("SERVICES6_BASE_URL"); 
    if (services6 != null && services6.endsWith("/")) {
      services6 = services6.substring(0, services6.length() - 1); //Strip off trailing slash, if it exists.
    }

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
      json.append("\"AGOLfireCentres\":\"").append(services6).append("/ubm4tcTYICKBpist/ArcGIS/rest/services/British_Columbia_Fire_Centre_Boundaries/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&relationParam=&returnGeodetic=false&outFields=*&returnGeometry=false&returnCentroid=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&defaultSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson&token=").append("\",");
      json.append("\"AGOLevacOrders\":\"").append(agolEvacOrders).append("\",");
      json.append("\"AGOLareaRestrictions\":\"").append(agolAreaRestrictions).append("\",");
      json.append("\"AGOLBansAndProhibitions\":\"").append(agolBansAndProhibitions).append("\",");
      json.append("\"AGOLDangerRatings\":\"").append(agolDangerRatings).append("\",");
      json.append("\"AGOLperimetres\":\"").append(services6).append("/ubm4tcTYICKBpist/arcgis/rest/services/BCWS_FirePerimeters_PublicView/FeatureServer/0/").append("\",");
      json.append("\"AGOLactiveFirest\":\"").append(services6).append("/ubm4tcTYICKBpist/ArcGIS/rest/services/BCWS_ActiveFires_PublicView/FeatureServer/0/").append("\",");
      json.append("\"evacDefaultUrl\":\"").append("https://www.emergencyinfobc.gov.bc.ca/current-wildfire-information-2023").append("\",");
      json.append("\"evacDefaultBulletin\":\"").append("https://www.emergencyinfobc.gov.bc.ca").append("\",");
      json.append("\"currentRestrictions\":\"").append("https://www2.gov.bc.ca/gov/content/safety/wildfire-status/prevention/fire-bans-and-restrictions").append("\",");
      json.append("\"recSiteTrailsClosures\":\"").append("https://www.sitesandtrailsbc.ca/search?status=closed&view=list").append("\",");
      json.append("\"parksClosures\":\"").append("https://bcparks.ca/active-advisories/?type=wildfire").append("\",");
      json.append("\"localAuthoritiesUrl\":\"").append("https://www.civicinfo.bc.ca/directories").append("\",");
      json.append("\"wildfirePreparednessUrl\":\"").append("https://www2.gov.bc.ca/assets/gov/public-safety-and-emergency-services/emergency-preparedness-response-recovery/embc/preparedbc/preparedbc-guides/wildfire_preparedness_guide.pdf").append("\",");
      json.append("\"buildEmergencyKitUrl\":\"").append("https://www2.gov.bc.ca/gov/content/safety/emergency-management/preparedbc/build-an-emergency-kit-and-grab-and-go-bag").append("\",");
      json.append("\"preparedBCUrl\":\"").append("https://www2.gov.bc.ca/gov/content/safety/emergency-management/preparedbc").append("\",");
      json.append("\"preparedBCFacebook\":\"").append("https://www.facebook.com/PreparedBC").append("\",");
      json.append("\"embcUrl\":\"").append("https://www.emergencyinfobc.gov.bc.ca").append("\",");
      json.append("\"evacGuidanceUrl\":\"").append("https://www2.gov.bc.ca/gov/content/safety/emergency-management/preparedbc/evacuation-recovery/evacuee-guidance").append("\",");
      json.append("\"localGovUrl\":\"").append("https://www2.gov.bc.ca/gov/content/governments/local-governments/facts-framework/systems").append("\",");
      json.append("\"emergencyAlertUrl\":\"").append("https://www2.gov.bc.ca/gov/content/safety/public-safety/emergency-alerts").append("\",");
      json.append("\"driveBCUrl\":\"").append("https://www.drivebc.ca/mobile/index.html").append("\",");
      json.append("\"evacServicesUrl\":\"").append("https://ess.gov.bc.ca").append("\",");
      json.append("\"dangerSummary\":\"").append("https://wfapps.nrs.gov.bc.ca/pub/wfwx-danger-summary-war/dangerSummary").append("\",");
      json.append("\"highRiskActivities\":\"").append("https://www2.gov.bc.ca/gov/content/safety/wildfire-status/prevention/for-industry-commercial-operators/high-risk-activities").append("\",");
	  
	  json.append("\"contactInformation\":{");
      json.append("\"rofPhoneNumber\":\"1 800 663-5555\",");
      json.append("\"reportAWildfirePhone\":\"1 800 663-5555 or *5555 on a cell\",");
      json.append("\"wildFireInformationLine\":\"1 888 336-7378\",");
      json.append("\"burnRegistrationLine\":\"1 888 797-1717\",");
	   json.append("\"socialMedia\":{");
			json.append("\"facebook\":\"https://www.facebook.com/BCForestFireInfo/\"");
	   json.append("},");
	   json.append("\"moreInformationLink\":\"https://www2.gov.bc.ca/gov/content/safety/wildfire-status/contact-channels#:~:text=Immediately%20call%201%20800%20663,wildfire%20regulations%20in%20British%20Columbia.\"");
	   json.append("},");
	  json.append("\"wfdmProxy\":\"wfdmProxy.jsp\",");
      json.append("\"airQualityUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=956DEE07D8F744D2B8A7620FD241C161").append("\",");
      json.append("\"faqUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=B36D58C33BBC41CEA5C89C2C13F238E4").append("\",");
      json.append("\"bcwsDisclaimerUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=DE91907CDB3E4B5EB2F0363569079B85").append("\",");
      json.append("\"agolTermsOfUseUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=14CE6DD7756F402287618963D936BE44").append("\",");
      json.append("\"bcwsFacebookUrl\":\"").append("https://www.facebook.com/BCForestFireInfo/").append("\",");
      json.append("\"bcwsYoutubeUrl\":\"").append("https://www.youtube.com/@BCWildfireService").append("\",");
      json.append("\"bcwsBlogUrl\":\"").append("https://blog.gov.bc.ca/bcwildfire/").append("\",");
      json.append("\"localGovernmentMapsUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=B5744089A70F428FA189E5FF5CAE4E4A").append("\",");
      json.append("\"localGovernmentSystemsUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=79E361C3243F47E58F2BED364BA60B39").append("\",");
      json.append("\"accessibleGovernmentUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=E08E79740F9C41B9B0C484685CC5E412").append("\",");
      json.append("\"copyrightUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=1AAACC9C65754E4D89A118B875E0FBDA").append("\",");
      json.append("\"disclaimerUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=79F93E018712422FBC8E674A67A70535").append("\",");
      json.append("\"getHelpUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=6A77C17D0CCB48F897F8598CCC019111").append("\",");
      json.append("\"privacyUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=9E890E16955E4FF4BF3B0E07B4722932").append("\",");
      json.append("\"roadSafetyUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=D0FAAC6BD7014A049289C47454D6D324").append("\",");
      json.append("\"emergencyKitUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=A47FAF5F58C44E599B1D716989F76BD5").append("\",");
      json.append("\"emergencyAlertsUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=30DA852E39E7438DB8DA9B23D75A9073").append("\",");
      json.append("\"evacueeGuidanceUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=9B4B3AE951654A8AA3319CF1F779D489").append("\",");
      json.append("\"preparedBcGuidanceUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=5AD8BC4931914FBEB7F72ED9221C4567").append("\",");
      json.append("\"getPreparedUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=AD63768577B74F0D865B249B9CFC1A49").append("\",");
      json.append("\"wildfireStatusUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=F4EA16310CC541899EFC156A60D74FC9").append("\",");
      json.append("\"bcwsFireCentresUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=8A03092EBB8D439B805A2AD48CE2D241").append("\",");
      json.append("\"bcwsGlossaryUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=AE8243832F2A429097506C7CFF525F80").append("\",");
      json.append("\"bcwsContactsUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=C4E4B128165D48288555CB1AFABCC2E1").append("\",");
      json.append("\"reportWildfireUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=7444E304F43E41979E7E0848E6448CE2").append("\",");
      json.append("\"bansRestrictionsUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=AFEC3F8B5E89438CB0AC9E970CE6EE6F").append("\",");
      json.append("\"bansCaribooUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=60E47DA970CB4DFFBB1B3E3233C7034C").append("\",");
      json.append("\"bansCoastalUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=4EA3A43183E24EAD8106D73C35C03BD8").append("\",");
      json.append("\"bansForestUseUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=2FC4C34BB34F4F28B07C30139FB50298").append("\",");
      json.append("\"bansKamloopsUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=37BCAE0C13D64108A2136BAA5E226180").append("\",");
      json.append("\"bansNorthwestUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=62E1E7AE4FF44841A0E49CE05987874E").append("\",");
      json.append("\"bansOpenBurningUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=28DB52BC27B94C01B98E246B2DE423DB").append("\",");
      json.append("\"bansPgUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=D0C786AA5A6D44A48A37FAED53F20961").append("\",");
      json.append("\"bansSoutheastUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=D23A74B333CB435DB98A59D85AE8D0B1").append("\",");
      json.append("\"fireDangerUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=3DDDD01FBF674A619B3178603539E493").append("\",");
      json.append("\"fireWeatherUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=37543AF7575840A3B5D8AABB8E3322CE").append("\",");
      json.append("\"preventionUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=339F345750E140219F2C30AB369ADF16").append("\",");
      json.append("\"bansCat3OpenFireUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=C112804EE30F4CBBB1B3A4EC4C4952CE").append("\",");
      json.append("\"hazardAssessmentUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=8F7E71D2D123405C9D420F423570544C").append("\",");
      json.append("\"highRiskActvitiesUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=D02DCE4B5191440EB3F66FD1C8190D01").append("\",");
      json.append("\"culturalPrescribedFireUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=0A3A64A62D7244D2A92D2FD3F6C85564").append("\",");
      json.append("\"wildfireResponseUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=516DA86240AB405C85FDC0671685C961").append("\",");
      json.append("\"stagesOfControlUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=F2C4E0C116C44CB1A51CCBF3A19CA9C9").append("\",");
      json.append("\"stayInformedUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=12C3377FA00541C2B416FBAC40ECA3BD").append("\",");
      json.append("\"wildfireCausesUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=766C9790AA5B40E0BEEB4DFC8061C613").append("\",");
      json.append("\"wildfirePersonnelUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=1235CB3061FB4D79AF0ADD00D5946E16").append("\",");
      json.append("\"heavyEquipmentUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=9DFB875E1AB14CE2848367C64C8A7218").append("\",");
      json.append("\"incidentManagementTeamsUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=591A30FEB4544BE086BAA0197C622241").append("\",");
      json.append("\"bcwsFireCentreTrainingUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=ABF8E5C8F0D24E65A5C27968753245A7").append("\",");
      json.append("\"wildfireAviationUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=D7713F32D41F406A8AE18055C5146881").append("\",");
      json.append("\"wildfireCrewsUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=AE46239A43514CE3822EEB8A20685CD4").append("\",");
      json.append("\"wildfireAirQualityUrl\":\"").append("https://www2.gov.bc.ca/gov/content?id=7078A9438ECD45979207D300E2CEA6BF").append("\",");
      json.append("\"downloadPdfUrl\":\"").append("https://www2.gov.bc.ca/assets/download/2F048A731CC9463AB83E011FED0213A3").append("\",");
      json.append("\"bcGovHomeUrl\":\"").append("https://www2.gov.bc.ca").append("\"");
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
      json.append("\"services6BaseUrl\":\"").append(services6).append("\"").append(",");
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

    String wfrmResourceUri = EnvironmentVariable.getVariable("WFRM_RESOURCE_API_URL"); 
    if (wfrmResourceUri != null && wfrmResourceUri.endsWith("/")) {
      wfrmResourceUri = wfrmResourceUri.substring(0, wfrmResourceUri.length() - 1); //Strip off trailing slash, if it exists.
    }

    json.append("\"rest\":{");
      json.append("\"newsLocal\":\"").append(wfnewsUri).append("\"").append(",");
      json.append("\"incidents\":\"").append(incidentsUri).append("\"").append(",");
      json.append("\"wfnews\":\"").append(wfnewsUri).append("\"").append(",");
      json.append("\"wfdm\":\"").append(wfdmUri).append("\"").append(",");
      json.append("\"fire-report-api\":\"").append(fireReportUri).append("\"").append(",");
      json.append("\"notification-api\":\"").append(notificationUri).append("\"").append(",");
      json.append("\"pointId\":\"").append(pointidUri).append("\"").append(",");
      json.append("\"wfrmSchedule\":\"").append(wfrmResourceUri).append("\"");
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
      json.append("\"authScopes\":\"WFIM.* WFORG.* WFDM.* WFNEWS.* WFRM.*\",");
      json.append("\"enableCheckToken\":true,");
      json.append("\"checkTokenUrl\":\"").append(properties.getProperty("check.token.url", "")).append("\"");

    json.append("}");
	
    json.append("}");
    out.write(json.toString());
  } else {
      out.write("{}");
  }
%>
