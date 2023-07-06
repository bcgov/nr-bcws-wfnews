package ca.bc.gov.mof.wfpointid.nearby;

import static ca.bc.gov.mof.wfpointid.dataprovider.DataItemDef.item;
import static ca.bc.gov.mof.wfpointid.dataprovider.DataRequestDef.request;

import java.io.StringReader;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;
import java.util.function.Supplier;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import javax.annotation.PostConstruct;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.google.common.annotations.VisibleForTesting;

import org.locationtech.jts.algorithm.Orientation;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.Envelope;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.LinearRing;
import org.locationtech.jts.geom.Polygon;
import org.locationtech.jts.io.ParseException;
import org.locationtech.jts.io.geojson.GeoJsonReader;
import org.locationtech.jts.operation.distance.DistanceOp;

import ca.bc.gov.mof.wfpointid.Messages;
import ca.bc.gov.mof.wfpointid.PointIdServiceParams;
import ca.bc.gov.mof.wfpointid.ServiceBusyException;
import ca.bc.gov.mof.wfpointid.ServiceErrorException;
import ca.bc.gov.mof.wfpointid.async.NearbyDataResultsCache;
import ca.bc.gov.mof.wfpointid.dataprovider.DataItemDef;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequestDef;
import ca.bc.gov.mof.wfpointid.dataprovider.DataResult;
import ca.bc.gov.mof.wfpointid.dataprovider.arcgis.ArcgisDataProvider;
import ca.bc.gov.mof.wfpointid.query.QueryPt;
import ca.bc.gov.mof.wfpointid.query.QueryResult;
import ca.bc.gov.mof.wfpointid.rest.model.NearbyResource;
import ca.bc.gov.mof.wfpointid.rest.model.QueryResource;
import ca.bc.gov.mof.wfpointid.util.DistanceCalculator;

@Component
public class NearbyQuery {
	
	private static Logger LOG = LoggerFactory.getLogger(NearbyQuery.class);
	
	public static final String GEOMETRY = "GEOMETRY";	
	
	@Autowired
	private NearbyService nearbyService;
	
	@Autowired
	private NearbyDataResultsCache nearbyDataResultsCache;
	
	@Autowired
	PointIdServiceParams param;
	
	static private void mapShorter(String name, Map<Pattern, Function<Matcher, String>> map) {
		mapReplace(name, name, map);
	}
	static private void mapReplace(String searchName, String newName, Map<Pattern, Function<Matcher, String>> map) {
		Pattern pat = Pattern.compile(Pattern.quote(searchName));
		map.put(pat, matcher->newName);
	}
	private static final Map<Pattern,Function<Matcher, String>> layersMapping;
	static {
		Map<Pattern, Function<Matcher, String>> map = new HashMap<>();
		
		mapShorter("British_Columbia_Area_Restrictions", map);
		mapShorter("British_Columbia_Bans_and_Prohibition_Areas", map);
		mapShorter("British_Columbia_Danger_Rating", map);
		mapShorter("BCWS_ActiveFires_PublicView", map);
		mapReplace("Emrg_Orders_and_Alerts","Evacuation_Orders_and_Alerts", map);
		mapShorter("Evacuation_Orders_and_Alerts", map);
		mapShorter("British_Columbia_Fire_Centre_Boundaries", map);
		mapShorter("British_Columbia_Fire_Service_Weather_Stations", map);
		
		layersMapping = Collections.unmodifiableMap(map);
	}
	
	
	public   String[] featureTypeListWithRings = null;
	
	private static final String[][] fieldsRemapping = { {"access_status_effective_date","dateactive"}, {"bulletin_url", "url" }, {"fire_centre_name", "firecentre" }, //  for Area Restrictions
								{"danger_rating", "value"}, {"danger_rating_desc", "label" },  // for Danger Rating
								{"access_status_effective_date","dateactive" } , {"fire_centre_name","firecentre" }, {"bulletin_url", "url" }, {"access_prohibition_description", "comments" },
								{"fire_zone_name", "mof_fire_zone_name"} }; // Bans and Prohibitions 
	
	public  DataRequestDef[] NEARBY = null;
	
