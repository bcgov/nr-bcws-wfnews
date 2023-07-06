<%@ page import="org.springframework.context.ApplicationContext" %>
<%@ page import="org.springframework.web.context.support.WebApplicationContextUtils" %>
<%@ page import="java.util.Properties" %>

<%
  ApplicationContext context =  WebApplicationContextUtils.getWebApplicationContext(application);
  Properties properties = (Properties)context.getBean("applicationProperties");
  if (properties != null) {
    StringBuffer url = request.getRequestURL();
    String uri = request.getRequestURI();
    String ctx = request.getContextPath();
    String baseUrl = url.substring(0, url.length() - uri.length() + ctx.length()) + "/";

    String json = "{";

    // General Application Section
    json = json.concat("\"application\":{");
      json = json.concat("\"acronym\":\"").concat(getEnvProp("project.acronym", properties)).concat("\"").concat(",");
      json = json.concat("\"version\":\"").concat(getEnvProp("application.version", properties)).concat("\"").concat(",");
      json = json.concat("\"buildNumber\":\"").concat(getEnvProp("build.number", properties)).concat("\"").concat(",");
      json = json.concat("\"environment\":\"").concat(getEnvProp("default.application.environment", properties)).concat("\"").concat(",");
      json = json.concat("\"baseUrl\":\"").concat(baseUrl).concat("\"");
    json = json.concat("}");

    json = json.concat(",");

    json = json.concat("\"applicationResources\":{");
    json = json.concat("\"bans-prohibitions-rss-location\":\"").concat(getEnvProp("bans.prohibitions.rss.location", properties)).concat("\"").concat(",");;
    json = json.concat("\"wfss-pointid-api\":\"").concat(getEnvProp("wfss.pointId.url", properties)).concat("\"").concat(",");
    json = json.concat("\"wfss-pointid-api-key\":\"").concat(getEnvProp("wfss.pointId.api.key", properties)).concat("\"").concat(",");
    json = json.concat("\"notifications-api-key\":\"").concat(getEnvProp("notifications.api.key", properties)).concat("\"").concat(",");

    json = json.concat("\"twitter-feed-profile-name\":\"").concat(getEnvProp("twitter.feed.profile.name", properties)).concat("\"").concat(",");
    json = json.concat("\"report-a-fire-phone\":\"").concat(getEnvProp("report.a.fire.phone", properties)).concat("\"").concat(",");
    json = json.concat("\"report-a-fire-cell\":\"").concat(getEnvProp("report.a.fire.cell", properties)).concat("\"").concat(",");
    json = json.concat("\"arc-gis-base-url\":\"").concat(getEnvProp("arc.gis.base.url", properties)).concat("\"").concat(",");
    json = json.concat("\"feedback-email\":\"").concat(getEnvProp("feedback.email", properties)).concat("\"").concat(",");
    json = json.concat("\"fire-info-phone\":\"").concat(getEnvProp("fire.info.phone", properties)).concat("\"").concat(",");
    json = json.concat("\"burn-registration-phone\":\"").concat(getEnvProp("burn.registration.phone", properties)).concat("\"").concat(",");
    json = json.concat("\"twitter-profile-url\":\"").concat(getEnvProp("twitter.profile.url", properties)).concat("\"").concat(",");
    json = json.concat("\"fb-profile-url\":\"").concat(getEnvProp("fb.profile.url", properties)).concat("\"").concat(",");
    json = json.concat("\"data-catalogue-url\":\"").concat(getEnvProp("data.catalogue.url", properties)).concat("\"").concat(",");
    json = json.concat("\"fire-danger-rating-url\":\"").concat(getEnvProp("fire.danger.rating.url", properties)).concat("\"").concat(",");
    json = json.concat("\"fire-weather-url\":\"").concat(getEnvProp("fire.weather.url", properties)).concat("\"").concat(",");
    json = json.concat("\"fire-tracking-url\":\"").concat(getEnvProp("fire.tracking.url", properties)).concat("\"").concat(",");
	json = json.concat("\"notifications-api-url\":\"").concat(getEnvProp("notification.api.url", properties)).concat("\"").concat(",");
	json = json.concat("\"prohibitions-restriction-advisories\":\"").concat(getEnvProp("prohibitions.restriction.advisories", properties)).concat("\"").concat(",");
    json = json.concat("\"hazard-assessment-url\":\"").concat(getEnvProp("hazard.assessment.url", properties)).concat("\"").concat(",");
    json = json.concat("\"prescribed-burning-url\":\"").concat(getEnvProp("prescribed.burning.url", properties)).concat("\"").concat(",");
    json = json.concat("\"dataset-drivebc-url\":\"").concat(getEnvProp("dataset.drivebc.url", properties)).concat("\"").concat(",");
    json = json.concat("\"dataset-firelocations-url\":\"").concat(getEnvProp("dataset.firelocations.url", properties)).concat("\"").concat(",");
    json = json.concat("\"dataset-fireperimeter-url\":\"").concat(getEnvProp("dataset.fireperimeter.url", properties)).concat("\"").concat(",");
    json = json.concat("\"dataset-firecentres-url\":\"").concat(getEnvProp("dataset.firecentres.url", properties)).concat("\"").concat(",");
    json = json.concat("\"dataset-dangerrating-url\":\"").concat(getEnvProp("dataset.dangerrating.url", properties)).concat("\"").concat(",");
    json = json.concat("\"dataset-arearestrictions-url\":\"").concat(getEnvProp("dataset.arearestrictions.url", properties)).concat("\"").concat(",");
    json = json.concat("\"dataset-protectedlandrestrictions-url\":\"").concat(getEnvProp("dataset.protectedlandrestrictions.url", properties)).concat("\"").concat(",");
    json = json.concat("\"dataset-recsites-url\":\"").concat(getEnvProp("dataset.recsites.url", properties)).concat("\"").concat(",");
    json = json.concat("\"dataset-evacorders-url\":\"").concat(getEnvProp("dataset.evacorders.url", properties)).concat("\"").concat(",");
    json = json.concat("\"openmaps-base-url\":\"").concat(getEnvProp("openmaps.base.url", properties)).concat("\"").concat(",");
  	json = json.concat("\"drivebc-base-url\":\"").concat(getEnvProp("drivebc.base.url", properties)).concat("\"").concat(",");
  	json = json.concat("\"announcements-url\":\"").concat(getEnvProp("announcements.url", properties)).concat("\"").concat(",");

    json = json.concat("\"dataset-current-conditions-url\":\"").concat(getEnvProp("dataset.currentconditions.url", properties)).concat("\"").concat(",");
    json = json.concat("\"dataset-radarurpprecipr14-url\":\"").concat(getEnvProp("dataset.radarurpprecipr14.url", properties)).concat("\"").concat(",");
    json = json.concat("\"dataset-firesmoke-url\":\"").concat(getEnvProp("dataset.firesmoke.url", properties)).concat("\",");

    json = json.concat("\"fire-report-api\":\"").concat(getEnvProp("fire.report.url", properties)).concat("\",");
    json = json.concat("\"api-key\":\"").concat(getEnvProp("api.key", properties)).concat("\",");
    json = json.concat("\"wfnews-ui-url\":\"").concat(getEnvProp("wfnews.ui.url", properties)).concat("\",");
    json = json.concat("\"wfnews-api-url\":\"").concat(getEnvProp("wfnews.api.url", properties)).concat("\",");
    json = json.concat("\"wfnews-api-key\":\"").concat(getEnvProp("wfnews.api.key", properties)).concat("\"");


    json = json.concat("}");

    json = json.concat("}");
    out.write(json);
  } else {
      out.write("{}");
  }
%>
<%!

  public String getEnvProp(String p, Properties props){
	  String prop = "";

	  prop = props.getProperty(p, "");
	  //override from env
	  if(System.getenv(p)!=null){
		  prop = System.getenv(p);
	  }
	  return prop;
  }
%>
