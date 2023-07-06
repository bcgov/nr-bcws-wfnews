package ca.bc.gov.mof.wfpointid.util;

import static org.junit.Assert.assertEquals;

import org.junit.Test;


public class GeoUtilTests {
	
	@Test
	public void  testCompassPoint() {
		
		checkCompassPoint(0, "N");
		checkCompassPoint(11, "N");
		checkCompassPoint(30, "NNE");
		checkCompassPoint(200, "SSW");
		checkCompassPoint(287, "WNW");
		checkCompassPoint(300, "WNW");
		checkCompassPoint(360, "N");
		
		checkCompassPoint(-100, "N");
		checkCompassPoint(30000, "N");
	}
	
	void  checkCompassPoint(double dir, String name) {
		assertEquals(GeoUtil.compassPoint(dir), name);
	}
}
