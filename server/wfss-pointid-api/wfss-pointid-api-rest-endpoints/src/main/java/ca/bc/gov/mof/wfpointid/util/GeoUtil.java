package ca.bc.gov.mof.wfpointid.util;

public class GeoUtil {

	public static double[] parseLonLat(String lon, String lat) {
		double[] lonlat = new double[] { 0, 0 };

		lonlat[0] = Double.parseDouble(lon);
		lonlat[1] = Double.parseDouble(lat);

		return lonlat;
	}

	private static String[] COMPASS_POINT = {
		"N",		"NNE",		"NE",		"ENE",		
		"E",		"ESE",		"SE",		"SSE",		
		"S",		"SSW",		"SW",		"WSW",		
		"W",		"WNW",		"NW",		"NNW"
		};
	
	private static double[] COMPASS_DIR_BREAK = {
		11.25,		33.75,		56.25,		78.75,
		101.25,		123.75,		146.25,		168.75,
		191.25,		213.75,		236.25,		258.75,
		281.25,		303.75,		326.25,		348.75
	};
	
	public static String compassPoint(double degrees) {
		int compassPointIndex = 0;
		for (int i = 0; i < COMPASS_DIR_BREAK.length; i++) {
			
			if (degrees <=  COMPASS_DIR_BREAK[i]) {
				compassPointIndex = i;
				break;
			}
		}
		return COMPASS_POINT[compassPointIndex];
	}
}
