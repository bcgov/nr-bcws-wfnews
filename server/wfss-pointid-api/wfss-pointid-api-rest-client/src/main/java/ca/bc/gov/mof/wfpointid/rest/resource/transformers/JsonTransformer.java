package ca.bc.gov.mof.wfpointid.rest.resource.transformers;


import java.io.IOException;
import java.io.InputStream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;

public class JsonTransformer implements Transformer {

	private static final Logger logger = LoggerFactory
			.getLogger(JsonTransformer.class);

	private ObjectMapper mapper = new ObjectMapper();
	
	@Override
	public Object unmarshall(byte[] input, Class<?> clazz) throws TransformerException {
		Object result = null;
		long start = System.currentTimeMillis();
		try {
			result = mapper.readValue(input, clazz);
			
			if (logger.isDebugEnabled()) {
				// Pretty Print it
				marshall(result);
			}

		} catch (IOException e) {
			throw new TransformerException(e);
		}
		logger.info("Time taken for unmarshalling response from bytes to {} is {} ms", clazz.getName(), (System.currentTimeMillis() - start));
		return result;
	}
	
	@Override
	public Object unmarshall(String input, Class<?> clazz) throws TransformerException {
		Object result = null;
		long start = System.currentTimeMillis();
		try {
			
			result = mapper.readValue(input, clazz);
			
			if (logger.isDebugEnabled()) {
				// Pretty Print it
				marshall(result);
			}

		} catch (IOException e) {
			throw new TransformerException(e);
		}
		logger.info("Time taken for unmarshalling response from String to {} is {} ms", clazz.getName(), (System.currentTimeMillis() - start));
		return result;
	}

	@Override
	public Object unmarshall(InputStream input, Class<?> clazz) throws TransformerException {
		Object result = null;
		long start = System.currentTimeMillis();
		try {
			
			result = mapper.readValue(input, clazz);
			
			if (logger.isDebugEnabled()) {
				// Pretty Print it
				marshall(result);
			}

		} catch (IOException e) {
			throw new TransformerException(e);
		}
		logger.info("Time taken for unmarshalling response from stream to {} is {} ms", clazz.getName(), (System.currentTimeMillis() - start));
		return result;
	}

	@Override
	public String marshall(Object input) throws TransformerException {
		ObjectWriter prettyPrinter = mapper.writerWithDefaultPrettyPrinter();
		String result = null;
		try {
			
			result = prettyPrinter.writeValueAsString(input);
			
		} catch (IOException e) {
			throw new TransformerException(e);
		}

		return result;
	}

	@Override
	public String getFormat() {
		return "json";
	}

	@Override
	public String getContentType() {
		return "application/json";
	}

}
