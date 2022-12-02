package ca.bc.gov.nrs.wfnews.api.rest.v1.jersey;

import java.io.IOException;
import java.io.OutputStream;
import java.util.zip.Deflater;

import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.ext.Provider;
import javax.ws.rs.ext.WriterInterceptor;
import javax.ws.rs.ext.WriterInterceptorContext;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Provider
@Compress
public class GZIPWriterInterceptor implements WriterInterceptor {
    private static final Logger logger = LoggerFactory.getLogger(GZIPWriterInterceptor.class);
    public static final String CONTENT_ENCODING = "Content-Encoding";
    public static final String GZIP = "gzip";

    @Override
    public void aroundWriteTo(WriterInterceptorContext context) throws IOException, WebApplicationException {
        logger.debug(" ### Intercepting write stream for compression");
        MultivaluedMap<String, Object> headers = context.getHeaders();
        headers.add(CONTENT_ENCODING, GZIP);

        final OutputStream outputStream = context.getOutputStream();

        ExtendedGZIPOutputStream gzipStream = new ExtendedGZIPOutputStream(outputStream);
        gzipStream.setLevel(Deflater.BEST_COMPRESSION);
        context.setOutputStream(gzipStream);
        context.proceed();
        logger.debug(" ### Completed compressing response");
    }
}