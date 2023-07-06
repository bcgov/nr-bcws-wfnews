package ca.bc.gov.mof.wfpointid.nearby;

import static ca.bc.gov.mof.wfpointid.util.PointidMatchers.isEmpty;
import static ca.bc.gov.mof.wfpointid.util.PointidMatchers.isPresent;
import static ca.bc.gov.mof.wfpointid.util.PointidMatchers.parseTo;
import static ca.bc.gov.mof.wfpointid.util.PointidMatchers.valueWithUnit;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasEntry;
import static org.hamcrest.Matchers.hasKey;
import static org.hamcrest.Matchers.hasProperty;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.instanceOf;
import static org.hamcrest.Matchers.not;

import org.hamcrest.number.IsCloseTo;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.hamcrest.Matcher;
import org.hamcrest.Matchers;
import org.junit.Test;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.MultiPolygon;
import org.locationtech.jts.io.geojson.GeoJsonReader;

import ca.bc.gov.mof.wfpointid.dataprovider.DataItemDef;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequestDef;
import ca.bc.gov.mof.wfpointid.query.QueryPt;

public class NearbyQueryTest {
	
	static final double delta = 0.000001;
	
	static Matcher<Double> closeTo(double operand){
		return IsCloseTo.closeTo(operand, delta);
	}
	
	@Test
	public void testSimpleFeatureZeroDistance() throws Exception {
		QueryPt queryPoint = new QueryPt(-123.0d, 50.0d);
		Map<String, String> cached = new HashMap<>();
		Map<String, String> resultMap = new HashMap<>();
		
		resultMap.put("longitude", "-123.0");
		resultMap.put("latitude", "50.0");
		
		NearbyQuery.featureGeometry(queryPoint, cached, resultMap);
		
		assertThat(resultMap, hasEntry(equalTo("distance"), valueWithUnit(Double::valueOf, closeTo(0), equalTo(" km"))));
		assertThat(resultMap, hasEntry(equalTo("bboxMinLongitude"), parseTo(Double::valueOf, closeTo(-123.0))));
		assertThat(resultMap, hasEntry(equalTo("bboxMaxLongitude"), parseTo(Double::valueOf, closeTo(-123.0))));
		assertThat(resultMap, hasEntry(equalTo("bboxMinLatitude"), parseTo(Double::valueOf, closeTo(50.0))));
		assertThat(resultMap, hasEntry(equalTo("bboxMaxLatitude"), parseTo(Double::valueOf, closeTo(50.0))));
	}
	
	@Test
	public void testSimpleFeatureAtDistance() throws Exception {
		QueryPt queryPoint = new QueryPt(-123.0d, 51.0d);
		Map<String, String> cached = new HashMap<>();
		Map<String, String> resultMap = new HashMap<>();
		
		resultMap.put("longitude", "-123.0");
		resultMap.put("latitude", "50.0");
		
		NearbyQuery.featureGeometry(queryPoint, cached, resultMap);
		
		assertThat(resultMap, hasEntry(equalTo("distance"), valueWithUnit(Double::valueOf, closeTo(111.19), equalTo(" km"))));
		assertThat(resultMap, hasEntry(equalTo("bboxMinLongitude"), parseTo(Double::valueOf, closeTo(-123.0))));
		assertThat(resultMap, hasEntry(equalTo("bboxMaxLongitude"), parseTo(Double::valueOf, closeTo(-123.0))));
		assertThat(resultMap, hasEntry(equalTo("bboxMinLatitude"), parseTo(Double::valueOf, closeTo(50.0))));
		assertThat(resultMap, hasEntry(equalTo("bboxMaxLatitude"), parseTo(Double::valueOf, closeTo(50.0))));
	}
	
