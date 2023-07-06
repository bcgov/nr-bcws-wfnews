package ca.bc.gov.mof.wfpointid.dataprovider.arcgis;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.net.UnknownHostException;
import java.util.Properties;

import javax.net.ssl.HttpsURLConnection;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.mof.wfpointid.dataprovider.DataItemDef;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequest;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequestCall;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequestDef;
import ca.bc.gov.mof.wfpointid.dataprovider.DataResult;
import ca.bc.gov.mof.wfpointid.util.IOUtil;
import ca.bc.gov.mof.wfpointid.util.UrlTemplate;

public class ArcgisDataRequestCall implements DataRequestCall {

	private static Logger LOG = LoggerFactory.getLogger(ArcgisDataRequestCall.class);

	final Properties props = new Properties();

	InputStream inputStream;

	private ArcgisDataProvider provider;

	ArcgisDataRequestCall(ArcgisDataProvider dataProvider) {
		this.provider = dataProvider;
	}

	@Override
	public DataResult perform(DataRequest req) throws Exception {

		String propFileName = "application.properties";

		inputStream = getClass().getClassLoader().getResourceAsStream(propFileName);

		if (inputStream != null) {
			props.load(inputStream);
		} else {
			throw new FileNotFoundException("property file '" + propFileName + "' not found in the classpath");
		}

		DataRequestDef dataQueryDef = req.getDataRequestDef();

		if (dataQueryDef.getRequestType().equals("BCFC_BOUNDRS") || dataQueryDef.getRequestType().equals("BCDANRAT")) {
			if (req.getQueryPt().getLat() != Double.parseDouble("55.2758")
					&& req.getQueryPt().getLon() != Double.parseDouble("-124.8509")) {
				req.setRadius(Double.valueOf(1.0));
			} else {
				req.setRadius(Double.valueOf(999.0));
			}
		}

		String urlStr = null;

		urlStr = expandURLTemplate(req);

		DataResult res = null;

		try {
			LOG.trace("---- [" + req.getId() + "]  URL " + urlStr);

			URL url = new URL(urlStr);
			LOG.info("Connection URL="+urlStr);
			String response;
			HttpsURLConnection conn = (HttpsURLConnection) url.openConnection();

			try {
				for (String header : conn.getRequestProperties().keySet()) {
					if (header != null) {
						for (String value : conn.getRequestProperties().get(header)) {
							LOG.debug("REQUEST HEADER: " + header + ":" + value);
						}
					}
				}
				conn.setConnectTimeout(dataQueryDef.getTimeout());
				conn.setReadTimeout(dataQueryDef.getTimeout());
				conn.setDoOutput(true);
				response = IOUtil.readAll(conn.getInputStream());

				for (String header : conn.getHeaderFields().keySet()) {
					if (header != null) {
						for (String value : conn.getHeaderFields().get(header)) {
							LOG.debug("RESPONSE HEADER: " + header + ":" + value);
						}
					}
				}
			} catch (IOException ioe) {
				LOG.warn(ioe.getMessage(), ioe);
				LOG.warn("HTTP Response Code: " + conn.getResponseCode() +  " URL: "+ conn.getURL().toString());
				response = IOUtil.readAll(conn.getErrorStream());
				LOG.warn("HTTP Response Code: " + conn.getResponseCode() + " HTTP Response: " + response + " URL: "+ conn.getURL().toString());
			}
			LOG.debug("HTTP Response Code: " + conn.getResponseCode() + " URL: " + conn.getURL().toString());

			ArcgisResponse arcgisResponse = new ArcgisResponse(response);

			if (arcgisResponse.isException()) {
				String errMsg = provider.getName() + ":  " + arcgisResponse.exceptionMsg();
				res = DataResult.createError(dataQueryDef, errMsg);
			} else {
				res = extractValues(dataQueryDef, arcgisResponse);
				res.setMappedValues(arcgisResponse.fillMappedValues(dataQueryDef));
			}

		} catch (Exception ex) {
			LOG.warn( ex.getMessage(), ex );
			res = createError(dataQueryDef, ex);
		}
		return res;
	}

