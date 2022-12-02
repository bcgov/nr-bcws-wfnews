package ca.bc.gov.nrs.wfnews.api.rest.v1.jersey;

import java.io.IOException;
import java.io.OutputStream;
import java.util.zip.GZIPOutputStream;

public class ExtendedGZIPOutputStream extends GZIPOutputStream {
  
  public ExtendedGZIPOutputStream(OutputStream out) throws IOException {
    super(out);
  }

  public void setLevel(int level) {
      def.setLevel(level);
  }
}
