package ca.bc.gov.mof.wfpointid.dataprovider.geoserver;

import ca.bc.gov.mof.wfpointid.dataprovider.DataProviderBase;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequest;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequestCall;
import ca.bc.gov.mof.wfpointid.util.StringUtil;
import ca.bc.gov.mof.wfpointid.util.UrlParamEncoder;

public class GeoserverDataProvider extends DataProviderBase {
	
	public static final String TYPE_WMS = "WMS";
	public static final String TYPE_WFS = "WFS";
	public static final String TYPE_WFS_BUF = "WFS_BUF";
			
	/**
	 * Buffer value to use for WMS GetFeatureInfo extents and for WFS queries against point and line features
	 * Approximately 100 m at 55 degrees N = 0.0008 degrees
	 */
	static final double QUERY_BUFFER_RADIUS_DEGREES = 0.0008;
	static final double QUERY_BUFFER_RADIUS_METERS = 100;

	/**
	 * Need to encode URL parameters for BCGW use (and is generally good practice)
	 */
	private static final String URL_WFS_GetFeature = "{{HOST}}/wfs?service=wfs&version=1.1.0&request=GetFeature"
		+ "&typeNames={{LYR}}&propertyName={{PROP}}"
		+ "&FILTER="
		+ UrlParamEncoder.encode("<Filter xmlns='http://www.opengis.net/ogc' xmlns:gml='http://www.opengis.net/gml'><Intersects><PropertyName>{{GEOM}}</PropertyName><gml:Point srsName='EPSG:4326'><gml:coordinates>{{LON}},{{LAT}}</gml:coordinates></gml:Point></Intersects></Filter>");
	
	private static final String URL_WFS_GetFeature_BUF = "{{HOST}}/wfs?service=wfs&version=1.0.0&request=GetFeature"
		+ "&typeNames={{LYR}}&propertyName={{PROP}}"
		+ "&FILTER="
		+ UrlParamEncoder.encode("<Filter xmlns:gml='http://www.opengis.net/gml'><Intersects><PropertyName>{{GEOM}}</PropertyName><gml:Polygon srsName='EPSG:4326'><gml:outerBoundaryIs><gml:LinearRing><gml:coordinates>{{LONMIN}},{{LATMIN}} {{LONMAX}},{{LATMIN}} {{LONMAX}},{{LATMAX}} {{LONMIN}},{{LATMAX}} {{LONMIN}},{{LATMIN}}</gml:coordinates></gml:LinearRing></gml:outerBoundaryIs></gml:Polygon></Intersects></Filter>");
	
	/**
	 * Use a WMS GFI query to obtain a value.
	 * To simulate a point query and to improve performance,  
	 * the midpoint of a very small (100x100) image is queried, with a small buffersize (2)
	 */
	private static final String URL_WMS_GetFeatureInfo = "{{HOST}}/wms?service=wms&version=1.1.0&request=GetFeatureInfo"
		+ "&FEATURE_COUNT=1&FORMAT=image/png&INFO_FORMAT=text/xml&SRS=EPSG:4326"
		+ "&HEIGHT=100&WIDTH=100&X=50&Y=50&BUFFER=2"
		+ "&LAYERS={{LYR}}&QUERY_LAYERS={{LYR}}&propertyName={{PROP}}&BBOX={{LONMIN}},{{LATMIN}},{{LONMAX}},{{LATMAX}}";

	public static String urlTemplate(String type) {
		if (TYPE_WMS.equalsIgnoreCase(type)) {
			return URL_WMS_GetFeatureInfo;
		}
		else if (TYPE_WFS.equalsIgnoreCase(type)) {
			return URL_WFS_GetFeature;
		}
		else if (TYPE_WFS_BUF.equalsIgnoreCase(type)) {
			return URL_WFS_GetFeature_BUF;
		}
		return URL_WFS_GetFeature;
	}
	
	public static GeoserverDataProvider create(String name, 
			String host,
			int workerNum, int queueSize) {
		return new GeoserverDataProvider(name, host, workerNum, queueSize);
	}

	
	private String host;
	private String urlTemplate;
	
	GeoserverDataProvider(String name, 
			String host,
			String urlTemplate,
			int workerNum, int queueSize) {
		super(name, workerNum, queueSize);
		this.host = host;
		this.urlTemplate = urlTemplate;
		
		// error checking
		if (StringUtil.isEmpty(host)) {
			throw new RuntimeException(String.format("DataProvider %s host is empty", name));
		}
		
	}
	GeoserverDataProvider(String name, 
			String host,
			int workerNum, int queueSize) {
		super(name, workerNum, queueSize);
		this.host = host;
		
		// error checking
		if (StringUtil.isEmpty(host)) {
			throw new RuntimeException(String.format("DataProvider %s host is empty", name));
		}
	}

	public String getHost() {
		return host;
	}
	
	public DataRequestCall prepareCall(DataRequest req) throws InterruptedException {
		return new GeoserverDataRequestCall(this, urlTemplate);
	}
	
	public String toString() {
		return String.format("GeoServer Data Provider %s: %s (workers = %d)", getName(), host, Integer.valueOf(getWorkerNum()));
	}

}
