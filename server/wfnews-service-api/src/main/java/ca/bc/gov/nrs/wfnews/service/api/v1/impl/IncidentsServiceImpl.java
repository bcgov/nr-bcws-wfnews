package ca.bc.gov.nrs.wfnews.service.api.v1.impl;

import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.JsonNode;
import com.mashape.unirest.http.Unirest;

import ca.bc.gov.nrs.wfnews.service.api.v1.IncidentsService;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.IncidentResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.IncidentListResource;

import java.util.ArrayList;
import java.util.List;

import org.json.JSONObject;
import org.json.JSONArray;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;

public class IncidentsServiceImpl implements IncidentsService{

    private static final Logger logger = LoggerFactory.getLogger(IncidentsServiceImpl.class);
    
    public void setAgolQueryUrl(String agolQueryUrl) {
    	this.agolQueryUrl = agolQueryUrl;
    }
      
    @Value("${wfnews-agol-query.url}")
    private String agolQueryUrl;
    
    private String concatenatedQueryString = "&f=pjson&outFields=*&inSR=4326";

    @Override
    public IncidentListResource getIncidents(String status, String date, Double minLatitude, Double maxLatitude, Double minLongitude, Double maxLongitude){
    	IncidentListResource result = new IncidentListResource();
    	
    	String queryUrl = agolQueryUrl;
    	
    	if (status != null && status !="") {
    		queryUrl = queryUrl + "+AND+FIRE_STATUS+%3D+'"+ status.replace(" ", "+") + "'";
    	}
    	
    	if (date != null && date!= "") {
    		queryUrl = queryUrl + "+AND+IGNITION_DATE+%3E%3D+'"+ date +"+00%3A00%3A00'+AND+IGNITION_DATE+%3C%3D+'"+ date +"+23%3A59%3A59'";
    	}
    	
    	if (minLatitude != null && maxLatitude != null && minLongitude != null && maxLongitude != null) {
    		queryUrl = queryUrl + "&geometryType=esriGeometryEnvelope&geometry="+ minLongitude + "%2C+" + minLatitude + "%2C+"+ maxLongitude + "%2C+" + maxLatitude;
    	}
    	
    	queryUrl = queryUrl + concatenatedQueryString;
    	
        try{
        	
            HttpResponse<JsonNode> response = Unirest
            .post(queryUrl)
            .header("Content-Type", "application/json")
            .header("Accept", "*/*")
            .asJson(); 
            
            if (response != null) {
            	result = getIncidentResourceListFromJsonBody(response.getBody());
            }

            }catch(Exception e){
                logger.error("Failed to retrive JSON from AGOL service for all incidents", e);
            } 
            
        return result;

    }
    
    @Override
    public IncidentResource getIncidentByID(String id) {
    	IncidentResource result = new IncidentResource();
    	IncidentListResource incidentListResource = null;
    	String queryUrl = agolQueryUrl + "+AND+FIRE_ID+%3D" + id + concatenatedQueryString;
    	 try{
         	
             HttpResponse<JsonNode> response = Unirest
             .post(queryUrl)
             .header("Content-Type", "application/json")
             .header("Accept", "*/*")
             .asJson(); 
             
             if (response != null) {
            	 incidentListResource = getIncidentResourceListFromJsonBody(response.getBody());
             }
             
          
             }catch(Exception e){
                 logger.error("Failed to retrive JSON from AGOL service for all incidents", e);
             } 
    	 
    	 if (incidentListResource!= null && incidentListResource.getCollection() != null && !incidentListResource.getCollection().isEmpty()) {
    		 result = incidentListResource.getCollection().get(0);
    	 } 
    	
    	return result;
    }
    
