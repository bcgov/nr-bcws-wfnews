package ca.bc.gov.nrs.wfnews.service.api.v1.impl;

import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.JsonNode;
import com.mashape.unirest.http.Unirest;

import ca.bc.gov.nrs.wfnews.service.api.v1.IncidentsService;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.IncidentResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.IncidentListResource;

import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.text.ParseException;
import java.text.SimpleDateFormat;

import org.json.JSONObject;
import org.json.JSONArray;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;

public class IncidentsServiceImpl implements IncidentsService{

    private static final Logger logger = LoggerFactory.getLogger(IncidentsServiceImpl.class);
      
    @Value("${wfnews-agol-query.url}")
    private String agolQueryUrl;

    @Override
    public IncidentListResource getIncidents(String status, String date, Double minLatitude, Double maxLatitude, Double minLongitude, Double maxLongitude){
    	IncidentListResource result = new IncidentListResource();
    	
        try{
        	
            HttpResponse<JsonNode> response = Unirest
            .post(agolQueryUrl)
            .header("Content-Type", "application/json")
            .header("Accept", "*/*")
            .asJson(); 
            
            if (response != null) {
            	result = getIncidentResourceListFromJsonBody(response.getBody());
            }
            
         
            }catch(Exception e){
                logger.error("Failed to retrive JSON from AGOL service for all incidents", e);
            } 
        
        if (result != null && status != null && status != "") {
        	try {
        		filterIncidentsByFireStatus(result, status);
        	}catch(Exception e) {
        		logger.error("Exception while comparing fire status for AGOL query: " + e);
        	}
        	
        	
        }
        
        if (result != null && date !=null && date != "") {
        	try {
        		filterIncidentsByIgnitionDate(result, date);
        	}catch(Exception e) {
        		logger.error("Exception while comparing dates for AGOL query: " + e);
        	}
        	
        }
        
        if (result != null && minLatitude != null && maxLatitude != null && minLongitude != null && maxLongitude != null) {
        	try {
        		filterIncidentsByLocation(result, minLatitude, maxLatitude, minLongitude, maxLongitude);
        	}catch(Exception e) {
        		logger.error("Exception while comparing location coordinates dates for AGOL query: " + e);
        	}
        }
       
        return result;

    }
    
    @Override
    public IncidentResource getIncidentByID(String id) {
    	IncidentResource result = new IncidentResource();
    	IncidentListResource incidentListResource = new IncidentListResource();
    	 try{
         	
             HttpResponse<JsonNode> response = Unirest
             .post("https://services6.arcgis.com/ubm4tcTYICKBpist/ArcGIS/rest/services/BCWS_ActiveFires_PublicView/FeatureServer/0/query?where=FIRE_ID+%3D+"
            		 + id + "&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&relationParam=&returnGeodetic=false&outFields=*&returnGeometry=true&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=4326&defaultSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson&token=")
             .header("Content-Type", "application/json")
             .header("Accept", "*/*")
             .asJson(); 
             
             if (response != null) {
            	 incidentListResource = getIncidentResourceListFromJsonBody(response.getBody());
             }
             
          
             }catch(Exception e){
                 logger.error("Failed to retrive JSON from AGOL service for all incidents", e);
             } 
    	 
    	 List<IncidentResource> incidentList = incidentListResource.getCollection();
    	 if (incidentList.get(0) != null) {
    		 result = incidentList.get(0);
    	 } 
    	
    	return result;
    }
    
    private IncidentListResource getIncidentResourceListFromJsonBody(JsonNode jsonNode) {
    	IncidentListResource result = new IncidentListResource();
    	List<IncidentResource> incidentResourceList = new ArrayList<IncidentResource>();
    	
    	 JSONObject incidentJson = new JSONObject(jsonNode);
         JSONArray arrayJson = incidentJson.getJSONArray("array");  
         JSONObject obj = arrayJson.optJSONObject(0);
         JSONArray featuresArr = obj.optJSONArray("features");
         
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
         
         result.setCollection(incidentResourceList);
         
         return result;
    }
    
    private IncidentListResource filterIncidentsByFireStatus(IncidentListResource incidentListResource, String status) {
    	IncidentListResource filteredIncidentList = new IncidentListResource();
    	List<IncidentResource> incidents = incidentListResource.getCollection();		    	
    	Iterator<IncidentResource> iterator = incidents.iterator();   
    	
    	while(iterator.hasNext()){
    		IncidentResource incident = iterator.next();
    		if (!incident.getFireStatus().equalsIgnoreCase(status)) {
    				iterator.remove();
    		}
    	}
    	
    	filteredIncidentList.setCollection(incidents);
    	return filteredIncidentList;
    }
    
    private IncidentListResource filterIncidentsByIgnitionDate(IncidentListResource incidentListResource, String date) throws ParseException {
    	IncidentListResource filteredIncidentList = new IncidentListResource();
    	List<IncidentResource> incidents = incidentListResource.getCollection();
    	SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd");
    	Date convertedDate = simpleDateFormat.parse(date);
    	String convertedDateString = simpleDateFormat.format(convertedDate);
    	Iterator<IncidentResource> iterator = incidents.iterator(); 
    	
    	while(iterator.hasNext()){
    		IncidentResource incident = iterator.next();
    		if (incident.getIgnitionDate() != null) {
    			Date dateToCompare = new Date(incident.getIgnitionDate());
    			String dateToCompareString = simpleDateFormat.format(dateToCompare);
    			if (!dateToCompareString.equals(convertedDateString)) {
    				iterator.remove();
    			}
    		}
    	}
    		    	
    	filteredIncidentList.setCollection(incidents);
    	return filteredIncidentList;
    }
    
    private IncidentListResource filterIncidentsByLocation(IncidentListResource incidentListResource, Double minLatitude, Double maxLatitude, Double minLongitude, Double maxLongitude) {
    	IncidentListResource filteredIncidentList = new IncidentListResource();
    	List<IncidentResource> incidents = incidentListResource.getCollection();
    	Iterator<IncidentResource> iterator = incidents.iterator(); 
    	
    	while(iterator.hasNext()){
    		IncidentResource incident = iterator.next();
    		if (incident.getLatitude() == null || incident.getLongitude() == null || incident.getLatitude() < minLatitude || incident.getLatitude() > maxLatitude || incident.getLongitude() < minLongitude || incident.getLongitude() > maxLongitude) {
    			iterator.remove();
    		}
    		
    	}
    	filteredIncidentList.setCollection(incidents);
    	return filteredIncidentList;
    	
    }
    
    
}
