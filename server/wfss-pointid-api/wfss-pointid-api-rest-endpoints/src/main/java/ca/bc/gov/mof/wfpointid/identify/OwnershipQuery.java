package ca.bc.gov.mof.wfpointid.identify;

import static ca.bc.gov.mof.wfpointid.dataprovider.DataRequestDef.request;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.mof.wfpointid.dataprovider.DataItemDef;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequestDef;
import ca.bc.gov.mof.wfpointid.dataprovider.DataResult;
import ca.bc.gov.mof.wfpointid.dataprovider.geoserver.GeoserverDataProvider;
import ca.bc.gov.mof.wfpointid.query.QueryPt;
import ca.bc.gov.mof.wfpointid.query.QueryResult;
import ca.bc.gov.mof.wfpointid.rest.model.OwnershipResource;
import ca.bc.gov.mof.wfpointid.util.StringUtil;

public class OwnershipQuery extends IdentifyQuery {
	
	private static Logger LOG = LoggerFactory.getLogger(IdentifyQuery.class);
	
	private static final String[] TENURE_SKEY_WLOT = new String[] { "865", "866" };
	private static final String[] TENURE_SKEY_COMFOR = new String[] { "2399", "2400" };
	
	private static final String TAG_TENURE_MF_COMFOR = "ComFor";
	private static final String TAG_TENURE_MF_WLOT = "WLot";
	
	private static final String TENURE_STATUS_RETIRED = "RETIRED";
	private static final String OWNERSHIP_CLASS_PRIVATE = "PRIVATE";
	
	private static final String FMT_TENURE_TFL = "%s - %s";
	private static final String FMT_TENURE_MAN_FOR = "%s %s %s";
	