	@PostConstruct
	public void initNearByQuery() {
		LOG.debug("<initNearByQuery");
		
		featureTypeListWithRings = new String[] { 	param.getWfArcGisLayer_Area_Restrictions(),				//	"British_Columbia_Area_Restrictions",
													param.getWfArcGisLayer_Bans_and_Prohibition_Areas(),	//  "British_Columbia_Bans_and_Prohibition_Areas",
													param.getWfArcGisLayer_Danger_Rating(),					//	"British_Columbia_Danger_Rating",
													param.getWfArcGisLayer_Evacuation_Orders_Alerts(),		//	"Evacuation_Orders_and_Alerts",
													param.getWfArcGisLayer_Fire_Centre_Boundaries()	 };		//	"British_Columbia_Fire_Centre_Boundaries"
		
		NEARBY = new DataRequestDef[] {	
				
				// Bans and Prohibitions
				request(NearbyService.PROVIDER_WF_ARCGIS, ArcgisDataProvider.TYPE_BANS,	param.getWfArcGisLayer_Bans_and_Prohibition_Areas() ,
						NearbyQuery.GEOMETRY, 100000,
						new DataItemDef[] { 
								item("OBJECTID",  "OBJECTID"),
								item("PROT_BAP_SYSID",  "PROT_BAP_SYSID"),
								item("rings",     "rings"),
								item("ACCESS_STATUS_EFFECTIVE_DATE", "ACCESS_STATUS_EFFECTIVE_DATE"),  // DateActive 
								item("DATEDEACTIVATED", "DATEDEACTIVATED"),
								item("TYPE", "TYPE"), 
								item("ACCESS_PROHIBITION_DESCRIPTION","ACCESS_PROHIBITION_DESCRIPTION"), // Comments old
								item("FIRE_CENTRE_NAME", "FIRE_CENTRE_NAME"), // Fire_Centre old 
								item("BULLETIN_URL", "BULLETIN_URL"),  // URL old
								item("Shape__Area", "Shape__Area"),
								item("Shape__Length", "Shape__Length"),
								item("ORG_UNIT_NAME", "ORG_UNIT_NAME"),
								item("FIRE_ZONE_NAME", "FIRE_ZONE_NAME") }),

				// Wildfires - WFNews Published Incidents - BCWS_ActiveFires_PublicView
				request(NearbyService.PROVIDER_WF_NEWS, param.getWfArcGisLayer_ActiveFires(),
						100000, new DataItemDef[]{ 
								item("incidentGuid", "objectid"),
								item("incidentSizeEstimatedHa", "current_size"), 
								item("incidentCauseLabel", "fire_cause"),
								item("incidentNumberLabel", "fire_number"),
								item("stageOfControlLabel", "fire_status"), 
								item("fireOfNoteInd", "fire_of_note_ind"),
								item("incidentName", "fire_of_note_name"),
								item("discoveryDate", "discovery_date"),
								item("latitude", "latitude"), 
								item("longitude", "longitude"),
								
								// Not available from WFNEWS, add dummy values for backward compatibility
								item("dummy", "fire_of_note_url"), 
								item("dummy", "ignition_date")
								}),

				// British_Columbia_Danger_Rating    
				request(NearbyService.PROVIDER_WF_ARCGIS, ArcgisDataProvider.TYPE_BCDANRAT, param.getWfArcGisLayer_Danger_Rating(),
						NearbyQuery.GEOMETRY, 100000,  
						new DataItemDef[] { item("OBJECTID", "OBJECTID"),
											item("rings",     "rings"),
											item("DANGER_RATING_DESC",  "DANGER_RATING_DESC"), // Label old
											item("DANGER_RATING","DANGER_RATING"), // Value old
											item("FGND","FGND"),
											item("BKND","BKND"),
											item("SFMS_DATE","SFMS_DATE"),
											item("SFMS_HOUR","SFMS_HOUR") } ),		
				
				// Evacuation_Orders_and_Alerts
				request(NearbyService.PROVIDER_WF_ARCGIS, ArcgisDataProvider.TYPE_EVACORDALRT, param.getWfArcGisLayer_Evacuation_Orders_Alerts(),
						NearbyQuery.GEOMETRY, 100000,  
						new DataItemDef[] { item("OBJECTID", "OBJECTID"),
											item("EMRG_OAA_SYSID",  "EMRG_OAA_SYSID"),
											item("rings",     "rings"),
											item("EVENT_NAME", "EVENT_NAME"), 
											item("EVENT_TYPE", "EVENT_TYPE"),
											item("ORDER_ALERT_STATUS", "ORDER_ALERT_STATUS"),
											item("ISSUING_AGENCY", "ISSUING_AGENCY"),
											item("DATE_MODIFIED", "DATE_MODIFIED"),
											item("POPULATION", "POPULATION"),
											item("NUMBER_OF_HOMES", "NUMBER_OF_HOMES") } ),
				
				// British_Columbia_Area_Restrictions
				request(NearbyService.PROVIDER_WF_ARCGIS, ArcgisDataProvider.TYPE_BCAREARESTRCT, param.getWfArcGisLayer_Area_Restrictions(),
						NearbyQuery.GEOMETRY, 100000,  
						new DataItemDef[] { item("OBJECTID", "OBJECTID"),
											item("rings",     "rings"),
											item("PROT_RA_SYSID",  "PROT_RA_SYSID"),
											item("NAME",  "NAME"), // Name 
											item("ACCESS_STATUS_EFFECTIVE_DATE", "ACCESS_STATUS_EFFECTIVE_DATE"), //  DateActive old
											item("DATEDEACTIVATED", "DATEDEACTIVATED"),
											item("TYPE", "TYPE"),  // not present in the layer
											item("STATUS", "STATUS"),  // not present in the layer
											item("FIRE_CENTRE_NAME", "FIRE_CENTRE_NAME"), // FireCentre old
											item("BULLETIN_URL", "BULLETIN_URL") // OLD "URL"
											} ),
				// British_Columbia_Fire_Centre_Boundaries
				request(NearbyService.PROVIDER_WF_ARCGIS, ArcgisDataProvider.TYPE_BCFC_BOUNDRS, param.getWfArcGisLayer_Fire_Centre_Boundaries(),
									NearbyQuery.GEOMETRY, 100000,  
									new DataItemDef[] { item("OBJECTID" ,  "OBJECTID"),
														item("rings",     "rings"),
														item("HEADQUARTERS",  "HEADQUARTERS"),
														item("FIRE_CENTRE",  "FIRE_CENTRE"),
														item("FIRE_CENTRE_CODE", "FIRE_CENTRE_CODE"),
														item("HEADQUARTERS", "HEADQUARTERS")
														} ),
				DataRequestDef.request(NearbyService.PROVIDER_WF_FIREWEATHER, param.getFireweatherStationsKey(),
						100000, new DataItemDef[]{ 
								DataItemDef.item("stationCode"),
								DataItemDef.item("stationName"),
								DataItemDef.item("distance"),
								DataItemDef.item("elevation"),
								DataItemDef.item("currentWeather.relativeHumidity"),
								DataItemDef.item("currentWeather.windSpeed"),
								DataItemDef.item("currentWeather.windDirection"),
								DataItemDef.item("currentWeather.windCardinalDir"),
								DataItemDef.item("currentWeather.precipitation"),
								DataItemDef.item("currentWeather.fineFuelMoistureCode"),
								DataItemDef.item("currentWeather.initialSpreadIndex"),
								DataItemDef.item("currentWeather.fireWeatherIndex")
								})
		};
		
		LOG.debug(">initNearByQuery");
	}	

