package ca.bc.gov.mof.wfpointid.identify;

import static ca.bc.gov.mof.wfpointid.dataprovider.DataItemDef.item;
import static ca.bc.gov.mof.wfpointid.dataprovider.DataRequestDef.request;

import ca.bc.gov.mof.wfpointid.dataprovider.DataRequestDef;
import ca.bc.gov.mof.wfpointid.dataprovider.geoserver.GeoserverDataProvider;
import ca.bc.gov.mof.wfpointid.query.QueryPt;
import ca.bc.gov.mof.wfpointid.query.QueryResult;
import ca.bc.gov.mof.wfpointid.rest.model.GeographyResource;
import ca.bc.gov.mof.wfpointid.rest.model.QueryResource;

/**
 * Internal configuration for Point ID geography endpoint.
 * 
 * <h1>Configuration</h1>
 * 
 * <h2>Adding a simple resource property</h2>
 * 
 * <ul>
 * <li>Add a {@link DataRquestDef#request} entry to the GEOGRAPHY object
 * <li>Add a field to the {@link GeographyResource} class, with setter
 * <li>Add line to the {@link #createResource} method to copy data to Resource object
 * </ul>
 * 
 * @author mbdavis
 *
 */
public class GeographyQuery extends IdentifyQuery {

	public static final String BEC_ZONE = "BEC_ZONE";
	public static final String VEG_LABEL = "VEG_LABEL";
	public static final String MAPSHEET = "MAPSHEET";
	public static final String FUEL_TYPE_CD = "FUEL_TYPE_CD";
	public static final String ELEVATION = "ELEVATION";
	public static final String SLOPE = "SLOPE";
	public static final String ASPECT = "ASPECT";
	
	public static DataRequestDef[] GEOGRAPHY = new DataRequestDef[] {
		
		request(IdentifyService.PROVIDER_WF_GS, GeoserverDataProvider.TYPE_WMS, "FM_FUEL_TYPE_BC", GEOMETRY, 10000, item("Fuel_Type_CD", 		FUEL_TYPE_CD)),
  
		request(IdentifyService.PROVIDER_WF_GS, GeoserverDataProvider.TYPE_WMS, "BC_DEM", null, 10000, 
				item("GRAY_INDEX", 			ELEVATION)),
		request(IdentifyService.PROVIDER_WF_GS, GeoserverDataProvider.TYPE_WMS, "BC_SLOPE", null, 10000, 
				item("GRAY_INDEX", 			SLOPE)),
		request(IdentifyService.PROVIDER_WF_GS, GeoserverDataProvider.TYPE_WMS, "BC_ASPECT", null, 10000, 
				item("GRAY_INDEX", 			ASPECT)),
					
		request(IdentifyService.PROVIDER_BCGW, "WHSE_BASEMAPPING.BCGS_20K_GRID", GEOMETRY, 10000, 
				item("MAP_TILE_DISPLAY_NAME", MAPSHEET) ),

		request(IdentifyService.PROVIDER_BCGW, "WHSE_FOREST_VEGETATION.VEG_COMP_LYR_R1_POLY", GEOMETRY, 10000, 
				item("FULL_LABEL", 			VEG_LABEL) ),

		request(IdentifyService.PROVIDER_BCGW, "WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_ZONE_2M_SPG", GEOMETRY, 10000, 
				item("ZONE_NAME", 			BEC_ZONE) )

	};	
	
	@Override
	public QueryResource createResource(QueryPt pt, QueryResult queryResult) {
		GeographyResource result = new GeographyResource();
		
		setMetadata(pt, queryResult, result);
		
		result.setFuelType(				(String) queryResult.getValue(FUEL_TYPE_CD));
		result.setElevation(			queryResult.getValueAsInteger(ELEVATION));
		result.setSlope(				queryResult.getValueAsInteger(SLOPE));
		result.setAspect(				queryResult.getValueAsInteger(ASPECT));
		result.setMapsheet(				(String) queryResult.getValue(MAPSHEET));
		result.setVegLabel(				(String) queryResult.getValue(VEG_LABEL));
		result.setBioGeoClimaticZone(	(String) queryResult.getValue(BEC_ZONE));

		return result;
	}

}
