package ca.bc.gov.mof.wfpointid;

import static ca.bc.gov.mof.wfpointid.test.util.QueryResponseChecker.STRING;
import static org.mockito.Matchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import ca.bc.gov.mof.wfpointid.identify.IdentifyService;
import ca.bc.gov.mof.wfpointid.nearby.NearbyService;
import ca.bc.gov.mof.wfpointid.query.QueryResult;
import ca.bc.gov.mof.wfpointid.rest.model.GeographyResource;
import ca.bc.gov.mof.wfpointid.rest.model.OwnershipResource;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;

import ca.bc.gov.mof.wfpointid.rest.endpoint.PointIdEndpoints;
import ca.bc.gov.mof.wfpointid.test.util.Property;
import ca.bc.gov.mof.wfpointid.test.util.Query;
import ca.bc.gov.mof.wfpointid.test.util.QueryResponseChecker;

@RunWith(SpringRunner.class)
@WebMvcTest(PointIdEndpoints.class)
@WithMockUser(username="testuser", roles={"USER"})
public class PointIdOwnershipTester {
	
	private static final String RES_OWNERSHIP = "/ownership";

	@Autowired
	private MockMvc mockMvc;

	@MockBean
	private PointIdServiceParams pointIdServiceParams;

	@MockBean
	private ServiceContext serviceContext;

	@MockBean
	private NearbyService nearbyService;

	@MockBean
	private IdentifyService identifyService;

