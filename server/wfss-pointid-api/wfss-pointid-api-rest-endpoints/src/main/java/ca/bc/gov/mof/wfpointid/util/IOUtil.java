package ca.bc.gov.mof.wfpointid.util;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class IOUtil {
	
	private static Logger LOG = LoggerFactory.getLogger(IOUtil.class);

	public static String readAll(InputStream instr) throws IOException {
		LOG.debug(">readAll");
		String result;
		//LOG.info("instr: " + instr);
		// Get the response
		try (BufferedReader rd = new BufferedReader(new InputStreamReader(instr))) {
			
			StringBuilder all = new StringBuilder();
			String line = rd.readLine();
			//LOG.info("line: " + line);
			while (line != null) {
				all.append(line);
				line = rd.readLine();
			}
			
			result = all.toString();
			//LOG.info("result: " + result);
		}
		LOG.debug("<readAll");
		return result;
	}
}