	private static long executionCount = 0;
	
	@SuppressWarnings("unused")
	private static <T> String debugNulls(String name, Supplier<T> expression, Function<T,String> format) {
		try {
			T value = expression.get();
			if(Objects.isNull(value)) {
				return name + " = null";
			} else {
				try { 
					return name + " = " +format.apply(value); 
				} catch (NullPointerException e) {
					return name + " formatter throws NPE";
				}
			}
		} catch (NullPointerException e) {
			return name + " throws NPE";
		}
		
	}
	
	@SuppressWarnings("unchecked")
	public QueryResource createResource(QueryPt pt, Double radius, QueryResult queryResult) throws ServiceErrorException {
		LOG.debug(">createResource");

		NearbyResource result = new NearbyResource();

		Map<String, Object> dataSet = new HashMap<String, Object>();

		List<Map<String, Object>> resultList = new ArrayList<Map<String, Object>>();

		setMetadata(pt, radius, queryResult, result);

		try {
			
			Map<String, Object> featureMap = new HashMap<>();
			
			boolean completeInd = true;
			{
				Map<String, Object> nearMeCache = new HashMap<String, Object>();
								
				LOG.debug("Get cached NearbyDataResults");
				
				if(!nearbyDataResultsCache.getNearbyDataResults().isEmpty()) {

					nearMeCache.putAll(nearbyDataResultsCache.getNearbyDataResults());
				}
				
				LOG.debug("Checking to make sure all of the features are in the cache");
				for (DataResult dr : queryResult.getDataResults()) {
					
					String dataBaseName = dr.getDataRequestDef().getDatasetName();
					Object cachedResult = nearMeCache.get(dataBaseName);
					
					if(cachedResult==null) {
						// We are missing a feature in the cache
						LOG.info("Cache Miss for "+dr.getDataRequestDef().getDatasetName());
						
						completeInd = false;
					} else {
						
						// Check for objects
						List<Map<String, String>> featureObjectsList = (List<Map<String, String>>) cachedResult;
						
						List<Map<String, String>> mappedValues = dr.getMappedValues();
						
						if(mappedValues!=null) {
							
							for (Map<String, String> resultMap : mappedValues) {
			
								String objectId = resultMap.get("objectid");
								
								Map<String, Map<String, String>> featureObjListByObjId = getFeatureObjListByObjId(featureObjectsList);
								
								if(!featureObjListByObjId.containsKey(objectId)) {
									
									completeInd = false;
								}
							}
						}
						featureMap.put(dataBaseName, cachedResult);
					}
				}
			}
			
			if(!completeInd) {
				
				LOG.debug("We are missing a feature in the cache so we need to execute a query");
				NearbyResource nearByRsrc = null;
				try {
				
					String radString = null;
					if(radius!=null) {
						
						radString = radius.toString();
					}
					
					nearByRsrc = nearbyService.fetchNearbyDataResults(Double.toString(pt.getLon()), Double.toString(pt.getLat()), radString, true);
					
				} catch (ServiceBusyException e) {
					// If we get an exception then just go with the cached results
					
					LOG.warn("Failed to update cache on cache miss", e);
				}
				
				if(nearByRsrc!=null) {
					// We have some new results
					
					LOG.warn("Discarding the results taken from the cache");
					featureMap.clear();
					
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
					
					// Update the cache with the new results
					nearbyDataResultsCache.updateNearbyDataResults(featureMap, false);
				}
				
			}
			
			for (DataResult dr : queryResult.getDataResults()) {
				
				String featureName = dr.getDataRequestDef().getDatasetName();
				
				LOG.debug("dr.getDataRequestDef().getDatasetName() = "+featureName );
				
				Object featureObj = featureMap.get(featureName);
				
				if(featureObj!=null) {
					
					List<Map<String, String>> featureObjectsList = (List<Map<String, String>>) featureObj;
						
					Map<String, Map<String, String>> featureObjListByObjId = getFeatureObjListByObjId(featureObjectsList);
					
					Map<String, Map<String, String>> featureObjMap = new HashMap<String, Map<String, String>>();
					featureObjMap.putAll(featureObjListByObjId);
											
					List<Map<String, String>> mappedValues = dr.getMappedValues();
					
					if(mappedValues!=null) {
					
						for (Map<String, String> resultMap : dr.getMappedValues()) {
		
							String objectId = resultMap.get("objectid");
							if(objectId!=null) {
								Map<String, String> featureMapEntry = featureObjMap.get(objectId);
								featureGeometry(pt, featureMapEntry, resultMap);
							}
						}
					}
					dataSet.put(featureName, dr.getMappedValues());
				}
			}

		} catch (Throwable t) {
			
			LOG.error(t.getMessage(), t);
			
			throw new ServiceErrorException(Messages.ERROR_INTERNAL, t);
		}

		resultList.add(dataSet);

		result.setFeatures(resultList);

		// remapping names
		LOG.debug("remapping names ");
		
		for ( Map<String, Object>  feature : result.getFeatures() ) {
			for (String key : feature.keySet() ) {  

				List<Map<String, Object>> featureInstances = (List<Map<String, Object>>) feature.get(key);
				if(Objects.isNull(featureInstances)) {
					LOG.warn("Fields for "+key+" is null. Ignoring feature for name remapping.  This is probably due to a previous error while accessing the data.");
					continue;
				} 
				for (Map<String, Object>  fields : featureInstances ) {
					String objectId = (String)fields.get("objectid");
					if(objectId!=null) {
						
						for (int i=0; i<fieldsRemapping.length; i++) {

							Object value = fields.get(fieldsRemapping[i][0]);
							if (value!=null) {
								
								fields.remove( fieldsRemapping[i][0] );
								fields.put(fieldsRemapping[i][1], value);
							}
						} 
					}
					
				}
			   
			} 
			
			renameFeatureLayers(feature, NEARBY);
			
		} 
		
		++executionCount;
		LOG.debug("<createResource "+executionCount);
		return result;
	}
	