	@Before
	public void setUp() throws ServiceBusyException {
		when(serviceContext.getIdentifyService()).thenReturn(identifyService);

		// Default mock for testSchema and test1
		OwnershipResource defaultResource = new OwnershipResource();
		defaultResource.setFireCentre("Coastal Fire Centre");
		defaultResource.setFireZone("V6-South Island Fire Zone");
		defaultResource.setFireDept("Ladysmith FD");
		defaultResource.setResourceDistrict("South Island Natural Resource District");
		defaultResource.setRegionalDistrict("Cowichan Valley Regional District");
		defaultResource.setMunicipality("Town of Ladysmith");
		defaultResource.setPid("123456789");
		defaultResource.setOwnershipClass("PRIVATE");
		defaultResource.setProtectedLand("Sample Protected Land");
		defaultResource.setClientAssetAreaName("Sample Area");
		defaultResource.setClientAssetAreaType("Type A");
		defaultResource.setClientAssetAreaContact("Contact A");
		defaultResource.setClientAssetLineName("Line Name");
		defaultResource.setClientAssetLineType("Line Type");
		defaultResource.setClientAssetLineContact("Line Contact");
		defaultResource.setClientAssetPointName("Point Name");
		defaultResource.setClientAssetPointType("Point Type");
		defaultResource.setClientAssetPointContact("Point Contact");
		defaultResource.setTenureTFL("TFL 61");
		defaultResource.setTenureManagedForest("Managed Forest");
		defaultResource.setWatershed("Sample Watershed");
		defaultResource.setFnTitle("FN Title");
		defaultResource.setFnReserve("FN Reserve");

		// Default behavior will be used for testSchema and test1
		when(identifyService.queryOwnership(anyString(), anyString())).thenReturn(defaultResource);

		// FnTitle test
		OwnershipResource fnTitleResource = new OwnershipResource();
		fnTitleResource.setFireCentre("Cariboo Fire Centre");
		fnTitleResource.setFireZone("C5-Cariboo Chilcotin Fire Zone");
		fnTitleResource.setFireDept("");
		fnTitleResource.setResourceDistrict("Cariboo-Chilcotin Natural Resource District");
		fnTitleResource.setWatershed("NEMAIA COMMUNITY WATERSHED");
		fnTitleResource.setFnTitle("Tsilhqot'in Nation - Declared Title Area (also within TSA Zone D)");
		when(identifyService.queryOwnership("-124.0", "51.5")).thenReturn(fnTitleResource);

		// FnReserve test
		OwnershipResource fnReserveResource = new OwnershipResource();
		fnReserveResource.setFireDept("Duncan FD");
		fnReserveResource.setPid("");
		fnReserveResource.setOwnershipClass("CROWN FEDERAL");
		fnReserveResource.setClientAssetAreaName("");
		fnReserveResource.setClientAssetAreaType("");
		fnReserveResource.setClientAssetAreaContact("");
		fnReserveResource.setFnReserve("COWICHAN 1");
		when(identifyService.queryOwnership("-123.65", "48.77")).thenReturn(fnReserveResource);

		// ClientAssetArea test
		OwnershipResource clientAssetAreaResource = new OwnershipResource();
		clientAssetAreaResource.setResourceDistrict("South Island Natural Resource District");
		clientAssetAreaResource.setFireDept("");
		clientAssetAreaResource.setPid("");
		clientAssetAreaResource.setOwnershipClass("");
		clientAssetAreaResource.setClientAssetAreaName("Capital Regional District");
		clientAssetAreaResource.setClientAssetAreaType("Water Supply Area");
		clientAssetAreaResource.setClientAssetAreaContact("*");
		clientAssetAreaResource.setClientAssetLineName("");
		clientAssetAreaResource.setClientAssetLineType("");
		clientAssetAreaResource.setClientAssetLineContact("");
		clientAssetAreaResource.setClientAssetPointName("");
		clientAssetAreaResource.setClientAssetPointType("");
		clientAssetAreaResource.setClientAssetPointContact("");
		clientAssetAreaResource.setWatershed("SOOKE LAKE COMMUNITY WATERSHED");
		when(identifyService.queryOwnership("-123.7", "48.55")).thenReturn(clientAssetAreaResource);

		// ClientAssetLine test
		OwnershipResource clientAssetLineResource = new OwnershipResource();
		clientAssetLineResource.setResourceDistrict("South Island Natural Resource District");
		clientAssetLineResource.setClientAssetLineName("BC HYDRO");
		clientAssetLineResource.setClientAssetLineType("Transmission Line - 1L010");
		clientAssetLineResource.setClientAssetLineContact("*");
		when(identifyService.queryOwnership("-123.556", "48.591")).thenReturn(clientAssetLineResource);

		// ClientAssetPoint test
		OwnershipResource clientAssetPointResource = new OwnershipResource();
		clientAssetPointResource.setResourceDistrict("South Island Natural Resource District");
		clientAssetPointResource.setClientAssetPointName("BC HYDRO");
		clientAssetPointResource.setClientAssetPointType("Substation - CROFTON SUB");
		clientAssetPointResource.setClientAssetPointContact("*");
		when(identifyService.queryOwnership("-123.654", "48.874")).thenReturn(clientAssetPointResource);

		// Pid_PMBC test
		OwnershipResource pidPmbcResource = new OwnershipResource();
		pidPmbcResource.setResourceDistrict("South Island Natural Resource District");
		pidPmbcResource.setRegionalDistrict("Capital Regional District");
		pidPmbcResource.setMunicipality("Corporation of the City of Victoria");
		pidPmbcResource.setFireDept("Victoria FD");
		pidPmbcResource.setPid("29737478");
		pidPmbcResource.setOwnershipClass("PRIVATE");
		when(identifyService.queryOwnership("-123.37", "48.418")).thenReturn(pidPmbcResource);

		// Pid_ICF test
		OwnershipResource pidIcfResource = new OwnershipResource();
		pidIcfResource.setResourceDistrict("Chilliwack Natural Resource District");
		pidIcfResource.setRegionalDistrict("Metro Vancouver Regional District");
		pidIcfResource.setMunicipality("City of Vancouver");
		pidIcfResource.setPid("015979415");
		pidIcfResource.setOwnershipClass("CROWN MUNICIPAL");
		when(identifyService.queryOwnership("-123.107", "49.2317")).thenReturn(pidIcfResource);

		// TenureTFL test
		OwnershipResource tenureTflResource = new OwnershipResource();
		tenureTflResource.setResourceDistrict("South Island Natural Resource District");
		tenureTflResource.setTenureTFL("TFL 61 - Pacheedaht Anderson Timber Holdings Limited Partnership");
		when(identifyService.queryOwnership("-124.1", "48.5")).thenReturn(tenureTflResource);

		// TenureManagedForest_RETIRED test
		OwnershipResource tenureManagedForestRetiredResource = new OwnershipResource();
		tenureManagedForestRetiredResource.setTenureManagedForest("");
		when(identifyService.queryOwnership("-126.45", "53.9")).thenReturn(tenureManagedForestRetiredResource);

		// TenureManagedForest_WLot test
		OwnershipResource tenureManagedForestWLotResource = new OwnershipResource();
		tenureManagedForestWLotResource.setResourceDistrict("Campbell River Natural Resource District");
		tenureManagedForestWLotResource.setTenureManagedForest("W1969 1 SCHEDULE_B 00134749 WLot");
		when(identifyService.queryOwnership("-125.316", "50.228")).thenReturn(tenureManagedForestWLotResource);

		// TenureManagedForest_ComFor test
		OwnershipResource tenureManagedForestComForResource = new OwnershipResource();
		tenureManagedForestComForResource.setResourceDistrict("Sunshine Coast Natural Resource District");
		tenureManagedForestComForResource.setTenureManagedForest("K4G 6 SCHEDULE_B 00168229 ComFor");
		when(identifyService.queryOwnership("-125.026", "50.131")).thenReturn(tenureManagedForestComForResource);

		// ProtectedLand_NP test
		OwnershipResource protectedLandNpResource = new OwnershipResource();
		protectedLandNpResource.setProtectedLand("Southern Gulf Islands National Park Reserve of Canada");
		when(identifyService.queryOwnership("-123.373", "48.725")).thenReturn(protectedLandNpResource);

		// ProtectedLand_PAP test
		OwnershipResource protectedLandPapResource = new OwnershipResource();
		protectedLandPapResource.setProtectedLand("STRATHCONA PARK");
		when(identifyService.queryOwnership("-125.79", "49.54")).thenReturn(protectedLandPapResource);

		// ProtectedLand_CA test
		OwnershipResource protectedLandCaResource = new OwnershipResource();
		protectedLandCaResource.setProtectedLand("UPPER SOO CONSERVANCY");
		when(identifyService.queryOwnership("-123.22", "50.27")).thenReturn(protectedLandCaResource);

		// ProtectedLand_WMA test
		OwnershipResource protectedLandWmaResource = new OwnershipResource();
		protectedLandWmaResource.setProtectedLand("HAMLING LAKES WILDLIFE MANAGEMENT AREA");
		when(identifyService.queryOwnership("-117.51", "50.29")).thenReturn(protectedLandWmaResource);

		// ProtectedLand_WCL test
		OwnershipResource protectedLandWclResource = new OwnershipResource();
		protectedLandWclResource.setProtectedLand("Silverhope Creek (LEA)");
		when(identifyService.queryOwnership("-121.407", "49.305")).thenReturn(protectedLandWclResource);
	}

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
