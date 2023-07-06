package ca.bc.gov.mof.wfpointid.async;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import ca.bc.gov.mof.wfpointid.Messages;
import ca.bc.gov.mof.wfpointid.PointIdServiceParams;
import ca.bc.gov.mof.wfpointid.ServiceBusyException;
import ca.bc.gov.mof.wfpointid.ServiceErrorException;
import ca.bc.gov.mof.wfpointid.nearby.NearbyService;
import ca.bc.gov.mof.wfpointid.rest.endpoint.NotFoundException;
import ca.bc.gov.mof.wfpointid.rest.model.NearbyResource;

@Component
public class ScheduledTasks {

	private static Logger LOG = LoggerFactory.getLogger(ScheduledTasks.class);
	
	@Autowired
	private NearbyDataResultsCache nearbyDataResultsCache;
	
	@Autowired
	PointIdServiceParams param;
	
	@Autowired
	NearbyService service;

	@Scheduled(fixedRateString = "${async.job.interval}")
	public void fetchFeatures() throws ServiceErrorException {
		LOG.info("<fetchFeatures");
		
		try {
			LOG.debug("service="+service);
			
			Map<String, Object> featureMap = new HashMap<String, Object>();
			
			NearbyResource nearByRsrc = service.fetchNearbyDataResults(param.getAsyncJobRefLon(), param.getAsyncJobRefLat(), param.getAsyncJobRefRadius(), false);
			
			for(Map<String, Object> feature: nearByRsrc.getFeatures()) {
				for(Map.Entry<String, Object> entry : feature.entrySet()) {
					
					Object value = entry.getValue();
					
					if(value instanceof List) {
						
						featureMap.put(entry.getKey(), value);
					} else {
						
						LOG.warn("Expecting a List:");
						LOG.warn("value="+value);
					}
				}
			}
			
			nearbyDataResultsCache.updateNearbyDataResults(featureMap, true);

		} catch(NotFoundException | ServiceBusyException e) {
			throw new ServiceErrorException(Messages.ERROR_INTERNAL, e);
		}

		LOG.info(">fetchFeatures");
	}
}
