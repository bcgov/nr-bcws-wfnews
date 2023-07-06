package ca.bc.gov.mof.wfpointid.perf;

import java.io.IOException;
import java.net.URL;
import java.net.URLConnection;

import ca.bc.gov.mof.wfpointid.test.tasktester.Task;
import ca.bc.gov.mof.wfpointid.util.IOUtil;

public class PointIDTask extends Task {
	
	private String urlStr = "http://localhost:8080/v1/ownership?lat=49.6&lon=-125.7"; // middle of Strathcona Park
	
	private static int CONNECT_TIMEOUT = 10000;
	private static int READ_TIMEOUT = 30000;

	public void execute() throws IOException {
	    URL url;
	    URLConnection conn;
			url = new URL(urlStr);
			conn = url.openConnection();

	    conn.setConnectTimeout( CONNECT_TIMEOUT );
	    conn.setReadTimeout( READ_TIMEOUT );
	    conn.setDoOutput(true);

	    String response = IOUtil.readAll(conn.getInputStream());
	    System.out.println(response);
	}

}
