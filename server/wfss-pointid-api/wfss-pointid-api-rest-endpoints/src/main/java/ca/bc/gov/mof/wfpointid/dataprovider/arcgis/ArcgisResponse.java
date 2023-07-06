package ca.bc.gov.mof.wfpointid.dataprovider.arcgis;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import ca.bc.gov.mof.wfpointid.dataprovider.DataItemDef;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequestDef;

public class ArcgisResponse {
	
	private static Logger LOG = LoggerFactory.getLogger(ArcgisResponse.class);
	
	String json;
	Map<String, Object> map;
	
	@SuppressWarnings("unchecked")
	public ArcgisResponse(String json) throws JsonParseException, JsonMappingException, IOException {
		this.json = json;
		map = new ObjectMapper().readValue(json, Map.class);
	}

	public boolean hasGMLFeatures() {
		 return map.containsKey("features");
	}
	
	
	@SuppressWarnings("unchecked")
	public Object[] extractGMLValues(DataRequestDef dataQueryDef ) {
		
		DataItemDef[] itemDef = dataQueryDef.getItems();

		Object[] vals = new Object[itemDef.length];
		
		List<Object> resultsList = new ArrayList<>();
		
		ArrayList<Object> featuresList = (ArrayList<Object>) map.get("features");
		
		String key = null;
		
		for (int i=0; i<featuresList.size(); i++) {
			
			Map<String, Object> featureMap = (Map<String, Object>) featuresList.get(i);
			
			Map<String, Object> valuesMap = (Map<String, Object>) featureMap.get("attributes");
			
			vals = new Object[itemDef.length];
			
			for (int j = 0; j < itemDef.length; j++) {

					key = itemDef[j].getAttributeName();
				
					Object o = valuesMap.get( key  );
					if (o != null)
						vals[j] = o;
			}
			
			resultsList.add(vals);
			
			Map<String, Object> geometry = (Map<String, Object>) featureMap.get("geometry");
			if (geometry!=null) {
				
				Object rings =  geometry.get("rings");
				if (rings!=null) {
					Map<String, Object> ringsMap = new HashMap<String, Object>();
					ringsMap.put("rings", rings);
					resultsList.add(rings);
				} else {
					
					LOG.debug("rings = NULL for "+dataQueryDef.getDatasetName());
				}
			}	
		}
		
		if (resultsList.size()>1) {
			
			return resultsList.toArray();
		}
		
		return vals;
	}
	
	public boolean isException() {
		return map.containsKey("error");
				
	}
	
	public List<Map<String, String>> fillMappedValues(DataRequestDef dataQueryDef){
		
		List<Map<String, String>> result = new ArrayList<Map<String, String>>();
		
		DataItemDef[] itemDef = dataQueryDef.getItems();
		
		ArrayList<?> features = (ArrayList<?>) map.get("features");
		
		Map<String, String> listOfAttr = null;
		
		for (int i=0; i<features.size(); i++) {
			
			@SuppressWarnings("unchecked")
			Map<String, Object> attributesMap = (Map<String, Object>) features.get(i);
			
			@SuppressWarnings("unchecked")
			Map<String, Object> valuesMap = (Map<String, Object>) attributesMap.get("attributes");
			
			if(attributesMap.get("geometry") != null) {
				
				@SuppressWarnings("unchecked")
				Map<? extends String, ? extends Object> geometryMap = (Map<? extends String, ? extends Object>) attributesMap.get("geometry");
				
				valuesMap.putAll(geometryMap); 
			}
			
			listOfAttr = new HashMap<String, String>();
			for (int j = 0; j < itemDef.length; j++) {

				String key = itemDef[j].getAttributeName();
				
				String value = valuesMap.get(key) == null?"":valuesMap.get(key).toString();
								
				listOfAttr.put(key.toLowerCase(), value);
					
			}
			result.add(listOfAttr);
		}
		
		return result;
	}
	
	@SuppressWarnings("unchecked")
	public String exceptionMsg() {
		
		Map<String, Object> errorsMap=(Map<String, Object>) map.get("error");
		StringBuilder  sb = new StringBuilder();
		sb.append("Error Code "); 
		sb.append(errorsMap.get("code"));
		sb.append(". ");
		sb.append(errorsMap.get("message"));
		Object o = errorsMap.get("details");
		if (o instanceof ArrayList) {
			sb.append(" Details:");
			ArrayList<String> details = (ArrayList<String>) o; 
			for (int i=0; i<details.size(); i++) {
				sb.append(details.get(i));
				if ( i!=(details.size()-1) ) 
					sb.append(", ");
			}
		}
		return sb.toString();
	}
	
}
