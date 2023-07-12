package ca.bc.gov.mof.wfpointid.dataprovider.arcgis;

import ca.bc.gov.mof.wfpointid.dataprovider.DataProviderBase;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequest;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequestCall;
import ca.bc.gov.mof.wfpointid.util.StringUtil;

public class ArcgisDataProvider extends DataProviderBase {

	public static final String TYPE_BANS = "BANS";
	public static final String TYPE_AFC = "AFC";
	public static final String TYPE_AFC3DAYS = "AFC3";
	public static final String TYPE_AFCBYFC = "AFBYFC";
	public static final String TYPE_AFCBYSC = "AFBYSC";
	public static final String TYPE_AFBYCAUSE = "AFBYCAUSE";
	public static final String TYPE_FYEARLY = "FYEARLY";
	public static final String TYPE_F7DAYS = "F7DAYS";
	public static final String TYPE_FYEARBYFC = "FYEARBYFC";
	public static final String TYPE_FYEARBYCAUSE = "FYEARBYCAUSE";
	public static final String TYPE_FYEARBYSC = "FYEARBYSC";
	public static final String TYPE_BCDANRAT = "BCDANRAT";
	public static final String TYPE_EVACORDALRT = "EVACORDALRT";
	public static final String TYPE_BCAREARESTRCT = "BCAREARESTRCT";
	public static final String TYPE_BCFC_BOUNDRS = "BCFC_BOUNDRS";

	/**
	* Buffer value to use for WMS GetFeatureInfo extents and for WFS queries against point and line features
	* Approximately 100 m at 55 degrees N = 0.0008 degrees
	*/
	static final double QUERY_BUFFER_RADIUS_DEGREES = 0.0008;
	static final double QUERY_BUFFER_RADIUS_KMS = 1;

	/*  ARCGIS URL calls */
	private static String URL_ARCGIS = "{{HOST}}/{{LYR}}/query?f=json";

	private static String URL_BCAREARESTRCT_Parameters ="&where=1=1&returnGeometry=true&spatialRel=esriSpatialRelIntersects&outFields=*&outSr=4326";

	// Status parameters are not recognized but w/o parameter geometry returned
	private static String URL_BANS_Parameters = "&where=&returnGeometry=true&spatialRel=esriSpatialRelIntersects&outFields=*&outSr=4326&orderByFields=Fire_Centre_Name&resultOffset=0&resultRecordCount=100";

	private static String URL_AFC_Parameters =  "&where=FIRE_STATUS<>'Out'&returnGeometry=false&outSr=4326&spatialRel=esriSpatialRelIntersects&outFields=*";

	private static String URL_AFC3DAYS_Parameters = "&where=(FIRE_STATUS<>'Out')AND(IGNITION_DATE>=CURRENT_DATE()-3)&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&outStatistics=[{'statisticType':'count','onStatisticField':'OBJECTID','outStatisticFieldName':'value'}]";

	private static String URL_AFBYFC_Parameters = "&where=FIRE_STATUS<>'Out'&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&groupByFieldsForStatistics=FIRE_CENTRE&orderByFields=FIRE_CENTRE&outStatistics=[{\"statisticType\":\"count\",\"onStatisticField\":\"OBJECTID\",\"outStatisticFieldName\":\"value\"}]";

	private static String URL_AFBYSC_Parameters = "&where=FIRE_STATUS<>'Out'&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&groupByFieldsForStatistics=FIRE_STATUS&orderByFields=FIRE_STATUS&outStatistics=[{\"statisticType\":\"count\",\"onStatisticField\":\"OBJECTID\",\"outStatisticFieldName\":\"value\"}]";

	private static String URL_AFBYCAUSE_Parameters ="&where=FIRE_STATUS<>'Out'&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&groupByFieldsForStatistics=FIRE_CAUSE&orderByFields=FIRE_CAUSE&outStatistics=[{\"statisticType\":\"count\",\"onStatisticField\":\"OBJECTID\",\"outStatisticFieldName\":\"value\"}]";

	private static String URL_FYEARLY_Parameters ="&where=1=1&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&outStatistics=[{\"statisticType\":\"count\",\"onStatisticField\":\"OBJECTID\",\"outStatisticFieldName\":\"value\"}]";

	private static String URL_F7DAYS_Parameters = "&where=IGNITION_DATE>=CURRENT_DATE()-7&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&outStatistics=[{\"statisticType\":\"count\",\"onStatisticField\":\"OBJECTID\",\"outStatisticFieldName\":\"value\"}]";

	private static String URL_FYEARBYFC_Parameters = "&where=1=1&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&groupByFieldsForStatistics=FIRE_CENTRE&orderByFields=FIRE_CENTRE&outStatistics=[{\"statisticType\":\"count\",\"onStatisticField\":\"OBJECTID\",\"outStatisticFieldName\":\"value\"}]";

	private static String URL_FYEARBYCAUSE_Parameters ="&where=1=1&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&groupByFieldsForStatistics=FIRE_CAUSE&orderByFields=FIRE_CAUSE&outStatistics=[{\"statisticType\":\"count\",\"onStatisticField\":\"OBJECTID\",\"outStatisticFieldName\":\"value\"}]";

	private static String URL_FYEARBYSC_Parameters ="&where=1=1&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&groupByFieldsForStatistics=FIRE_STATUS&orderByFields=FIRE_STATUS&outStatistics=[{\"statisticType\":\"count\",\"onStatisticField\":\"OBJECTID\",\"outStatisticFieldName\":\"value\"}]";

