package ca.bc.gov.mof.wfpointid;

import static ca.bc.gov.mof.wfpointid.test.util.QueryResponseChecker.STRING;

import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;

import ca.bc.gov.mof.wfpointid.rest.endpoint.PointIdEndpoints;
import ca.bc.gov.mof.wfpointid.test.util.Property;
import ca.bc.gov.mof.wfpointid.test.util.Query;
import ca.bc.gov.mof.wfpointid.test.util.QueryResponseChecker;

@RunWith(SpringRunner.class)
// @SpringBootTest(webEnvironment=WebEnvironment.RANDOM_PORT)
@WebMvcTest(PointIdEndpoints.class)
@Ignore("WFSS-370 Unit tests using SpringRunner fail due to missing CGLib class")
public class PointIdOwnershipTester {


	/*
	@Test
	public void contextLoads() {
	}
*/
	
	private static final String RES_OWNERSHIP = "v1/ownership";

	@Autowired
	private MockMvc mockMvc;

	static Property[] schema = Property.create(
			"fireCentre", 			STRING,
			"fireZone", 			STRING,
			"pid",					STRING,
			"ownershipClass",		STRING,
			"protectedLand", 		STRING,
			"municipality", 		STRING,
			"resourceDistrict", 	STRING,
			"regionalDistrict", 	STRING,
			"clientAssetAreaName",	STRING,
			"clientAssetAreaType",	STRING,
			"clientAssetAreaContact", STRING,
			"clientAssetLineName",	STRING,
			"clientAssetLineType",	STRING,
			"clientAssetLineContact",	STRING,
			"clientAssetPointName",	STRING,
			"clientAssetPointType",	STRING,
			"clientAssetPointContact",	STRING,
			"tenureTFL", 			STRING,
			"tenureManagedForest", 	STRING,
			"watershed", 			STRING,
			"fireDept", 			STRING,
			"fnTitle", 				STRING,
			"fnReserve", 			STRING
			);
	
	@Test
	public void testSchema() throws Exception {
		QueryResponseChecker.checkQuery(mockMvc, Query.query(RES_OWNERSHIP, -124, 49), schema);
	}

	@Test
	public void test1() throws Exception {
		QueryResponseChecker.checkQuery(mockMvc,  Query.query(RES_OWNERSHIP, -123.834, 49),
				"fireCentre", 		"Coastal Fire Centre",
				"fireZone", 		"V6-South Island Fire Zone",
				"fireDept", 		"Ladysmith FD",
				"resourceDistrict", "South Island Natural Resource District",
				"regionalDistrict", "Cowichan Valley Regional District",
				"municipality", 	"Town of Ladysmith"
		);
	}

	@Test
	public void testFnTitle() throws Exception {
		QueryResponseChecker.checkQuery(mockMvc,  Query.query(RES_OWNERSHIP, -124, 51.5),
				"fireCentre", 		"Cariboo Fire Centre",
				"fireZone", 		"C5-Cariboo Chilcotin Fire Zone",
				"fireDept", 		"",
				"resourceDistrict", "Cariboo-Chilcotin Natural Resource District",
				"watershed", 		"NEMAIA COMMUNITY WATERSHED",
				"fnTitle", 			"Tsilhqot'in Nation - Declared Title Area (also within TSA Zone D)"
		);
	}

	@Test
	public void testFnReserve() throws Exception {
		QueryResponseChecker.checkQuery(mockMvc,  Query.query(RES_OWNERSHIP, -123.65, 48.77),
				"fireDept", 			"Duncan FD",
				"pid",					"",
				"ownershipClass",		"CROWN FEDERAL",
				"clientAssetAreaName",	"",
				"clientAssetAreaType",	"",
				"clientAssetAreaContact",	"",
				"fnReserve", 			"COWICHAN 1"
		);
	}

	@Test
	public void testClientAssetArea() throws Exception {
		QueryResponseChecker.checkQuery(mockMvc,  Query.query(RES_OWNERSHIP, -123.7, 48.55),
				"resourceDistrict", 	"South Island Natural Resource District",
				"fireDept", 			"",
				"pid",					"",
				"ownershipClass",		"",
				"clientAssetAreaName",	"Capital Regional District",
				"clientAssetAreaType",	"Water Supply Area",
				"clientAssetAreaContact", "*",
				"clientAssetLineName",	"",
				"clientAssetLineType",	"",
				"clientAssetLineContact",	"",
				"clientAssetPointName",	"",
				"clientAssetPointType",	"",
				"clientAssetPointContact",	"",
				"watershed", 			"SOOKE LAKE COMMUNITY WATERSHED"
		);
	}