	@Test
	public void testComplexFeatureAtDistance() throws Exception {
		QueryPt queryPoint = new QueryPt(-123.0d, 51.0d);
		Map<String, String> cached = new HashMap<>();
		Map<String, String> resultMap = new HashMap<>();
		
		cached.put("rings", "[[[-122.0, 50],[-122.0, 49.0],[-123.0, 49.0],[-123.0, 50.0],[-122.0, 50]]]");
		
		NearbyQuery.featureGeometry(queryPoint, cached, resultMap);
		
		assertThat(resultMap, hasEntry(equalTo("distance_to_nearest_coordinates"), valueWithUnit(Double::valueOf, closeTo(111.19), equalTo(" km"))));
		assertThat(resultMap, hasEntry(equalTo("bboxMinLongitude"), parseTo(Double::valueOf, closeTo(-123.0))));
		assertThat(resultMap, hasEntry(equalTo("bboxMaxLongitude"), parseTo(Double::valueOf, closeTo(-122.0))));
		assertThat(resultMap, hasEntry(equalTo("bboxMinLatitude"), parseTo(Double::valueOf, closeTo(49.0))));
		assertThat(resultMap, hasEntry(equalTo("bboxMaxLatitude"), parseTo(Double::valueOf, closeTo(50.0))));
	}
	
	@Test
	public void testMultipolygon() throws Exception {
		QueryPt queryPoint = new QueryPt(-123.0d, 51.0d);
		Map<String, String> cached = new HashMap<>();
		Map<String, String> resultMap = new HashMap<>();
		
		cached.put("rings", "[[[-122.0, 50],[-122.0, 49.0],[-123.0, 49.0],[-123.0, 50.0],[-122.0, 50]],[[-120.0,50.0],[-120.0,49.0],[-121.0,49.0],[-121.0,50.0],[-120.0,50.0]]]");
		
		NearbyQuery.featureGeometry(queryPoint, cached, resultMap);
		
		assertThat(resultMap, hasEntry(equalTo("distance_to_nearest_coordinates"), valueWithUnit(Double::valueOf, closeTo(111.19), equalTo(" km"))));
		assertThat(resultMap, hasEntry(equalTo("bboxMinLongitude"), parseTo(Double::valueOf, closeTo(-123.0))));
		assertThat(resultMap, hasEntry(equalTo("bboxMaxLongitude"), parseTo(Double::valueOf, closeTo(-120.0))));
		assertThat(resultMap, hasEntry(equalTo("bboxMinLatitude"), parseTo(Double::valueOf, closeTo(49.0))));
		assertThat(resultMap, hasEntry(equalTo("bboxMaxLatitude"), parseTo(Double::valueOf, closeTo(50.0))));
	}	
	
	@Test
	public void testParseEsriMultipolygonWithHoles() throws Exception {
		
		Geometry geo = NearbyQuery.getPolygon("["
				+ "[[-120.75, 49.75],[-120.75, 49.25],[-120.25, 49.25],[-120.25, 49.75],[-120.75, 49.75]],"
				+ "[[-122.75, 49.75],[-122.75, 49.25],[-122.25, 49.25],[-122.25, 49.75],[-122.75, 49.75]],"
				+ "[[-122.0, 50.0],[-122.0, 49.0],[-123.0, 49.0],[-123.0, 50.0],[-122.0, 50.0]],"
				+ "[[-120.0, 50.0],[-120.0, 49.0],[-121.0, 49.0],[-121.0, 50.0],[-120.0, 50.0]]"
				+ "]");
		Geometry expected = (new GeoJsonReader()).read("{\"type\":\"MultiPolygon\",\"coordinates\":["
				+ "["
				+ "[[-123.0, 50.0],[-123.0, 49.0],[-122.0, 49.0],[-122.0, 50.0],[-123.0, 50.0]],"
				+ "[[-122.25, 49.75],[-122.25, 49.25],[-122.75, 49.25],[-122.75, 49.75],[-122.25, 49.75]]"
				+ "],["
				+ "[[-121.0, 50.0],[-121.0, 49.0],[-120.0, 49.0],[-120.0, 50.0],[-121.0, 50.0]],"
				+ "[[-120.25, 49.75],[-120.25, 49.25],[-120.75, 49.25],[-120.75, 49.75],[-120.25, 49.75]]"
				+ "]]}");
		
		assertTrue(expected.equalsTopo(geo));
	}
	
	@Test
	public void testParseEmptyEsriMultipolygon() throws Exception {
		
		Geometry geo = NearbyQuery.getPolygon("[]");
		
		assertThat(geo, hasProperty("empty", equalTo(true)));
		assertThat(geo, hasProperty("geometryType", equalTo("MultiPolygon")));
		assertThat(geo, instanceOf(MultiPolygon.class));
	}
	
