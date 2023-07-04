package ca.bc.gov.nrs.wfnews.api.rest.v1.resource.transformers;

import java.io.IOException;
import java.io.StringWriter;

import org.codehaus.jackson.JsonGenerator;
import org.codehaus.jackson.JsonProcessingException;
import org.codehaus.jackson.map.JsonSerializer;
import org.codehaus.jackson.map.SerializerProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.io.geojson.GeoJsonWriter;

public class GeoJsonJacksonSerializer extends JsonSerializer<Geometry>
{

	private static final Logger logger = LoggerFactory.getLogger(GeoJsonJacksonSerializer.class);

	@Override
	public void serialize(Geometry geometry, JsonGenerator generator, SerializerProvider provider)
		throws IOException, JsonProcessingException
	{
		logger.trace("<serialize");

		try
		{

			GeoJsonWriter geoJsonWriter = new GeoJsonWriter();

			StringWriter writer = new StringWriter();

			geoJsonWriter.write(geometry, writer);

			String json = writer.toString();

			generator.writeRawValue(json);

		}
		catch (RuntimeException e)
		{
			logger.error("Failed to serialize Geometry: " + geometry, e);
		}

		logger.trace(">serialize");
	}

}