	@VisibleForTesting
	static void renameFeatureLayers(Map<String, Object> feature, DataRequestDef[] definitions) {
		// Rename layers
		for(DataRequestDef requestDef : definitions) {
			String oldDatasetName = requestDef.getDatasetName();
			getNewLayerName(oldDatasetName)
				.ifPresent(newDatasetName->{
					Object value = feature.get(oldDatasetName);
					feature.remove(oldDatasetName);
					feature.put(newDatasetName, value);
				});
		} 
	}
	
	@VisibleForTesting
	static Optional<String> getNewLayerName(String oldDatasetName) {
		return layersMapping.entrySet().stream()
			.map(entry->{
					Matcher match = entry.getKey().matcher(oldDatasetName);
					if(match.find()) {
						return Optional.of(entry.getValue().apply(match));
					}
					return Optional.<String>empty();
				})
			.filter(Optional::isPresent)
			.map(Optional::get)
			.findAny();
	}

	@VisibleForTesting
	static void featureGeometry(QueryPt pt, Map<String, String> featureMapEntry,
			Map<String, String> resultMap) throws ParseException {
		if (featureMapEntry != null) {

			String latitude = resultMap.get("latitude");
			String longitude = resultMap.get("longitude");

			if (latitude != null && longitude != null && !"".equals(latitude) && !"".equals(longitude)) {
				String distanceCalculated = DistanceCalculator.distance(pt.getLat(), Double.parseDouble(latitude),
						pt.getLon(), Double.parseDouble(longitude));
				resultMap.put("distance", distanceCalculated + " km");

				String bboxMinLongitude = longitude;
				String bboxMaxLongitude = longitude;
				String bboxMinLatitude = latitude;
				String bboxMaxLatitude = latitude;

				resultMap.put("bboxMinLongitude", bboxMinLongitude);
				resultMap.put("bboxMaxLongitude", bboxMaxLongitude);
				resultMap.put("bboxMinLatitude", bboxMinLatitude);
				resultMap.put("bboxMaxLatitude", bboxMaxLatitude);
			} else {

				HashMap<String, String> obj = new HashMap<String, String>();
				obj.putAll(featureMapEntry);

				String ringsFromCache = obj.get("rings");
				if (ringsFromCache != null && !"".equals(ringsFromCache)) {

					Geometry polygon = getPolygon(ringsFromCache);

					if(!polygon.isEmpty()) {
						
						Envelope envelope = polygon.getEnvelopeInternal();

						resultMap.put("bboxMinLongitude", Double.toString(envelope.getMinX()));
						resultMap.put("bboxMaxLongitude", Double.toString(envelope.getMaxX()));
						resultMap.put("bboxMinLatitude", Double.toString(envelope.getMinY()));
						resultMap.put("bboxMaxLatitude", Double.toString(envelope.getMaxY()));						
						Geometry inputPoint = getInputPoint(pt);

						Coordinate[] pts = calcNearestCord(inputPoint, polygon);

						List<Double> coordinates = new ArrayList<Double>();

						coordinates.add(Double.valueOf(pts[0].x));
						coordinates.add(Double.valueOf(pts[0].y));

						resultMap.put("nearest_coordinates", coordinates.toString());

						String distanceCalculated = getDistance(pt, pts);

						resultMap.put("distance_to_nearest_coordinates", distanceCalculated + " km");
					}
					resultMap.remove("rings");
				} else {
					resultMap.remove("rings");
				}
			} 
		}
	}