	@Test
	public void testEmptyPolygon() throws Exception {
		QueryPt queryPoint = new QueryPt(-123.0d, 51.0d);
		Map<String, String> cached = new HashMap<>();
		Map<String, String> resultMap = new HashMap<>();
		
		cached.put("rings", "[]");
		
		NearbyQuery.featureGeometry(queryPoint, cached, resultMap);
		
		assertThat(resultMap, not(hasKey(equalTo("distance_to_nearest_coordinates"))));
		assertThat(resultMap, not(hasKey(equalTo("bboxMinLongitude"))));
		assertThat(resultMap, not(hasKey(equalTo("bboxMaxLongitude"))));
		assertThat(resultMap, not(hasKey(equalTo("bboxMinLatitude"))));
		assertThat(resultMap, not(hasKey(equalTo("bboxMaxLatitude"))));
	}	

	
	@Test
	public void testGetNewLayerNameShorten() throws Exception {
		Optional<String> result = NearbyQuery.getNewLayerName("ubm4tcTYICKBpist/ArcGIS/rest/services/British_Columbia_Danger_Rating/FeatureServer/0");
		
		assertThat(result, isPresent(equalTo("British_Columbia_Danger_Rating")));
	}
	
	@Test
	public void testGetNewLayerNameReplace() throws Exception {
		Optional<String> result = NearbyQuery.getNewLayerName("ubm4tcTYICKBpist/ArcGIS/rest/services/Emrg_Orders_and_Alerts/FeatureServer/0");
		
		assertThat(result, isPresent(equalTo("Evacuation_Orders_and_Alerts")));
	}
	@Test
	public void testGetNewLayerNamePassUnknownName() throws Exception {
		Optional<String> result = NearbyQuery.getNewLayerName("ubm4tcTYICKBpist/ArcGIS/rest/services/TestLayerPleaseIgnore/FeatureServer/0");
		
		assertThat(result, isEmpty());
	}
	
	DataRequestDef dummyDef(String dataSetName) {
		return DataRequestDef.request((String)null, dataSetName, 0, (DataItemDef)null);
	}
	
	@Test 
	public void testRenameFeatureLayersOneLayer() throws Exception {
		Map<String, Object> feature = new HashMap<>();
		feature.put("bm4tcTYICKBpist/ArcGIS/rest/services/British_Columbia_Danger_Rating/FeatureServer/0", "Value1");
		
		DataRequestDef[] definitions = new DataRequestDef[] {dummyDef("bm4tcTYICKBpist/ArcGIS/rest/services/British_Columbia_Danger_Rating/FeatureServer/0")};
		NearbyQuery.renameFeatureLayers(feature, definitions);
		
		assertThat(feature, hasEntry("British_Columbia_Danger_Rating", "Value1"));
		assertThat(feature.keySet(), hasSize(1));
	}
	
	@Test 
	public void testRenameFeatureLayersMultipleLayers() throws Exception {
		Map<String, Object> feature = new HashMap<>();
		feature.put("bm4tcTYICKBpist/ArcGIS/rest/services/British_Columbia_Danger_Rating/FeatureServer/0", "Value1");
		feature.put("ubm4tcTYICKBpist/ArcGIS/rest/services/Emrg_Orders_and_Alerts/FeatureServer/0", "Value2");
		feature.put("ubm4tcTYICKBpist/ArcGIS/rest/services/TestLayerPleaseIgnore/FeatureServer/0", "Value3");
		
		DataRequestDef[] definitions = new DataRequestDef[] {
				dummyDef("bm4tcTYICKBpist/ArcGIS/rest/services/British_Columbia_Danger_Rating/FeatureServer/0"),
				dummyDef("ubm4tcTYICKBpist/ArcGIS/rest/services/Emrg_Orders_and_Alerts/FeatureServer/0"),
				dummyDef("ubm4tcTYICKBpist/ArcGIS/rest/services/TestLayerPleaseIgnore/FeatureServer/0")
				};
		NearbyQuery.renameFeatureLayers(feature, definitions);
		
		assertThat(feature, hasEntry("British_Columbia_Danger_Rating", "Value1"));
		assertThat(feature, hasEntry("Evacuation_Orders_and_Alerts", "Value2"));
		assertThat(feature, hasEntry("ubm4tcTYICKBpist/ArcGIS/rest/services/TestLayerPleaseIgnore/FeatureServer/0", "Value3"));
		assertThat(feature.keySet(), hasSize(3));
	}
}
