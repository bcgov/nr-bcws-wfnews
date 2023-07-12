package ca.bc.gov.mof.wfpointid.dataprovider.wfnews;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.locationtech.jts.geom.Point;

import ca.bc.gov.mof.wfpointid.dataprovider.DataItemDef;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequest;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequestCall;
import ca.bc.gov.mof.wfpointid.dataprovider.DataResult;
import ca.bc.gov.mof.wfpointid.rest.client.GeometryConverters;
import ca.bc.gov.mof.wfpointid.rest.client.v1.WildfireNewsServiceException;
import ca.bc.gov.mof.wfpointid.wfnews.rest.v1.resource.SimplePublishedIncidentResource;

public class WildfireNewsDataRequestCall implements DataRequestCall {

	private static Logger LOG = LoggerFactory.getLogger(WildfireNewsDataRequestCall.class);

	private WildfireNewsDataProvider provider;

	WildfireNewsDataRequestCall(WildfireNewsDataProvider dataProvider) {
		this.provider = dataProvider;
	}

	static final Map<String, Function<SimplePublishedIncidentResource, ?>> ACCESSORS = new HashMap<>(); 
	
	// https://github.com/bcgov/nr-bcws-wfnews/blob/main/client/wfnews-war/src/main/angular/src/app/components/public-incident-page/incident-info-panel/incident-info-panel.component.ts#L68
	static String getCauseLabel(int category) {
		switch (category) {
		case 1: return "Human";
		case 2: return "Lightning / Natural";
		case 3: return "Under Investigation";
		default: return "Unknown";
		}
	}
	// https://github.com/bcgov/nr-bcws-wfnews/blob/main/client/wfnews-war/src/main/angular/src/app/components/public-incident-page/incident-info-panel/incident-info-panel.component.ts#L52
	static String getStageOfControlLabel(String code) {
		switch (code) {
		case "OUT": return "Out";
		case "OUT_CNTRL": return "Out of Control";
		case "HOLDING": return "Being Held";
		case "UNDR_CNTRL": return "Under Control";
		default: return "Unknown";
		}
	}
	static {
		
		ACCESSORS.put("incidentGuid", SimplePublishedIncidentResource::getIncidentGuid);
		ACCESSORS.put("incidentNumberLabel", SimplePublishedIncidentResource::getIncidentNumberLabel);
		ACCESSORS.put("incidentSizeEstimatedHa", SimplePublishedIncidentResource::getIncidentSizeEstimatedHa);
		ACCESSORS.put("stageOfControlCode", SimplePublishedIncidentResource::getStageOfControlCode);
		ACCESSORS.put("stageOfControlLabel", incident->getStageOfControlLabel(incident.getStageOfControlCode()));
		ACCESSORS.put("incidentCauseDetail", SimplePublishedIncidentResource::getIncidentCauseDetail);
		ACCESSORS.put("fireOfNoteInd", SimplePublishedIncidentResource::getFireOfNoteInd);
		ACCESSORS.put("generalIncidentCauseCatId", SimplePublishedIncidentResource::getGeneralIncidentCauseCatId);
		ACCESSORS.put("incidentCauseLabel", incident->getCauseLabel(incident.getGeneralIncidentCauseCatId()));
		ACCESSORS.put("incidentName", SimplePublishedIncidentResource::getIncidentName);
		ACCESSORS.put("discoveryDate", incident->incident.getDiscoveryDate().toInstant().toEpochMilli());
		ACCESSORS.put("latitude", SimplePublishedIncidentResource::getLatitude);
		ACCESSORS.put("longitude", SimplePublishedIncidentResource::getLongitude);
		
		ACCESSORS.put("dummy", (incident)->"");
	}

	@Override
	public DataResult perform(DataRequest req) throws Exception {
		Point p = GeometryConverters.latLon(req.getQueryPt().getLat(), req.getQueryPt().getLon());
		double radius = req.getRadius()*1000; // Given in km, need m.
		
		try {
			final List<SimplePublishedIncidentResource> incidents = provider.getService().getNearbyPublishedIncidents(p, radius);
			final DataResult result = DataResult.createValue(req.getDataRequestDef(), incidents.toArray());
			
			final List<Map<String, String>> mapped = incidents.stream()
				.map(incident->
					Arrays.asList(req.getDataRequestDef().getItems()).stream()
						.collect(Collectors.toMap(
							DataItemDef::getName,  
								def->{
									Function<SimplePublishedIncidentResource, ?> accessor = Optional.ofNullable(ACCESSORS.get(def.getAttributeName()))
										.orElseThrow(()->new IllegalArgumentException(String.format("Invalid attribute %s",def.getAttributeName())));
									Object value = accessor.apply(incident);
									if(value==null) value = "";
									return value.toString();
								})
							)
					)
				.collect(Collectors.toList());
			
			result.setMappedValues(mapped);
			return result;
			
		} catch (WildfireNewsServiceException ex) {
			LOG.warn(String.format("Error while getting station near %s", p.toText()), ex);
			return DataResult.createError(req.getDataRequestDef(), String.format("Error while getting station: %s", ex.getMessage()));
		}

	}

}