	public static DataRequestDef[] OWNERSHIP = new DataRequestDef[] {
		request(IdentifyService.PROVIDER_WF_GS, "WILDFIRE_ORG_UNIT_FIRE_ZONE", GEOMETRY, 20000, 
				new DataItemDef[] {
						DataItemDef.item("FIRE_CENTRE_NAME", 	    "CENTRE"),
						DataItemDef.item("FIRE_CENTRE_IDENTIFIER", 	"FIRE_CENTRE_IDENTIFIER"),
						DataItemDef.item("FIRE_ZONE_NAME", 			"ZONE"),
						DataItemDef.item("FIRE_ZONE_IDENTIFIER", 	"FIRE_ZONE_IDENTIFIER"),
						DataItemDef.item("CHARACTER_ALIAS", 		"CHARACTER_ALIAS"),
						DataItemDef.item("INTEGER_ALIAS", 		    "INTEGER_ALIAS")
					  }),

			
		request(IdentifyService.PROVIDER_WF_GS, "BNDY_FIRE_DEPARTMENTS", SHAPE, 20000, 
				DataItemDef.item(							"FIRE_DPT") ),	

		request(IdentifyService.PROVIDER_BCGW, "WHSE_ADMIN_BOUNDARIES.FADM_TFL_ALL_SP", SHAPE, 20000, 
				new DataItemDef[] {
						DataItemDef.item("FOREST_FILE_ID",		"TEN_TFL_NUM"), 
						DataItemDef.item( "LICENCEE",   "TEN_TFL_LICENCEE") 
					}),
	
	   request(IdentifyService.PROVIDER_WF_GS, "FN_TITLE_AREA", SHAPE, 20000, 	DataItemDef.item("CNSLTN_AREA_NAME", 		"FN_TITLE") ),
		
		request(IdentifyService.PROVIDER_WF_GS, "CLT_CLIENT_ASSETS_POLYGONS", SHAPE, 20000, 
			new DataItemDef[] {
				DataItemDef.item("CLIENT_NAME", 			"CLIENT_ASSET_AREA_NAME"), 
				DataItemDef.item("ASSET_TYPE", 				"CLIENT_ASSET_AREA_TYPE"), 
				DataItemDef.item("CONTACT_INFORMATION", 	"CLIENT_ASSET_AREA_CONTACT") 
			} ),	
		
		request(IdentifyService.PROVIDER_WF_GS, GeoserverDataProvider.TYPE_WFS_BUF, "CLT_CLIENT_ASSETS_LINES", SHAPE, 20000, 	
			new DataItemDef[] {
				DataItemDef.item("CLIENT_NAME", 		"CLIENT_ASSET_LINE_NAME"), 
				DataItemDef.item("ASSET_TYPE", 			"CLIENT_ASSET_LINE_TYPE"), 
				DataItemDef.item("CONTACT_INFORMATION", "CLIENT_ASSET_LINE_CONTACT") 
			} ),		
		
		request(IdentifyService.PROVIDER_WF_GS, GeoserverDataProvider.TYPE_WFS_BUF, "CLT_CLIENT_ASSETS_POINTS", SHAPE, 20000, 		
			new DataItemDef[] {
				DataItemDef.item("CLIENT_NAME", 			"CLIENT_ASSET_POINT_NAME"), 
				DataItemDef.item("ASSET_TYPE", 			"CLIENT_ASSET_POINT_TYPE"), 
				DataItemDef.item("CONTACT_INFORMATION", 	"CLIENT_ASSET_POINT_CONTACT") 
			} ),		
		
		request(IdentifyService.PROVIDER_BCGW, "WHSE_ADMIN_BOUNDARIES.ADM_NR_DISTRICTS_SPG", SHAPE, 20000, 
			DataItemDef.item("DISTRICT_NAME", 			"RESOURCE_DIST_NAME") ),
	
			request(IdentifyService.PROVIDER_BCGW, "WHSE_FOREST_TENURE.FTEN_MANAGED_LICENCE_POLY_SVW", GEOMETRY, 20000, 
			new DataItemDef[] {
				DataItemDef.item("FEATURE_CLASS_SKEY", 	"TEN_MANFOR_FEATURE_CLASS_SKEY"), 
				DataItemDef.item("MAP_LABEL", 			"TEN_MANFOR_LABEL"), 
				DataItemDef.item("CLIENT_NUMBER", 		"TEN_MANFOR_CLIENT_NUMBER"), 
				DataItemDef.item("LIFE_CYCLE_STATUS_CODE", "TEN_MANFOR_STATUS") 
			} ),		
	
		request(IdentifyService.PROVIDER_BCGW, "WHSE_CADASTRE.PMBC_PARCEL_FABRIC_POLY_FA_SVW", SHAPE, 20000, 
			new DataItemDef[] {
				DataItemDef.item("PID", 					"PF_PID"), 
				DataItemDef.item("OWNER_TYPE", 			    "PF_OWNER_TYPE") 
			} ),		
		
		request(IdentifyService.PROVIDER_BCGW, "WHSE_ADMIN_BOUNDARIES.CLAB_INDIAN_RESERVES", GEOMETRY, 20000, 
				DataItemDef.item("ENGLISH_NAME", 			"FN_RESERVE") ),	
	
				
		request(IdentifyService.PROVIDER_BCGW, "WHSE_LEGAL_ADMIN_BOUNDARIES.ABMS_MUNICIPALITIES_SP", SHAPE, 20000, 
				DataItemDef.item("ADMIN_AREA_NAME", 		"MUNI_NAME") ),		
		request(IdentifyService.PROVIDER_BCGW, "WHSE_LEGAL_ADMIN_BOUNDARIES.ABMS_REGIONAL_DISTRICTS_SP", SHAPE, 20000, 
				DataItemDef.item("ADMIN_AREA_NAME", 		"REGDIST_NAME") ),		
		request(IdentifyService.PROVIDER_BCGW, "WHSE_WATER_MANAGEMENT.WLS_COMMUNITY_WS_PUB_SVW", SHAPE, 20000, 
				DataItemDef.item("CW_NAME", 	"WS_NAME") ),		
	
		request(IdentifyService.PROVIDER_BCGW, "WHSE_ADMIN_BOUNDARIES.CLAB_NATIONAL_PARKS", GEOMETRY, 20000, 
				DataItemDef.item("ENGLISH_NAME", 					"PA_NP_NAME") ),		
		request(IdentifyService.PROVIDER_BCGW, "WHSE_TANTALIS.TA_PARK_ECORES_PA_SVW", SHAPE, 20000, 
				DataItemDef.item("PROTECTED_LANDS_NAME", 			"PA_PAP_NAME") ),		
		request(IdentifyService.PROVIDER_BCGW, "WHSE_TANTALIS.TA_CONSERVANCY_AREAS_SVW", SHAPE, 20000, 
				DataItemDef.item("CONSERVANCY_AREA_NAME", 		"PA_CA_NAME") ),		
		request(IdentifyService.PROVIDER_BCGW, "WHSE_TANTALIS.TA_WILDLIFE_MGMT_AREAS_SVW", SHAPE, 20000, 
				DataItemDef.item("WILDLIFE_MANAGEMENT_AREA_NAME", "PA_WMA_NAME") ),		
		request(IdentifyService.PROVIDER_BCGW, "WHSE_LEGAL_ADMIN_BOUNDARIES.WCL_CONSERVATION_LANDS_SP", GEOMETRY, 20000, 
				DataItemDef.item("SITE_NAME", 					"PA_WCL_NAME") ),		
		
	};

	
	public OwnershipQuery() {
		
	}


