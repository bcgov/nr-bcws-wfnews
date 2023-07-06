package ca.bc.gov.mof.wfpointid.util;

import java.text.DecimalFormat;

public class DistanceCalculator {
	
	private static DecimalFormat df2 = new DecimalFormat("#.##");
	
	public static String distance(double lat1, double lat2, double lon1,
	        double lon2) {

		
	    final int R = 6371; // Radius of the earth

	    double latDistance = Math.toRadians(lat2 - lat1);
	    double lonDistance = Math.toRadians(lon2 - lon1);
	    double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
	            + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
	            * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
	    double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	    double distance = R * c; 

	    distance = Math.pow(distance, 2) + Math.pow(0.0, 2);
	    
	    //returns distance in KM
	    String distanceResult = df2.format(Math.sqrt(distance));
	    
	    return distanceResult;
	}

}
