package ca.bc.gov.nrs.wfnews.web.controller;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;
import java.util.zip.ZipException;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.io.IOUtils;
import org.apache.commons.io.output.ByteArrayOutputStream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import ca.bc.gov.webade.oauth2.rest.v1.token.client.impl.TokenServiceImpl;
import ca.bc.gov.webade.oauth2.rest.v1.token.client.resource.CheckedToken;
import ca.bc.gov.webade.rest.client.v1.impl.WebADEServiceImpl;
import ca.bc.gov.webade.rest.resource.v1.PreferenceResource;
import ca.bc.gov.webade.rest.resource.v1.PreferenceResources;
import ca.bc.gov.webade.rest.resource.v1.UserDetailsResource;

@Controller
@RequestMapping(value="/webade")
public class WebadeController {

	private static final Logger logger = LoggerFactory.getLogger(WebadeController.class);

	@Inject
	TokenServiceImpl tokenService;

	@Autowired
	private WebADEServiceImpl currentUserWebADEServiceImpl;

	private final static String PREF_SUBTYPE = "bootstrap-config";

	@RequestMapping(value="/userPrefs", method=RequestMethod.GET, headers="Accept=*/*")
	@ResponseBody
	protected PreferenceResources getUserPrefs(HttpServletRequest request, HttpServletResponse response) throws Exception {
		String authorizationHeader = request.getHeader("Authorization");
		try {
			if(authorizationHeader == null) {
				response.sendError(401);
			} else {
				CheckedToken result = tokenService.checkToken(authorizationHeader.replace("Bearer ", ""));
				if(result == null){
					response.sendError(401);
				}else{
					UserDetailsResource userDetails = currentUserWebADEServiceImpl.getCurrentUser();
					PreferenceResources prefs = currentUserWebADEServiceImpl.getUserPreferences(userDetails);
					for (PreferenceResource pref:prefs.getPreferences()) {
						String val = pref.getValue();
						String decompressedVal = WebadeController.fromBase64(val);
						pref.setValue(decompressedVal);
					}
					return prefs;
				}
			}
		} catch(Throwable t) {
			logger.error("getUserPrefs failed" , t);
			response.sendError(500, t.getMessage());
		}
		return null;
	}

	@RequestMapping(value="/userPrefs", method=RequestMethod.POST, headers="Accept=*/*")
	@ResponseBody
	protected PreferenceResource setUserPref(HttpServletRequest request, HttpServletResponse response, @RequestBody SearchAndConfigUserPreference prefPayload) throws Exception {
		String authorizationHeader = request.getHeader("Authorization");
		try {
			if(authorizationHeader == null) {
				response.sendError(401);
			} else {
				CheckedToken result = tokenService.checkToken(authorizationHeader.replace("Bearer ", ""));
				if(result == null){
					response.sendError(401);
				}else{
					UserDetailsResource userDetails = currentUserWebADEServiceImpl.getCurrentUser();
					PreferenceResources prefs = currentUserWebADEServiceImpl.getUserPreferences(userDetails);
					PreferenceResource existingPref = null;//check currentUserWebADEServiceImpl.getPreference(prefPayload);
					for(PreferenceResource pref:prefs.getPreferences()) {
						if (pref.getSubTypeCode().equals(PREF_SUBTYPE)
							&& pref.getApplicationCode().equals(prefPayload.getApplicationCode())
							&& pref.getSetName().equals(prefPayload.getComponentId())
							&& pref.getName().equals(prefPayload.getName())) {
							existingPref = pref;
						}
					}
					PreferenceResource newPref;
					if(existingPref != null){
						existingPref = currentUserWebADEServiceImpl.getPreference(existingPref);
						String val = prefPayload.getValue();
						String compressedVal = WebadeController.toBase64(val);
						existingPref.setValue(compressedVal);
						newPref = currentUserWebADEServiceImpl.updatePreference(existingPref);
					}else{
						PreferenceResource prefToAdd = new PreferenceResource();
						prefToAdd.setApplicationCode(prefPayload.getApplicationCode());
						prefToAdd.setTypeCode("USR");
						prefToAdd.setSubTypeCode(PREF_SUBTYPE);
						prefToAdd.setSetName(prefPayload.getComponentId());
						prefToAdd.setName(prefPayload.getName());
						prefToAdd.setDataTypeCode("STRING");
						prefToAdd.setSensitiveData(false);

						String val = prefPayload.getValue();
						String compressedVal = WebadeController.toBase64(val);

						prefToAdd.setValue(compressedVal);

						newPref = currentUserWebADEServiceImpl.addPreference(prefs, prefToAdd);
					}
					return newPref;
				}
			}
		} catch(Throwable t) {
			response.sendError(500, t.getMessage());
		}

		return null;
	}