	public OwnershipResource createResource(QueryPt pt, QueryResult queryResult) {
		OwnershipResource result = new OwnershipResource();
		
		setMetadata(pt, queryResult, result);
		
		computeOwnershipCadastre( result, queryResult );
		result.setFireCentre(			(String) queryResult.getValue("CENTRE"));
		result.setFireCentreIdentifier( (String) queryResult.getValue("FIRE_CENTRE_IDENTIFIER"));
		result.setFireZoneCharacterAlias((String) queryResult.getValue("CHARACTER_ALIAS"));
		result.setFireZone(				((result.getFireZoneCharacterAlias()==null) ? "" : result.getFireZoneCharacterAlias()+"-")+((String) queryResult.getValue("ZONE"))  );
		result.setFireZoneIdentifier(   (String) queryResult.getValue("FIRE_ZONE_IDENTIFIER"));
		String integerAliasString = (String) queryResult.getValue("INTEGER_ALIAS");
		try {
			result.setFireZoneIntegerAlias( Integer.valueOf( integerAliasString) );
		} catch (NumberFormatException ex) {
			LOG.warn(String.format("Could not parse integer alias '%s' as integer", integerAliasString),ex);
		}

		result.setResourceDistrict(		(String) queryResult.getValue("RESOURCE_DIST_NAME"));
		result.setRegionalDistrict(		(String) queryResult.getValue("REGDIST_NAME"));
		result.setProtectedLand(		computeProtectedLandName(queryResult));
		result.setMunicipality(			(String) queryResult.getValue("MUNI_NAME"));
		
		result.setClientAssetAreaName(		(String) queryResult.getValue("CLIENT_ASSET_AREA_NAME"));
		result.setClientAssetAreaType(		(String) queryResult.getValue("CLIENT_ASSET_AREA_TYPE"));
		result.setClientAssetAreaContact(	(String) queryResult.getValue("CLIENT_ASSET_AREA_CONTACT"));
		result.setClientAssetLineName(		(String) queryResult.getValue("CLIENT_ASSET_LINE_NAME"));
		result.setClientAssetLineType(		(String) queryResult.getValue("CLIENT_ASSET_LINE_TYPE"));
		result.setClientAssetLineContact(	(String) queryResult.getValue("CLIENT_ASSET_LINE_CONTACT"));
		result.setClientAssetPointName(		(String) queryResult.getValue("CLIENT_ASSET_POINT_NAME"));
		result.setClientAssetPointType(		(String) queryResult.getValue("CLIENT_ASSET_POINT_TYPE"));
		result.setClientAssetPointContact(	(String) queryResult.getValue("CLIENT_ASSET_POINT_CONTACT"));

		result.setTenureTFL(			computeTenureTFL(queryResult) );
		result.setTenureManagedForest(	computeTenureManagedForest(queryResult) );
		result.setWatershed(			(String) queryResult.getValue("WS_NAME"));
		result.setFireDept(				(String) queryResult.getValue("FIRE_DPT"));
		result.setFnReserve(			(String) queryResult.getValue("FN_RESERVE"));
		result.setFnTitle(				(String) queryResult.getValue("FN_TITLE"));
				
		return result;
	}