	@Test
	public void testClientAssetLine() throws Exception {
		QueryResponseChecker.checkQuery(mockMvc,  Query.query(RES_OWNERSHIP, -123.556, 48.591),
				"resourceDistrict", 	"South Island Natural Resource District",
				"clientAssetLineName",	"BC HYDRO",
				"clientAssetLineType",	"Transmission Line - 1L010",
				"clientAssetLineContact",	"*"
		);
	}

	@Test
	public void testClientAssetPoint() throws Exception {
		QueryResponseChecker.checkQuery(mockMvc,  Query.query(RES_OWNERSHIP, -123.654, 48.874),
				"resourceDistrict", 	"South Island Natural Resource District",
				"clientAssetPointName",	"BC HYDRO",
				"clientAssetPointType",	"Substation - CROFTON SUB",
				"clientAssetPointContact",	"*"
		);
	}

	@Test
	public void testPid_PMBC() throws Exception {
		QueryResponseChecker.checkQuery(mockMvc,  Query.query(RES_OWNERSHIP, -123.37, 48.418),
				"resourceDistrict", 	"South Island Natural Resource District",
				"regionalDistrict",		"Capital Regional District",
				"municipality",			"Corporation of the City of Victoria",
				"fireDept", 			"Victoria FD",
				"pid",					"29737478",
				"ownershipClass",		"PRIVATE"
		);
	}
	@Test
	public void testPid_ICF() throws Exception {
		QueryResponseChecker.checkQuery(mockMvc,  Query.query(RES_OWNERSHIP, -123.107, 49.2317),
				"resourceDistrict", 	"Chilliwack Natural Resource District",
				"regionalDistrict",		"Metro Vancouver Regional District",
				"municipality",			"City of Vancouver",
				"pid",					"015979415",
				"ownershipClass",		"CROWN MUNICIPAL"
		);
	}
	@Test
	public void testTenureTFL() throws Exception {
		QueryResponseChecker.checkQuery(mockMvc,  Query.query(RES_OWNERSHIP, -124.1, 48.5),
				"resourceDistrict", "South Island Natural Resource District",
				"tenureTFL",		"TFL 61 - Pacheedaht Anderson Timber Holdings Limited Partnership"
		);
	}

	@Test
	public void testTenureManagedForest_RETIRED() throws Exception {
		QueryResponseChecker.checkQuery(mockMvc, Query.query( RES_OWNERSHIP, -126.45, 53.9),
				"tenureManagedForest",	""
		);
	}


	@Test
	public void testTenureManagedForest_WLot() throws Exception {
		QueryResponseChecker.checkQuery(mockMvc,  Query.query(RES_OWNERSHIP, -125.316, 50.228),
				"resourceDistrict", 	"Campbell River Natural Resource District",
				"tenureManagedForest",	"W1969 1 SCHEDULE_B 00134749 WLot"
		);
	}

	@Test
	public void testTenureManagedForest_ComFor() throws Exception {
		QueryResponseChecker.checkQuery(mockMvc,  Query.query(RES_OWNERSHIP, -125.026, 50.131),
				"resourceDistrict", 	"Sunshine Coast Natural Resource District",
				"tenureManagedForest",	"K4G 6 SCHEDULE_B 00168229 ComFor"
		);
	}

	@Test
	public void testProtectedLand_NP() throws Exception {
		QueryResponseChecker.checkQuery(mockMvc,  Query.query(RES_OWNERSHIP, -123.373, 48.725),
				"protectedLand", 	"Southern Gulf Islands National Park Reserve of Canada"
		);
	}

	@Test
	public void testProtectedLand_PAP() throws Exception {
		QueryResponseChecker.checkQuery(mockMvc,  Query.query(RES_OWNERSHIP, -125.79, 49.54),
				"protectedLand", 	"STRATHCONA PARK"
		);
	}

	@Test
	public void testProtectedLand_CA() throws Exception {
		QueryResponseChecker.checkQuery(mockMvc,  Query.query(RES_OWNERSHIP, -123.22, 50.27),
				"protectedLand", 	"UPPER SOO CONSERVANCY"
		);
	}

	@Test
	public void testProtectedLand_WMA() throws Exception {
		QueryResponseChecker.checkQuery(mockMvc,  Query.query(RES_OWNERSHIP, -117.51, 50.29),
				"protectedLand", 	"HAMLING LAKES WILDLIFE MANAGEMENT AREA"
		);
	}

	@Test
	public void testProtectedLand_WCL() throws Exception {
		QueryResponseChecker.checkQuery(mockMvc,  Query.query(RES_OWNERSHIP, -121.407, 49.305),
				"protectedLand", 	"Silverhope Creek (LEA)"
		);
	}


}