	public void setCurrentUserWebADEServiceImpl(WebADEServiceImpl currentUserWebADEServiceImpl) {
		this.currentUserWebADEServiceImpl = currentUserWebADEServiceImpl;
	}

	public static byte[] compressString(String value)
		throws IOException {
		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		GZIPOutputStream gzipos = new GZIPOutputStream(baos);
		gzipos.write(value.getBytes("UTF-8"));
		
        try {
            if (gzipos != null) {
            	gzipos.close();
            }
        } catch (final IOException ioe) {
            // ignore
        }

		byte[] bytes = baos.toByteArray();
		return bytes;
	}

	public static String uncompressString(byte[] bytes)
		throws IOException {
		String result = null;
		ByteArrayInputStream bais = null;
		GZIPInputStream gzipis = null;

		try {

			bais = new ByteArrayInputStream(bytes);
			gzipis = new GZIPInputStream(bais);
			result = IOUtils.toString(gzipis, "UTF-8");

		}catch(ZipException ze){
			return null;
		} finally {
			
	        try {
	            if (gzipis != null) {
	            	gzipis.close();
	            }
	        } catch (final IOException ioe) {
	            // ignore
	        }
		}
		return result;
	}

	public static String toBase64(String value) throws IOException{
		if(value != null && value.length() > 1){
			byte[] compressedBytes = compressString(value);
			String val = new String(Base64.encodeBase64(compressedBytes));
			return val;
		}else{
			return value;
		}
	}

	public static String fromBase64(String value) throws IOException{
		if(value != null && value.length() > 1){
			byte[] valueBytes = value.getBytes("UTF-8");
			try{
				if(Base64.isArrayByteBase64(valueBytes)){
					byte[] decodedBytes = Base64.decodeBase64(valueBytes);

					String uncompressedValue = uncompressString(decodedBytes);
					if(uncompressedValue == null){
						return value;
					}
					return uncompressedValue;
				}else{
					return value;
				}
			}catch(ArrayIndexOutOfBoundsException oob){
				logger.error("error" , oob);
				return value;
			}
		}else{
			return value;
		}
	}