	private static String URL_BCDANRAT_Parameters ="&where=1=1&returnGeometry=true&spatialRel=esriSpatialRelIntersects&outFields=*&outSr=4326";

	private static String URL_EVACORDALRT_Parameters ="&where=(ORDER_ALERT_STATUS%3C%3E%27All%20Clear%27)%20AND%20(EVENT_TYPE=%27Fire%27)&returnGeometry=true&spatialRel=esriSpatialRelIntersects&outFields=*&outSr=4326";

	private static String URL_BCFC_BOUNDRS_Parameters ="&where=1=1&returnGeometry=true&maxAllowableOffset=2&spatialRel=esriSpatialRelIntersects&outFields=*&outSr=4326";

	private static String URL_BOUNDING_BOX_GEOMETRY = "&{{GEOM}}={%22xmin%22:{{LONMIN}},%22ymin%22:{{LATMIN}},%22xmax%22:{{LONMAX}},%22ymax%22:{{LATMAX}},%22spatialReference%22:{%22wkid%22%20:%204326}}";

	private static String URL_BUFFERED_POINT_GEOMETRY = "&supportsQueryWithDistance=true&units=esriSRUnit_Kilometer&distance={{BUFFERKMS}}&geometryType=esriGeometryPoint&{{GEOM}}={\"x\":{{XORD}},\"y\":{{YORD}},\"spatialReference\":{\"wkid\":4326}}";

	private String host;
	public static String urlTemplate(String type, boolean useBufferedPoint) {

		String urlGeometryTemplate;
		if(useBufferedPoint) {

			urlGeometryTemplate = URL_BUFFERED_POINT_GEOMETRY;
		} else {

			urlGeometryTemplate = URL_BOUNDING_BOX_GEOMETRY;
		}

		if (TYPE_AFC.equalsIgnoreCase(type) ) {
			return URL_ARCGIS+URL_AFC_Parameters+urlGeometryTemplate;

		} else if (TYPE_BANS.equalsIgnoreCase(type)) {
			return URL_ARCGIS+URL_BANS_Parameters+urlGeometryTemplate;

		} else if (TYPE_AFC3DAYS.equalsIgnoreCase(type)) {
			return URL_ARCGIS+URL_AFC3DAYS_Parameters+urlGeometryTemplate;

		} else if (TYPE_AFCBYFC.equalsIgnoreCase(type)) {
			return URL_ARCGIS+URL_AFBYFC_Parameters+urlGeometryTemplate;

		} else if (TYPE_AFCBYSC.equalsIgnoreCase(type)) {
			return URL_ARCGIS+URL_AFBYSC_Parameters+urlGeometryTemplate;

		} else if (TYPE_AFBYCAUSE.equalsIgnoreCase(type)) {
			return URL_ARCGIS+URL_AFBYCAUSE_Parameters+urlGeometryTemplate;

		} else if (TYPE_FYEARLY.equalsIgnoreCase(type)) {
			return URL_ARCGIS+URL_FYEARLY_Parameters+urlGeometryTemplate;

		} else if (TYPE_F7DAYS.equalsIgnoreCase(type)) {
			return URL_ARCGIS+URL_F7DAYS_Parameters+urlGeometryTemplate;

		} else if (TYPE_FYEARBYFC.equalsIgnoreCase(type)) {
			return URL_ARCGIS+URL_FYEARBYFC_Parameters+urlGeometryTemplate;

		} else if (TYPE_FYEARBYCAUSE.equalsIgnoreCase(type)) {
			return URL_ARCGIS+URL_FYEARBYCAUSE_Parameters+urlGeometryTemplate;

		} else if (TYPE_FYEARBYSC.equalsIgnoreCase(type)) {
			return URL_ARCGIS+URL_FYEARBYSC_Parameters+urlGeometryTemplate;
		} else if (TYPE_BCDANRAT.equalsIgnoreCase(type)) {
			return URL_ARCGIS+URL_BCDANRAT_Parameters+urlGeometryTemplate;
		} else if (TYPE_EVACORDALRT.equalsIgnoreCase(type)) {
			return URL_ARCGIS+URL_EVACORDALRT_Parameters+urlGeometryTemplate;
		} else if (TYPE_BCAREARESTRCT.equalsIgnoreCase(type)) {
			return URL_ARCGIS+URL_BCAREARESTRCT_Parameters+urlGeometryTemplate;
		} else if (TYPE_BCFC_BOUNDRS.equalsIgnoreCase(type)) {
			return URL_ARCGIS+URL_BCFC_BOUNDRS_Parameters+urlGeometryTemplate;
		} else
				throw new IllegalStateException("Unknown Geoserver request type '" + type + "'");
	}

	public static ArcgisDataProvider create(String name,  String host, int workerNum, int queueSize) {
		return new ArcgisDataProvider(name, host, workerNum, queueSize);
	}


	public ArcgisDataProvider(String name, String host,  String urlTemplate,	int workerNum, int queueSize) {
		super(name, workerNum, queueSize);
		this.host = host;
		// error checking
		if (StringUtil.isEmpty(host)) {
			throw new RuntimeException(String.format("DataProvider %s host is empty", name));
		}

	}

	ArcgisDataProvider(String name, 	String host,int workerNum, int queueSize) {
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
		return new ArcgisDataRequestCall(this);
	}

	public String toString() {
		return String.format("Arcgis Data Provider %s: %s (workers = %d)", getName(), host, Integer.valueOf(getWorkerNum()));
	}

}

