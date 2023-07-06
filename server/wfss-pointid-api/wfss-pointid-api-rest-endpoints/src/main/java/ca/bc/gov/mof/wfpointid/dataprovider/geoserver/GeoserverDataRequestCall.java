package ca.bc.gov.mof.wfpointid.dataprovider.geoserver;

import java.net.URL;
import java.net.URLConnection;
import java.net.UnknownHostException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.mof.wfpointid.dataprovider.DataItemDef;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequest;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequestCall;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequestDef;
import ca.bc.gov.mof.wfpointid.dataprovider.DataResult;
import ca.bc.gov.mof.wfpointid.util.IOUtil;
import ca.bc.gov.mof.wfpointid.util.UrlTemplate;

class GeoserverDataRequestCall implements DataRequestCall {
 			
	private static Logger LOG = LoggerFactory.getLogger(GeoserverDataRequestCall.class);

	private GeoserverDataProvider provider;

	GeoserverDataRequestCall(GeoserverDataProvider dataProvider, String urlTemplate) {
		this.provider = dataProvider;
	}
	
	@Override
	public DataResult perform(DataRequest req) throws Exception {
		DataRequestDef dataQueryDef = req.getDataRequestDef();
		
		String urlStr = expandURLTemplate(req);
		
		DataResult res = null;
		
		try {
			LOG.trace("---- [" + req.getId() + "]  URL " + urlStr);
		    
		    URL url = new URL(urlStr);
		    URLConnection conn = url.openConnection();
		    conn.setConnectTimeout( dataQueryDef.getTimeout() );
		    conn.setReadTimeout( dataQueryDef.getTimeout() );
		    conn.setDoOutput(true);

		    String response = IOUtil.readAll(conn.getInputStream());
		    GeoserverResponse gsResponse = new GeoserverResponse(response);
		    
		    if (gsResponse.isException()) {
			    String errMsg = provider.getName() + " > " + gsResponse.exceptionMsg();
				res = DataResult.createError(dataQueryDef, errMsg );
		    }
		    else {
		    	res = extractValues(dataQueryDef, gsResponse);
		    }
			
		    LOG.trace("---- [" + req.getId() + "]  Response " + response);
		}
		catch (Exception ex) {
			res = createError(dataQueryDef, ex);
		}
		return res;
	}

	private DataResult createError(DataRequestDef dataQueryDef, 	Exception ex) {
		DataResult res;
		String context = provider.getName();
		
		/**
		 * For provider-level errors only show provider name, to allow merging like errors 
		 */
		boolean isProviderError = ex instanceof UnknownHostException;
		if (! isProviderError) {
			context += ":" + dataQueryDef.getDatasetName();
		}
		
		String errMsg = context
				+ ">" + ex.getClass().getSimpleName() + "--" + ex.getMessage();
		res = DataResult.createError(dataQueryDef, errMsg);
		
		return res;
	}

	private static DataResult extractValues(DataRequestDef dataQueryDef,	GeoserverResponse gsResponse) {
		DataItemDef[] itemDef = dataQueryDef.getItems();
		Object[] vals = new Object[itemDef.length];
		initArray(vals, DataResult.RESULT_VALUE_EMPTY);

		// check if response contains features
		if (gsResponse.hasGMLFeatures()) {
			for (int i = 0; i < itemDef.length; i++) {
				String val = DataResult.RESULT_VALUE_EMPTY;
				val = gsResponse.extractGMLPropertyValue( itemDef[i].getAttributeName() );
				
				// Missing properties are returned as an empty value.
				if (val != null)
					vals[i] = val;
			}
		}
		return DataResult.createValue(dataQueryDef, vals);
	}

	private static void initArray(Object[] arr, Object val) {
		for (int i = 0; i < arr.length; i++) {
			arr[i] = val;
		}
	}

	private String expandURLTemplate(DataRequest req) {
		DataRequestDef dataQueryDef = req.getDataRequestDef();
		
		String template = GeoserverDataProvider.urlTemplate(dataQueryDef.getRequestType());
		
		double lon = req.getQueryPt().getLon();
		double lat = req.getQueryPt().getLat();
		
		double lonMin = lon - GeoserverDataProvider.QUERY_BUFFER_RADIUS_DEGREES;
		double lonMax = lon + GeoserverDataProvider.QUERY_BUFFER_RADIUS_DEGREES;
		double latMin = lat - GeoserverDataProvider.QUERY_BUFFER_RADIUS_DEGREES;
		double latMax = lat + GeoserverDataProvider.QUERY_BUFFER_RADIUS_DEGREES;

		UrlTemplate t = new UrlTemplate(template);
		
		t.setParam("HOST", provider.getHost());
		
		t.setParam("LYR", dataQueryDef.getDatasetName() );
		t.setParam("GEOM", dataQueryDef.getGeometryName() );
		t.setParam("PROP", dataQueryDef.getAttributeNameList() );
		
		t.setParam("LON", Double.valueOf(lon));
		t.setParam("LAT", Double.valueOf(lat));
		
		t.setParam("LONMIN", Double.valueOf(lonMin));
		t.setParam("LONMAX", Double.valueOf(lonMax));
		t.setParam("LATMIN", Double.valueOf(latMin));
		t.setParam("LATMAX", Double.valueOf(latMax));
		
		return t.getValue();
	}
	



}