	public static void main(String[] args){
		String testString = "{\"version\":2,\"center\":[56.668302075770065,-126.58447265625001],\"zoom\":5,\"extent\":[[48.80686346108519,-142.77832031250003],[63.174193604205094,-110.39062500000001]],\"layers\":[{\"id\":\"incident\",\"visible\":true},{\"id\":\"rof\",\"visible\":false},{\"id\":\"incident-item\",\"visible\":false},{\"id\":\"rof-item\",\"visible\":false},{\"id\":\"nrof\",\"visible\":false},{\"id\":\"resources-track\",\"visible\":false},{\"id\":\"bc-vehicle-hq-systems\",\"visible\":false},{\"id\":\"bc-vehicle-hq-wx-techs\",\"visible\":false},{\"id\":\"bc-vehicle-hq-camp-co-ord\",\"visible\":false},{\"id\":\"bc-vehicle-kamloops-lillooet\",\"visible\":false},{\"id\":\"bc-vehicle-kamloops-merritt\",\"visible\":false},{\"id\":\"bc-vehicle-kamloops-penticton\",\"visible\":false},{\"id\":\"bc-vehicle-kamloops-clearwater\",\"visible\":false},{\"id\":\"bc-vehicle-kamloops-kamloops\",\"visible\":false},{\"id\":\"bc-vehicle-kamloops-vernon\",\"visible\":false},{\"id\":\"bc-vehicle-kamloops-salmon-arm\",\"visible\":false},{\"id\":\"bc-vehicle-coastal-south-island\",\"visible\":false},{\"id\":\"bc-vehicle-coastal-north-island\",\"visible\":false},{\"id\":\"bc-vehicle-coastal-fraser\",\"visible\":false},{\"id\":\"bc-vehicle-coastal-mid-island\",\"visible\":false},{\"id\":\"bc-vehicle-coastal-sunshine-coast\",\"visible\":false},{\"id\":\"bc-vehicle-coastal-pemberton\",\"visible\":false},{\"id\":\"bc-vehicle-south-east-arrow\",\"visible\":false},{\"id\":\"bc-vehicle-south-east-invermere\",\"visible\":false},{\"id\":\"bc-vehicle-south-east-cranbrook\",\"visible\":false},{\"id\":\"bc-vehicle-south-east-kootenay-lake\",\"visible\":false},{\"id\":\"bc-vehicle-south-east-boundary\",\"visible\":false},{\"id\":\"bc-vehicle-south-east-columbia\",\"visible\":false},{\"id\":\"bc-vehicle-prince-george-robson-valley\",\"visible\":false},{\"id\":\"bc-vehicle-prince-george-dawson-creek\",\"visible\":false},{\"id\":\"bc-vehicle-prince-george-fort-st-john\",\"visible\":false},{\"id\":\"bc-vehicle-prince-george-prince-george\",\"visible\":false},{\"id\":\"bc-vehicle-prince-george-mackenzie\",\"visible\":false},{\"id\":\"bc-vehicle-cariboo-cifac\",\"visible\":false},{\"id\":\"bc-vehicle-north-west-bulkley\",\"visible\":false},{\"id\":\"bc-other-resources-mrb\",\"visible\":false},{\"id\":\"bc-other-resources-tanker-truck\",\"visible\":false},{\"id\":\"bc-other-resources-fire-camp\",\"visible\":false},{\"id\":\"bc-other-resources-guam\",\"visible\":false},{\"id\":\"bc-other-resources-heart-beat\",\"visible\":false},{\"id\":\"bc-aircraft-rotary-wing-other\",\"visible\":false},{\"id\":\"bc-aircraft-rotary-wing-intermediate\",\"visible\":false},{\"id\":\"bc-aircraft-rotary-wing-medium\",\"visible\":false},{\"id\":\"bc-aircraft-rotary-wing-medium-prov\",\"visible\":false},{\"id\":\"bc-aircraft-rotary-wing-light\",\"visible\":false},{\"id\":\"bc-aircraft-rotary-wing-heavy\",\"visible\":false},{\"id\":\"bc-aircraft-rotary-wing-rap-attack\",\"visible\":false},{\"id\":\"bc-aircraft-fwt-patrol\",\"visible\":false},{\"id\":\"bc-aircraft-fwt-transport\",\"visible\":false},{\"id\":\"bc-aircraft-fwt-crew-transport\",\"visible\":false},{\"id\":\"bc-aircraft-fwb-tanker\",\"visible\":false},{\"id\":\"bc-aircraft-fwb-bird-dog\",\"visible\":false},{\"id\":\"bc-aircraft-fixed-wing-patrol\",\"visible\":false},{\"id\":\"bc-aircraft-fixed-wing-transport\",\"visible\":false},{\"id\":\"bc-aircraft-fixed-wing-tanker\",\"visible\":false},{\"id\":\"bc-aircraft-fixed-wing-bird-dog\",\"visible\":false},{\"id\":\"in-current-fire-polygons\",\"visible\":false},{\"id\":\"atr-active\",\"visible\":false},{\"id\":\"atr-complete\",\"visible\":false},{\"id\":\"htr-active\",\"visible\":false},{\"id\":\"htr-complete\",\"visible\":false},{\"id\":\"ofts-active\",\"visible\":false},{\"id\":\"ofts-expired\",\"visible\":false},{\"id\":\"ofts-invalid\",\"visible\":false},{\"id\":\"udo-staging-area\",\"visible\":false},{\"id\":\"udo-camp-complex\",\"visible\":false},{\"id\":\"udo-landmark\",\"visible\":false},{\"id\":\"whse-imagery-and-base-maps-mot-rest-areas-sp\",\"visible\":false},{\"id\":\"udo-fuel-cache\",\"visible\":false},{\"id\":\"udo-tool-cache\",\"visible\":false},{\"id\":\"udo-air-patrol-checkpoint\",\"visible\":false},{\"id\":\"udo-surface-patrol-checkpoint\",\"visible\":false},{\"id\":\"lightning\",\"visible\":false},{\"id\":\"sfms-temperature\",\"visible\":false},{\"id\":\"sfms-relative-humidity\",\"visible\":false},{\"id\":\"sfms-wind-speed\",\"visible\":false},{\"id\":\"sfms-wind-direction\",\"visible\":false},{\"id\":\"sfms-precipitation\",\"visible\":false},{\"id\":\"sfms-danger-rating\",\"visible\":false},{\"id\":\"sfms-fine-fuel-moisture-code\",\"visible\":false},{\"id\":\"sfms-duff-moisture-code\",\"visible\":false},{\"id\":\"sfms-drought-code\",\"visible\":false},{\"id\":\"sfms-initial-spread-index\",\"visible\":false},{\"id\":\"sfms-buildup-index\",\"visible\":false},{\"id\":\"sfms-fire-weather-index\",\"visible\":false},{\"id\":\"udo-hazard\",\"visible\":false},{\"id\":\"wf1-refuse-site\",\"visible\":false},{\"id\":\"whse-human-cultural-economic-emrg-order-and-alert-areas-sp\",\"visible\":false},{\"id\":\"udo-industrial-activity\",\"visible\":false},{\"id\":\"wf1-pipelines\",\"visible\":false},{\"id\":\"wf1-transmissionlines\",\"visible\":true},{\"id\":\"wf1-ci-flnro-radio-tower\",\"visible\":false},{\"id\":\"wf1-ci-other-radio-tower\",\"visible\":false},{\"id\":\"whse-imagery-and-base-maps-gsr-hospitals-svw\",\"visible\":false},{\"id\":\"wf1-aviation-airport\",\"visible\":false},{\"id\":\"wf1-aviation-airstrip\",\"visible\":false},{\"id\":\"wf1-aviation-hospital-heliport\",\"visible\":false},{\"id\":\"wf1-aviation-helipad-heliport\",\"visible\":false},{\"id\":\"wf1-aviation-seaplane\",\"visible\":false},{\"id\":\"fw-activereporting-wstn\",\"visible\":false},{\"id\":\"whse-imagery-and-base-maps-gsr-climate-stations-svw\",\"visible\":false},{\"id\":\"whse-water-management-wls-community-ws-pub-svw\",\"visible\":false},{\"id\":\"wf1-place-names\",\"visible\":false},{\"id\":\"wf1-terrain-names\",\"visible\":false},{\"id\":\"wf1-fire-centre-spg\",\"visible\":true},{\"id\":\"wf1-fire-zone-spg\",\"visible\":true},{\"id\":\"bndy-fire-departments\",\"visible\":true},{\"id\":\"whse-legal-admin-boundaries-abms-regional-districts-sp\",\"visible\":false},{\"id\":\"whse-legal-admin-boundaries-abms-municipalities-sp\",\"visible\":false},{\"id\":\"whse-admin-boundaries-adm-nr-areas-spg\",\"visible\":false},{\"id\":\"whse-admin-boundaries-adm-nr-districts-spg\",\"visible\":false},{\"id\":\"whse-admin-boundaries-adm-nr-regions-spg\",\"visible\":false},{\"id\":\"wf1-bndy-tfl\",\"visible\":false},{\"id\":\"reg-legal-and-admin-boundaries-rec-tenure-alpine-ski-areas-sp\",\"visible\":false},{\"id\":\"whse-forest-tenure-ften-recreation-poly-svw\",\"visible\":false},{\"id\":\"whse-forest-tenure-ften-managed-licence-poly-svw\",\"visible\":false},{\"id\":\"whse-legal-admin-boundaries-fnt-treaty-land-sp\",\"visible\":false},{\"id\":\"wf1-fn-title-area\",\"visible\":true},{\"id\":\"whse-admin-boundaries-clab-indian-reserves\",\"visible\":true},{\"id\":\"whse-admin-boundaries-clab-national-parks\",\"visible\":true},{\"id\":\"whse-tantalis-ta-park-ecores-pa-svw\",\"visible\":true},{\"id\":\"whse-tantalis-ta-wildlife-mgmt-areas-svw\",\"visible\":false},{\"id\":\"whse-tantalis-ta-conservancy-areas-svw\",\"visible\":false},{\"id\":\"whse-legal-admin-boundaries-wcl-conservation-lands-sp\",\"visible\":false},{\"id\":\"whse-legal-admin-boundaries-wcl-conservation-areas-ngo-sp\",\"visible\":false},{\"id\":\"wf1-cadastre\",\"visible\":false},{\"id\":\"wf1-forest-service-road\",\"visible\":false},{\"id\":\"wf1-roads\",\"visible\":true},{\"id\":\"whse-basemapping-gba-railway-tracks-sp\",\"visible\":true},{\"id\":\"wf1-trails\",\"visible\":false},{\"id\":\"whse-basemapping-fwa-stream-networks-sp\",\"visible\":true},{\"id\":\"whse-basemapping-fwa-lakes-poly\",\"visible\":false},{\"id\":\"whse-basemapping-nts-bc-contour-lines-125m\",\"visible\":false},{\"id\":\"whse-basemapping-trim-contour-lines\",\"visible\":false}],\"base\":\"EsriTopo\",\"tools\":{\"time\":{\"present\":\"PT24H/PRESENT\",\"mode\":\"present\"}}}";
		//String testString = "hello world";
		try{
            /*
            String compress = compressString(testString);
            System.out.println("compress: " + compress);
            String uncompress = uncompressString(compress);
            System.out.println("uncompress: " + uncompress);*/

            /*
            String b64_encoded = toBase64(testString);
            System.out.println("b64_encoded: " + b64_encoded);
            String b64_decoded = fromBase64(b64_encoded);
            System.out.println("b64_decoded: " + b64_decoded);
            */

			String encoded = toBase64(testString);
			String decoded = fromBase64(encoded);
			System.out.println(encoded);
			System.out.println(decoded);




		}catch(IOException ioe){
			ioe.printStackTrace();;
		}
	}
}