	private static String computeProtectedLandName(QueryResult queryResult) {
		String pa_np = (String) queryResult.getValue("PA_NP_NAME");
		if (!DataResult.isValueEmpty(pa_np)) return pa_np;
		
		String pa_pap = (String) queryResult.getValue("PA_PAP_NAME");
		if (!DataResult.isValueEmpty(pa_pap)) return pa_pap;
		
		String pa_ca = (String) queryResult.getValue("PA_CA_NAME");
		if (!DataResult.isValueEmpty(pa_ca)) return pa_ca;
		
		String pa_wma = (String) queryResult.getValue("PA_WMA_NAME");
		if (!DataResult.isValueEmpty(pa_wma)) return pa_wma;
		
		String pa_wcl = (String) queryResult.getValue("PA_WCL_NAME");
		if (!DataResult.isValueEmpty(pa_wcl)) return pa_wcl;
		
		return DataResult.RESULT_VALUE_EMPTY;
	}

	private static String computeTenureManagedForest(QueryResult queryResult) {
		String status = (String) queryResult.getValue("TEN_MANFOR_STATUS");
		if (StringUtil.equalsIgnoreCase(status, TENURE_STATUS_RETIRED)) {
			return DataResult.RESULT_VALUE_EMPTY;
		}
		
		String skey = (String) queryResult.getValue("TEN_MANFOR_FEATURE_CLASS_SKEY");
		String label = (String) queryResult.getValue("TEN_MANFOR_LABEL");
		String clientNum = (String) queryResult.getValue("TEN_MANFOR_CLIENT_NUMBER");
		
		if (DataResult.isValueEmpty(skey)) return DataResult.RESULT_VALUE_EMPTY;
		
		String tag = null;
		if (StringUtil.equalsIgnoreCase(skey, TENURE_SKEY_WLOT) ) {
			tag = TAG_TENURE_MF_WLOT;
		}
		else if (StringUtil.equalsIgnoreCase(skey, TENURE_SKEY_COMFOR) ) {
			tag = TAG_TENURE_MF_COMFOR;
		}
		if (tag == null) return DataResult.RESULT_VALUE_EMPTY;
		
		return String.format(FMT_TENURE_MAN_FOR, label, clientNum, tag);
	}
	
	private static String computeTenureTFL(QueryResult queryResult) {
		
		String num = (String) queryResult.getValue("TEN_TFL_NUM");
		
		String licencee = StringUtil.toStringNoNull(queryResult.getValue("TEN_TFL_LICENCEE"));
		
		if (DataResult.isValueEmpty(num)) 
			return DataResult.RESULT_VALUE_EMPTY;
		
		return String.format(FMT_TENURE_TFL, num, licencee);
	}

	private static void computeOwnershipCadastre(OwnershipResource result, QueryResult queryResult) {
		
		result.setOwnershipClass(			(String) queryResult.getValue("PF_OWNER_TYPE"));
		result.setPid(						(String) queryResult.getValue("PF_PID"));			
		
	}
	

}
