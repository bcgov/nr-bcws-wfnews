package ca.bc.gov.nrs.wfnews.service.api.v1.validation;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.commons.lang3.StringUtils;
import org.codehaus.jackson.map.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;

import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.JsonNode;
import com.mashape.unirest.http.Unirest;
import com.mashape.unirest.http.utils.Base64Coder;
import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.Geometry;

import ca.bc.gov.nrs.common.model.Code;
import ca.bc.gov.nrs.common.rest.resource.CodeTableListResource;
import ca.bc.gov.nrs.common.rest.resource.CodeTableResource;
import ca.bc.gov.nrs.wfone.common.service.api.validation.BaseValidator;
import ca.bc.gov.nrs.wfone.common.utils.MessageBuilder;
import ca.bc.gov.nrs.wfone.common.model.Message;


import ca.bc.gov.nrs.wfnews.api.model.v1.ExternalUri;
import ca.bc.gov.nrs.wfnews.api.model.v1.PublishedIncident;
import ca.bc.gov.nrs.wfnews.service.api.v1.validation.constraints.ExternalUriConstraints;
import ca.bc.gov.nrs.wfnews.service.api.v1.validation.constraints.PublishedIncidentConstraints;
import ca.bc.gov.nrs.common.persistence.dao.DaoException;

public class ModelValidator extends BaseValidator {
	
	private static final Logger logger = LoggerFactory.getLogger(ModelValidator.class);
	
	@Value("${webade-oauth2.wfim.client.id}")
	private String webadeOauth2ClientId;

	@Value("${WEBADE_OAUTH2_WFNEWS_REST_CLIENT_SECRET}")
	private String webadeOauth2ClientSecret;
	
	@Value("${WEBADE-OAUTH2_TOKEN_CLIENT_URL}")
	private String webadeOauth2ClientUrl;
	
	@Value("${WEBADE-OAUTH2_CHECK_TOKEN_URL}")
	private String wfimClientUrl;
	
	@Value("${WFIM_CODE_TABLES_URL}")
	private String wfimCodeTablesUrl;
	
	private CodeTableListResource codeTables;
	
	/**
	   * Helper method for loading and initializing code tables from WFIM
	   */
	  private void loadCodeTables() {
	    try {
	      HttpResponse<JsonNode> tokenResponse = Unirest
	              .get(webadeOauth2ClientUrl)
	              .header("Authorization", "Basic " + Base64Coder.encodeString(webadeOauth2ClientId + ":" + webadeOauth2ClientSecret))
	              .header("Content-Type", "application/json")
	              .asJson();
	      JsonNode tokenBody = tokenResponse.getBody();
	      String token = tokenBody.getObject().getString("access_token");
	      
	      HttpResponse<String> codeResponse = Unirest
	              .get(wfimCodeTablesUrl)
	              .header("Authorization", "Bearer " + token)
	              .header("Content-Type", "application/json")
	              .asString();

	      ObjectMapper mapper = new ObjectMapper();
	      codeTables = mapper.readValue(codeResponse.getBody(), CodeTableListResource.class);
	    } catch (Exception e) {
	      logger.error("Failed to load code tables for WFIM", e);
	    }
	  }

	private static final int TOPIC_MAX_LENGHT = 64;
	
	private static  String[] validTopicsArray =  { "British_Columbia_Area_Restrictions",  "British_Columbia_Bans_and_Prohibition_Areas", "BCWS_ActiveFires_PublicView",  "Evacuation_Orders_and_Alerts"};
	private static Set<String> validTopics = new HashSet<String>(Arrays.asList( validTopicsArray ));	
	public List<Message> validatePoint(Geometry point) {
		logger.debug("<validatePoint");
		
		List<Message> results = new ArrayList<>();

		if (point.getCoordinate().getOrdinate(Coordinate.X)<-180.0 || point.getCoordinate().getOrdinate(Coordinate.X)>0.0) {
			
			MessageBuilder builder = new MessageBuilder("Point", Errors.NOTIFICATION_LONGITUDE_SIZE, Errors.NOTIFICATION_LONGITUDE_SIZE);

			builder.addArg("longitude", Double.toString( point.getCoordinate().getOrdinate(Coordinate.X) ));
			
			results.add(builder.getMessage());
		}
		
		if (point.getCoordinate().getOrdinate(Coordinate.Y)<0.0 || point.getCoordinate().getOrdinate(Coordinate.Y)>90.0) {
			
			MessageBuilder builder = new MessageBuilder("Point", Errors.NOTIFICATION_LATITUDE_SIZE, Errors.NOTIFICATION_LATITUDE_SIZE);

			builder.addArg("latitude", Double.toString( point.getCoordinate().getOrdinate(Coordinate.Y) ) );
			
			results.add(builder.getMessage());
		}
		
		
		logger.debug(">validatePoint " + results.size());
		return results;
		
	}

	protected static List<Message> addParentPath(List<Message> messages, String parentPath) {
		
		for(Message message:messages) {
			
			addParentPath(message, parentPath);
		}
		
		return messages;
	}
	
	public static Message addParentPath(Message message, String parentPath) {
		
		String path = message.getPath();
		path = (path == null) ? "" : path;
		path = parentPath + "." + path;
		message.setPath(path);
		
		return message;
	}

	private boolean checkValuePresentOnCodeTable(String value, String codeTableName) throws Exception {
		loadCodeTables();	
		boolean present = false;
		List<CodeTableResource> codeTableList = codeTables.getCodeTableList();
	    List<String> codeTableNames = new ArrayList<String>();
	    CodeTableResource relevantTable = new CodeTableResource();
	    for (CodeTableResource codeTable : codeTableList) {
	    	codeTableNames.add(codeTable.getCodeTableName());
	    }
		if(!codeTableNames.contains(codeTableName)) {
			throw new Exception("Exception finding Report of Fire code table: " +  codeTableName);
		}else {
			for (CodeTableResource codeTable : codeTableList) {
				if (codeTable.getCodeTableName().equalsIgnoreCase(codeTableName)) {
					relevantTable = codeTable;
					break;
				}
			}
		}
		
		if (relevantTable.getCodes() != null) {
			for (Code code : relevantTable.getCodes()) {
				if (code.getCode().equalsIgnoreCase(value)) {
					present = true;
					break;
				}		
			}
		}
				
		return present;
	}
	
	public List<Message> validatePublishedIncident(PublishedIncident publishedIncident, long effectiveAsOfMillis) throws DaoException {
		logger.debug("<validatePublishedIncident");
		Class<?>[] groups = new Class<?>[] { PublishedIncidentConstraints.class};

		List<Message> results = this.validate(publishedIncident, groups);
		
		logger.debug(">validatePublishedIncident " + results.size());
		return results;
	}
	

	public List<Message> validateExternalUri(ExternalUri externalUri, long effectiveAsOfMillis) throws DaoException {
		logger.debug("<validateExternalUri");
		Class<?>[] groups = new Class<?>[] { ExternalUriConstraints.class};

		List<Message> results = this.validate(externalUri, groups);
		
		logger.debug(">validateExternalUri " + results.size());
		return results;
	}
}
