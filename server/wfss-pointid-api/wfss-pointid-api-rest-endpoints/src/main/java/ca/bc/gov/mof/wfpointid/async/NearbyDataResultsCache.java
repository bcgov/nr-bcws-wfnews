package ca.bc.gov.mof.wfpointid.async;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class NearbyDataResultsCache {
	
	private static Logger LOG = LoggerFactory.getLogger(NearbyDataResultsCache.class);
		
	Map<String, Object> nearbyDataResults = new HashMap<String, Object>();
	
	public Map<String, Object> getNearbyDataResults(){
		
		return Collections.unmodifiableMap(nearbyDataResults);
	}

	public synchronized void updateNearbyDataResults(Map<String, Object> featureListMap, boolean replace) {
		LOG.warn("<updateNearbyDataResults");
		Map<String, Object> newCache = new HashMap<String, Object>();
		
		if(replace) {
		
			newCache.putAll(featureListMap);
		} else {
		
			newCache.putAll(nearbyDataResults);
			
			for(String key:featureListMap.keySet()) {
				
				Map<String, Object> objectIdMap = new HashMap<>();
				
				if(nearbyDataResults.containsKey(key)) {
					
					@SuppressWarnings("unchecked")
					List<Map<String, String>> featureList = (List<Map<String, String>>) nearbyDataResults.get(key);
					
					for(Map<String, String> feature:featureList) {
						
						String objectId = feature.get("objectid");
						
						objectIdMap.put(objectId, feature);
					}
				}
				
				@SuppressWarnings("unchecked")
				List<Map<String, String>> featureList = (List<Map<String, String>>) featureListMap.get(key);
				
				for(Map<String, String> feature:featureList) {
						
					String objectId = feature.get("objectid");
					
					objectIdMap.put(objectId, feature);
				}
					
				List<Object>  values = new ArrayList<>(objectIdMap.values());
				newCache.put(key, values);
			}
		}
		
		nearbyDataResults = newCache;
		
		LOG.info("Requesting Garbage Collection");
		System.gc();

		LOG.warn(">updateNearbyDataResults");
	}
}