	protected void setMetadata(QueryPt pt, Double radius, QueryResult queryResult, NearbyResource result) {
		result.setLon(pt.getLon());
		result.setLat(pt.getLat());
		result.setRadius(radius);
		result.setErrorCount(queryResult.getErrorCount());
		if (queryResult.getErrorCount() > 0) {
			result.setErrorMsg(Messages.ERROR_IDENTIFY_DATA);
			result.setErrorDetail(queryResult.getErrorMsg());
		}

	}

	public QueryResource getQueryResultRsrc(QueryPt pt, Double radius, QueryResult queryResult) {
		NearbyResource result = new NearbyResource();

		Map<String, Object> dataSet = new HashMap<String, Object>();

		List<Map<String, Object>> resultList = new ArrayList<Map<String, Object>>();

		setMetadata(pt, radius, queryResult, result);

		for (DataResult dr : queryResult.getDataResults()) {
			Object value = dr.getMappedValues();
			dataSet.put(dr.getDataRequestDef().getDatasetName(), value);
		}

		resultList.add(dataSet);

		result.setFeatures(resultList);

		return result;
	}

	public static Geometry getPolygon(String ringsString) throws ParseException {


		// The ArcGIS JSON format doesn't distinguish between polygons and multipolygons like GeoJSON does.
		// Instead of the first ring being the exterior and the rest being holes, any ring could be an exterior 
		// or hole based on its winding order.  CW for exteriors and CCW for holes.  We can parse this using the 
		// GeoJSON parser by pretending it's a polygon, separating the exteriors and holes, and assigning holes 
		// to the correct exteriors, then building a multipolygon 
		
		GeometryFactory gFactory = new GeometryFactory();
		GeoJsonReader geoJsonReader = new GeoJsonReader(gFactory);
		String jsonResponsePolygon = "{\"coordinates\":" + ringsString + ", \"type\":\"Polygon\"}";

		Polygon result = (Polygon) geoJsonReader.read(new StringReader(jsonResponsePolygon));
		
		if(result.isEmpty()) {
			return gFactory.createMultiPolygon();
		}
		
		List<Polygon> exteriorRings = new ArrayList<>(result.getNumInteriorRing()+1);
		List<Polygon> interiorRings = new ArrayList<>(result.getNumInteriorRing());
		
		
		(Orientation.isCCW(result.getExteriorRing().getCoordinates()) ? interiorRings : exteriorRings ).add(gFactory.createPolygon(result.getExteriorRing()));
		
		for(int i = 0; i<result.getNumInteriorRing(); i++) {
			LinearRing interiorRingN = result.getInteriorRingN(i);
			(Orientation.isCCW(interiorRingN.getCoordinates()) ? interiorRings : exteriorRings).add(gFactory.createPolygon(interiorRingN));
		}

		List<LinkedList<Polygon>> polyRings = exteriorRings.stream().map(ring->{
			LinkedList<Polygon> r = new LinkedList<>();
			r.add(ring);
			return r;
		}).collect(Collectors.toList());
		
		// Assign each hole to the shell that contains it
		interiorRings.forEach(hole->{
			for(List<Polygon> rings : polyRings){
				if(rings.get(0).contains(hole)) {
					rings.add(hole);
					break;
				}
			}
		});
		
		// Convert it all to a Geometry object
		return gFactory.createMultiPolygon(GeometryFactory.toPolygonArray(polyRings.stream().map(rings->{
			LinearRing exterior = rings.pop().getExteriorRing();
			LinearRing[] interior = rings.stream().map(Polygon::getExteriorRing).collect(Collectors.toList()).toArray(new LinearRing[rings.size()]);
			return gFactory.createPolygon(exterior, interior);
		}).collect(Collectors.toList())));
	}