	private String expandURLTemplate(DataRequest req) {
		DataRequestDef dataQueryDef = req.getDataRequestDef();

		
		double lon = req.getQueryPt().getLon();
		double lat = req.getQueryPt().getLat();

		double radius;
		if(req.getRadius()!=null) {
			
			radius = req.getRadius().doubleValue();
		} else {
			radius = ArcgisDataProvider.QUERY_BUFFER_RADIUS_KMS;
		}
		
		UrlTemplate t;
		if(req.useBufferedPoint()) {
			
			String template = ArcgisDataProvider.urlTemplate(dataQueryDef.getRequestType(), true);
			
			t = new UrlTemplate(template);

			t.setParam("HOST", provider.getHost());
			t.setParam("LYR", dataQueryDef.getDatasetName());
			t.setParam("GEOM", dataQueryDef.getGeometryName());
			t.setParam("XORD", Double.valueOf(lon));
			t.setParam("YORD", Double.valueOf(lat));
			t.setParam("BUFFERKMS", Double.valueOf(radius));
		} else {
			
			String template = ArcgisDataProvider.urlTemplate(dataQueryDef.getRequestType(), false);
			
			t = new UrlTemplate(template);
			
			double radiusLat = kmsToDecimalDegreesLat(radius, lat);
			double radiusLon = kmsToDecimalDegreesLon(radius, lat);
			
			double lonMin = lon - radiusLon;
			double lonMax = lon + radiusLon;
			double latMin = lat - radiusLat;
			double latMax = lat + radiusLat;
			
			t.setParam("HOST", provider.getHost());
			t.setParam("LYR", dataQueryDef.getDatasetName());
			t.setParam("GEOM", dataQueryDef.getGeometryName());
			t.setParam("LONMIN", Double.valueOf(lonMin));
			t.setParam("LONMAX", Double.valueOf(lonMax));
			t.setParam("LATMIN", Double.valueOf(latMin));
			t.setParam("LATMAX", Double.valueOf(latMax));
		}
		LOG.info(t.getValue());
		return t.getValue();
	}

	private static DataResult extractValues(DataRequestDef dataQueryDef, ArcgisResponse arcgisResponse) {
		DataItemDef[] itemDef = dataQueryDef.getItems();
		Object[] vals = new Object[itemDef.length];
		initArray(vals, DataResult.RESULT_VALUE_EMPTY);

		// check if response contains features
		if (arcgisResponse.hasGMLFeatures()) {

			vals = arcgisResponse.extractGMLValues(dataQueryDef);
		}
		return DataResult.createValue(dataQueryDef, vals);
	}

	private static void initArray(Object[] arr, Object val) {
		for (int i = 0; i < arr.length; i++) {
			arr[i] = val;
		}
	}

	private DataResult createError(DataRequestDef dataQueryDef, Exception ex) {
		LOG.info(">createError");
		DataResult res;
		String context = provider.getName();

		/**
		 * For provider-level errors only show provider name, to allow merging like
		 * errors
		 */
		boolean isProviderError = ex instanceof UnknownHostException;
		if (!isProviderError) {
			context += ":" + dataQueryDef.getDatasetName();
		}

		String errMsg = context + ">" + ex.getClass().getSimpleName() + "--" + ex.getMessage();
		res = DataResult.createError(dataQueryDef, errMsg);
		LOG.info("ERROR: "+errMsg);
		LOG.info("<createError");
		return res;
	}

	public static double kmsToDecimalDegreesLat(double radiusInKm, double latitude) {
		double deltaLat = radiusInKm / 111.1;
		// return (meters /6371.0) * (180 / Math.PI);
		return deltaLat;
	}

	public static double kmsToDecimalDegreesLon(double radiusInKm, double latitude) {
		double kmInLongitudeDegree = 111.320 * Math.cos(latitude / 180.0 * Math.PI);
		double deltaLong = radiusInKm / kmInLongitudeDegree;
		// return (meters / 6371.0) * (180 / Math.PI ) / Math.cos(latitude * Math.PI / 180);
		return deltaLong;
	}
}