    public IncidentListResource getIncidentResourceListFromJsonBody(JsonNode jsonNode) {
    	IncidentListResource result = new IncidentListResource();
    	List<IncidentResource> incidentResourceList = new ArrayList<IncidentResource>();
    	
    	 JSONObject incidentJson = new JSONObject(jsonNode);
         JSONArray arrayJson = incidentJson.getJSONArray("array");  
         JSONObject obj = arrayJson.optJSONObject(0);
         JSONArray featuresArr = obj.optJSONArray("features");
         
         if (featuresArr != null) {
        	 for (int i = 0; i < featuresArr.length(); i++) {
            	 IncidentResource incidentResource = new IncidentResource();
            	 
            	 JSONObject obj1 = featuresArr.optJSONObject(i);
                 JSONObject attributesObj = obj1.optJSONObject("attributes");
                 
                 if(attributesObj.has("FIRE_NUMBER") && !attributesObj.optString("FIRE_NUMBER", "").equals("")) incidentResource.setFireNumber(attributesObj.optString("FIRE_NUMBER"));
                 if(attributesObj.has("FIRE_YEAR") && (attributesObj.optInt("FIRE_YEAR") != (0))) incidentResource.setFireYear(attributesObj.optInt("FIRE_YEAR"));
                 if(attributesObj.has("IGNITION_DATE") && (attributesObj.optLong("IGNITION_DATE") != (0))) incidentResource.setIgnitionDate(attributesObj.optLong("IGNITION_DATE"));
                 if(attributesObj.has("FIRE_STATUS") && !attributesObj.optString("FIRE_STATUS", "").equals("")) incidentResource.setFireStatus(attributesObj.optString("FIRE_STATUS"));
                 if(attributesObj.has("FIRE_CAUSE") && !attributesObj.optString("FIRE_CAUSE", "").equals("")) incidentResource.setFireCause(attributesObj.optString("FIRE_CAUSE"));
                 if(attributesObj.has("FIRE_CENTRE") && (attributesObj.optInt("FIRE_CENTRE") != (0))) incidentResource.setFireCentre(attributesObj.optInt("FIRE_CENTRE"));
                 if(attributesObj.has("FIRE_ID") && (attributesObj.optInt("FIRE_ID") != (0))) incidentResource.setFireID(attributesObj.optInt("FIRE_ID"));
                 if(attributesObj.has("FIRE_TYPE") && !attributesObj.optString("FIRE_TYPE", "").equals("")) incidentResource.setFireType(attributesObj.optString("FIRE_TYPE"));
                 if(attributesObj.has("GEOGRAPHIC_DESCRIPTION") && !attributesObj.optString("GEOGRAPHIC_DESCRIPTION", "").equals("")) incidentResource.setGeographicDescription(attributesObj.optString("GEOGRAPHIC_DESCRIPTION"));
                 if(attributesObj.has("ZONE") && (attributesObj.optInt("ZONE") != (0))) incidentResource.setZone(attributesObj.optInt("ZONE"));
                 if(attributesObj.has("LATITUDE") && (attributesObj.optDouble("LATITUDE") != (0))) incidentResource.setLatitude(attributesObj.optDouble("LATITUDE"));
                 if(attributesObj.has("LONGITUDE") && (attributesObj.optDouble("LONGITUDE") != (0))) incidentResource.setLongitude(attributesObj.optDouble("LONGITUDE"));      
                 if(attributesObj.has("CURRENT_SIZE") && (attributesObj.optInt("CURRENT_SIZE") != (0))) incidentResource.setCurrentSize(attributesObj.optInt("CURRENT_SIZE"));
                 if(attributesObj.has("FIRE_OF_NOTE_URL") && !attributesObj.optString("FIRE_OF_NOTE_URL", "").equals("")) incidentResource.setFireOfNoteURL(attributesObj.optString("FIRE_OF_NOTE_URL"));
                 if(attributesObj.has("FIRE_OF_NOTE_ID") && !attributesObj.optString("FIRE_OF_NOTE_ID", "").equals("")) incidentResource.setFireOfNoteID(attributesObj.optString("FIRE_OF_NOTE_ID"));
                 if(attributesObj.has("FIRE_OF_NOTE_NAME") && !attributesObj.optString("FIRE_OF_NOTE_NAME", "").equals("")) incidentResource.setFireOfNoteName(attributesObj.optString("FIRE_OF_NOTE_NAME"));
                 if(attributesObj.has("FEATURE_CODE") && !attributesObj.optString("FEATURE_CODE", "").equals("")) incidentResource.setFeatureCode(attributesObj.optString("FEATURE_CODE"));
                 if(attributesObj.has("OBJECT_ID") && (attributesObj.optInt("OBJECT_ID") != (0))) incidentResource.setObjectID(attributesObj.optInt("OBJECT_ID"));
                 if(attributesObj.has("GLOBAL_ID") && !attributesObj.optString("GLOBAL_ID", "").equals("")) incidentResource.setGlobalID(attributesObj.optString("GLOBAL_ID"));
                 
                 incidentResourceList.add(incidentResource);
             }
        	 
         }
         
         result.setCollection(incidentResourceList);
         
         return result;
    }
     
}
