package ca.bc.gov.nrs.wfone.api.rest.v1.endpoints.impl;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import javax.ws.rs.core.Response;
import javax.xml.bind.DatatypeConverter;

import org.apache.commons.codec.binary.Base64;
import org.glassfish.jersey.media.multipart.FormDataBodyPart;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import ca.bc.gov.nrs.wfone.common.model.Message;
import ca.bc.gov.nrs.wfone.api.model.v1.PublicReportOfFire;
import ca.bc.gov.nrs.wfone.api.rest.client.v1.exception.ValidationException;
import ca.bc.gov.nrs.wfone.api.rest.v1.endpoints.RoFEndpoints;
import ca.bc.gov.nrs.wfone.common.rest.endpoints.BaseEndpointsImpl;
import ca.bc.gov.nrs.wfone.service.api.v1.RecordRoFService;
import ca.bc.gov.nrs.wfone.service.api.v1.validation.ModelValidator;
import ca.bc.gov.nrs.wfone.api.rest.v1.utils.SqlUtil;
import java.nio.charset.StandardCharsets;


public class RoFEndpointsImpl extends BaseEndpointsImpl implements RoFEndpoints{
    private static final Logger logger = LoggerFactory.getLogger(RoFEndpointsImpl.class);
    
    @Autowired
    private RecordRoFService recordRoFService;
    
    @Autowired
    private ModelValidator modelValidator;

   /**
     * Handle the submitted form. This method will
     * convert the form parts into byte arrays and push the document
     * blob into the database via the record service.
     * The response is a basic approval message
     */
    @Override
    public Response submitRoFForm(String document, FormDataBodyPart image1, FormDataBodyPart image2, FormDataBodyPart image3) throws ValidationException, Exception{
        logger.debug("<submitRoFForm");
        logger.info("ROF body: " + document);
        Response response = null;

        String[] sqlKeywords = SqlUtil.sqlKeywords;
        // Check if the document contains any SQL keyword
        for (String keyword : sqlKeywords) {
            if (document.contains(keyword)) {
                throw new ValidationException("Potential use of sql statement detected");
            }
        }
        if (document.contains("eval(")) {
          throw new ValidationException("Potential use of eval statement detected");
        }

        PublicReportOfFire prof  = convertToPublicReportOfFire(document);
        List<Message> errors = modelValidator.validatePublicReportOfFire(prof);
        if (!errors.isEmpty()) {
			    throw new ValidationException(errors);
		}

        logRequest();
        try {
            byte[] imageByteArray1 = new byte [0];
            byte[] imageByteArray2 = new byte [0];
            byte[] imageByteArray3 = new byte [0];
            
            if (document!=null){
                String jsonObj = new JSONObject(document).toString();
                logger.debug("jsonObj = " + jsonObj);
            }else logger.debug("document = null");

            if (image1 != null) {
              imageByteArray1 = imageToBytes(image1);
              checkForEvalStatement(imageByteArray1);
			      }
            if(image2!=null) {
              imageByteArray2 = imageToBytes(image2);
              checkForEvalStatement(imageByteArray2);
			      }
            if(image3!=null) {
              imageByteArray3 = imageToBytes(image3);
              checkForEvalStatement(imageByteArray3);
			      }

             recordRoFService.createRecord(document, imageByteArray1, imageByteArray2, imageByteArray3);

             response = Response.ok("{ \"message\": \"Report Of Fire Received\"}").build();
        } catch (Throwable t) {
            response = getInternalServerErrorResponse(t);
        }
        
        response.getHeaders().add("Access-Control-Allow-Origin", "*");
        response.getHeaders().add("Access-Control-Allow-Methods", "GET, OPTIONS, HEAD, PUT, POST");
        response.getHeaders().add("Access-Control-Allow-Headers","apikey");
        
        logger.debug("response = " + response); 
        
        logger.debug("<submitRoFForm");
        
        return response;
    }

    /**
     * Convert the supplied image stream into a byte array for storing in the 
     * database blob
     * @param image a FormDataBodyPart entity to convert to bytes
     * @return Bytes
     * @throws IOException
     */
    private static byte[] imageToBytes(FormDataBodyPart image) throws IOException {
      // fetch the entity
      InputStream imageStream = image.getEntityAs(InputStream.class);
      ByteArrayOutputStream buffer = new ByteArrayOutputStream();

      int nRead;
      byte[] data = null; 
      try {
        data = new byte[(int)image.getContentDisposition().getSize()];
      } catch(Exception e) { // ClassCastException
        data = new byte[134217728];
      }

      // convert to byte array
      while ((nRead = imageStream.read(data, 0, data.length)) != -1) {
        buffer.write(data, 0, nRead);
      }

      byte[] dataBytes = buffer.toByteArray();

      // test if this is a base64 string
      if (image.getMediaType().getType().equalsIgnoreCase("text")) {
        String decodedString = new String(dataBytes);
        String base64Image = decodedString.split(",")[1];
        // it's a text stream, convert to image and return
        Base64 decoder = new Base64();
        return decoder.decode(base64Image);
      } else {
        // Its a binary stream, return
        return dataBytes;
      }
    }
    
    private PublicReportOfFire convertToPublicReportOfFire(String document) {
    	PublicReportOfFire prof = new PublicReportOfFire();
    	JSONObject profJson = new JSONObject(document);
    	
    	prof.setFullName(profJson.optString("fullName"));
    	prof.setPhoneNumber(profJson.optString("phoneNumber"));
    	prof.setConsentToCall(profJson.optBoolean("consentToCall"));
    	prof.setEstimatedDistance(profJson.optInt("estimatedDistance"));
    	prof.setFireLocation(convertToDoubleArray(profJson.optJSONArray("fireLocation")));
    	prof.setFireSize(profJson.optString("fireSize"));
    	prof.setRateOfSpread(profJson.optString("rateOfSpread"));
    	prof.setBurning(convertToStringArray(profJson.optJSONArray("burning")));
    	prof.setSmokeColor(convertToStringArray(profJson.optJSONArray("smokeColor")));
    	prof.setWeather(convertToStringArray(profJson.optJSONArray("weather")));
    	prof.setAssetsAtRisk(convertToStringArray(profJson.optJSONArray("assetsAtRisk")));
    	prof.setSignsOfResponse(convertToStringArray(profJson.optJSONArray("signsOfResponse")));
    	prof.setOtherInfo(profJson.optString("otherInfo"));
    	prof.setSubmissionID(profJson.optString("submissionID"));
    	
    	return prof;
    }
    
    private String[] convertToStringArray(JSONArray array) {
        if(array==null)
            return null;

        String[] arr=new String[array.length()];
        for(int i=0; i<arr.length; i++) {
            arr[i]=array.optString(i);
        }
        return arr;
    }
    
    private double[] convertToDoubleArray(JSONArray array) {
        if(array==null)
            return null;

        double[] arr=new double[array.length()];
        for(int i=0; i<arr.length; i++) {
            arr[i]=array.optDouble(i);
        }
        return arr;
    }

    private void checkForEvalStatement(byte[] imageByteArray) throws ValidationException {
      if (imageByteArray != null) {
          String imageString = new String(imageByteArray, StandardCharsets.UTF_8);
          if (imageString.contains("eval(")) {
              throw new ValidationException("Potential use of eval statement detected");
          }
      }
  }
}