	public static Geometry getInputPoint(QueryPt pt) throws ParseException {
		Geometry result = null;

		GeoJsonReader geoJsonReader = new GeoJsonReader();

		String inputPoint = "{\"coordinates\":[" + pt.getLon() + ", " + pt.getLat() + "], \"type\":\"Point\"}";

		result = geoJsonReader.read(new StringReader(inputPoint));

		return result;
	}

	public static Coordinate[] calcNearestCord(Geometry pointGeoObject, Geometry polygonGeoObject) throws ParseException {

		Coordinate[] pts = DistanceOp.nearestPoints(polygonGeoObject, pointGeoObject);

		List<Double> coordinates = new ArrayList<Double>();

		coordinates.add(Double.valueOf(pts[0].x));
		coordinates.add(Double.valueOf(pts[0].y));

		return pts;
	}

	public static String getDistance(QueryPt pt, Coordinate[] pts) {
		String distanceCalculated = DistanceCalculator.distance(pt.getLat(), pts[0].y, pt.getLon(), pts[0].x);

		return distanceCalculated;
	}

	public Map<String, Map<String, String>> getFeatureObjListByObjId(List<Map<String, String>> featureObjList) {

		Map<String, Map<String, String>> featureObjMap = new HashMap<String, Map<String, String>>();

		for (Map<String, String> featureObj : featureObjList) {
			featureObjMap.put(featureObj.get("objectid"), featureObj);
		}
		return featureObjMap;
	}
}
