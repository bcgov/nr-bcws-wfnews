package ca.bc.gov.nrs.wfone.service.api.v1.impl;

import java.io.BufferedInputStream;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.net.URLConnection;
import java.time.Clock;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.Properties;
import java.util.UUID;

import javax.mail.MessagingException;

import org.apache.commons.io.IOUtils;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.annotation.JsonTypeInfo.As;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.DefaultTransactionDefinition;

import com.drew.imaging.ImageMetadataReader;
import com.drew.imaging.ImageProcessingException;
import com.drew.lang.GeoLocation;
import com.drew.lang.Rational;
import com.drew.metadata.Metadata;
import com.drew.metadata.MetadataException;
import com.drew.metadata.exif.GpsDirectory;
import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.GeometryFactory;

import ca.bc.gov.nrs.common.wfone.rest.resource.CodeTableListRsrc;
import ca.bc.gov.nrs.common.wfone.rest.resource.CodeTableRsrc;
import ca.bc.gov.nrs.common.wfone.rest.resource.CodeRsrc;

import ca.bc.gov.nrs.wfdm.api.rest.client.FileService;
import ca.bc.gov.nrs.wfdm.api.rest.client.FileServiceException;
import ca.bc.gov.nrs.wfdm.api.rest.client.ValidationException;
import ca.bc.gov.nrs.wfdm.api.rest.resource.FileDetailsRsrc;
import ca.bc.gov.nrs.wfdm.api.rest.resource.FileMetadataRsrc;
import ca.bc.gov.nrs.wfim.api.rest.v1.resource.AttachmentResource;
import ca.bc.gov.nrs.wfim.api.rest.v1.resource.ForestFuelResource;
import ca.bc.gov.nrs.wfim.api.rest.v1.resource.PublicReportOfFireResource;
import ca.bc.gov.nrs.wfim.api.rest.v1.resource.WildfirePartyResource;
import ca.bc.gov.nrs.wfone.api.model.v1.RoFEntryForm;
import ca.bc.gov.nrs.wfone.common.persistence.dao.DaoException;
import ca.bc.gov.nrs.wfone.common.rest.client.MultipartData;
import ca.bc.gov.nrs.wfone.common.service.api.model.factory.FactoryContext;
import ca.bc.gov.nrs.wfone.persistence.v1.dao.RoFFormDao;
import ca.bc.gov.nrs.wfone.persistence.v1.dao.RoFImageDao;
import ca.bc.gov.nrs.wfone.persistence.v1.dto.RoFFormDto;
import ca.bc.gov.nrs.wfone.persistence.v1.dto.RoFImageDto;
import ca.bc.gov.nrs.wfone.service.api.model.RoFRetryInfo;
import ca.bc.gov.nrs.wfone.service.api.v1.EmailNotificationService;
import ca.bc.gov.nrs.wfone.service.api.v1.RecordRoFService;
import ca.bc.gov.nrs.wfone.service.api.v1.RecordServiceConstants;
import ca.bc.gov.nrs.wfone.service.api.v1.spring.ServiceApiSpringConfig;
import kong.unirest.HttpResponse;
import kong.unirest.JsonNode;
import kong.unirest.Unirest;

/**
 * Service implementation used for writing submitted RoF forms stored in
 * postgres into the WFIM Service
 */
public class RecordRoFServiceImpl implements RecordRoFService {
	private static final Logger logger = LoggerFactory.getLogger(RecordRoFServiceImpl.class);

	private static final long DEGRADED_NOTIFICATION_INTERVAL = 15; // Minutes between notifications that there are stuck RoFs.

	@Value("${WEBADE_OAUTH2_CLIENT_ID}")
	private String webadeOauth2ClientId;

	@Value("${WEBADE_OAUTH2_REST_CLIENT_SECRET}")
	private String webadeOauth2ClientSecret;

	@Value("${WEBADE_OAUTH2_TOKEN_CLIENT_URL}")
	private String webadeOauth2ClientUrl;

	@Value("${WFIM_REST_URL}")
	private String wfimClientUrl;

	@Value("${WFIM_CODE_TABLES_URL}")
	private String wfimCodeTablesUrl;

	private final int MAX_RETRIES = 11; // Stop trying to submit an RoF after this many failures
	private final int NOTIFY_RETRY = 2; // Notify that an RoF is stuck after this many attempts

	@Autowired
	PlatformTransactionManager transactionManager;

	@Autowired
	EmailNotificationService emailNotificationService;

	private Date codeTableRefresh;
	private String visibleFlameString = "Visible Flames = Yes; ";
	private String noVisibleFlameString = "Visible Flames = No; ";
	private String noCommentVisibleFlameString = "Visible Flames = N/C; ";
	private String noCommentString = "No comments";

	private Properties applicationProperties;
	private RoFFormDao rofFormDao;
	private RoFImageDao rofImageDao;
	private FileService fileService;
	private CodeTableListRsrc codeTables;
	
	// Time since degredation was detected, or a notification was last sent
	Optional<LocalDateTime> stuckSince = Optional.empty();
	String lastError = "No Errors yet.  This message should not appear in an email so report it if it does.";

	/**
	 * Helper method for loading and initializing code tables from WFIM
	 */
	private void loadCodeTables() {
		try {
			HttpResponse<JsonNode> tokenResponse = Unirest.get(webadeOauth2ClientUrl)
					.header("Authorization",
							"Basic " + Base64.getEncoder().encodeToString((webadeOauth2ClientId + ":" + webadeOauth2ClientSecret).getBytes()))
					.header("Content-Type", "application/json").asJson();
			JsonNode tokenBody = tokenResponse.getBody();
			String token = tokenBody.getObject().getString("access_token");

			HttpResponse<String> codeResponse = Unirest.get(wfimCodeTablesUrl)
					.header("Authorization", "Bearer " + token).header("Content-Type", "application/json").asString();

			ObjectMapper mapper = new ObjectMapper();
			codeTables = mapper.readValue(codeResponse.getBody(), CodeTableListRsrc.class);
		} catch (Exception e) {
			logger.error("Failed to load code tables for WFIM", e);
		}
	}

	public FileService getFileService() {
		return this.fileService;
	}

	public void setFileService(FileService fileService) {
		this.fileService = fileService;
	}

	public RoFFormDao getRoFFormDao() {
		return this.rofFormDao;
	}

	public void setRoFFormDao(RoFFormDao roFFormDao) {
		this.rofFormDao = roFFormDao;
	}

	public RoFImageDao getRofImageDao() {
		return this.rofImageDao;
	}

	public void setRofImageDao(RoFImageDao rofImageDao) {
		this.rofImageDao = rofImageDao;
	}

	public ServiceApiSpringConfig getServiceApiSpringConfig() {
		return this.serviceApiSpringConfig;
	}

	public void setServiceApiSpringConfig(ServiceApiSpringConfig serviceApiSpringConfig) {
		this.serviceApiSpringConfig = serviceApiSpringConfig;
	}

	@Autowired
	ServiceApiSpringConfig serviceApiSpringConfig;

	Clock clock = Clock.systemDefaultZone();

	public RoFFormDao getRofFormDao() {
		return this.rofFormDao;
	}

	public void setRofFormDao(RoFFormDao rofFormDao) {
		this.rofFormDao = rofFormDao;
	}

	public Properties getApplicationProperties() {
		return this.applicationProperties;
	}

	public void setApplicationProperties(Properties applicationProperties) {
		this.applicationProperties = applicationProperties;
	}

	/**
	 * Creates a record in the Postgres database containing the form as a blob and
	 * provided image streams
	 */
	public void createRecord(String rofFormData, byte[] image1, byte[] image2, byte[] image3) throws Exception {
		ObjectMapper mapper = new ObjectMapper();

		String reportOfFireCacheGuid = UUID.randomUUID().toString();
		
		if(checkAlreadySubmitted(rofFormData)) return; 
		
		insertRoFCache(reportOfFireCacheGuid, rofFormData);

		List<byte[]> imageList = new ArrayList<byte[]>();
		imageList.add(image1);
		imageList.add(image2);
		imageList.add(image3);
		for (byte[] image : imageList) {
			if (image.length != 0) {
				insertRoFAttachmentCache(reportOfFireCacheGuid, image);
			}
		}

		// update RoF to QUEUED
		RoFFormDto form = getRofFormDao().fetch(reportOfFireCacheGuid);
		RoFEntryForm updateForm = mapper.readValue(form.getReportOfFire(), RoFEntryForm.class);
		updateForm.setSubmissionStatus(RecordServiceConstants.QUEUED_STATUS);

		form.setReportOfFire(mapper.writeValueAsString(updateForm));
		getRofFormDao().update(form);
	}
	
	private boolean checkAlreadySubmitted(String reportOfFire) throws DaoException {
		boolean alreadySubmitted = false;
		
		// reject if there is a duplicate record in the cache already
		List<RoFFormDto> cachedRofs = getRofFormDao().select();
		
		if (cachedRofs != null) {
			for(RoFFormDto rof: cachedRofs) {
				String RoF = rof.getReportOfFire();
				
				if (RoF != null && RoF.contains("submissionID") 
						&& reportOfFire != null && reportOfFire.contains("submissionID")) {
					JSONObject rofJson = new JSONObject(RoF);
			    	String formString = rofJson.optString("form");
			    	JSONObject formJson = new JSONObject(formString);
			    	JSONObject newRofJson = new JSONObject(reportOfFire);
			    		
			    	if(formJson != null && newRofJson != null) {
			    		String submissionID = formJson.optString("submissionID");
				    	String newSubmissionID = newRofJson.optString("submissionID");
				    	if (submissionID != null && newSubmissionID != null && submissionID.equals(newSubmissionID)) {
				    		return true;
				    	}
			    	}
				}
			}	
		}
		
		return alreadySubmitted;
		
	}

	private void insertRoFCache(String reportOfFireCacheGuid, String reportOfFire)
			throws JsonParseException, JsonMappingException, IOException, DaoException {
		RecordRoFService recordRoFService = serviceApiSpringConfig.recordRoFService();
		ObjectMapper mapper = new ObjectMapper();
		rofFormDao = recordRoFService.getRofFormDao();

		LocalDateTime submittedTimestamp = LocalDateTime.now(clock);

		RoFFormDto rofFormDto = new RoFFormDto();
		rofFormDto.setReportOfFireCacheGuid(reportOfFireCacheGuid);
		RoFEntryForm newForm = new RoFEntryForm();
		newForm.setSubmissionStatus(RecordServiceConstants.WRITING_STATUS);
		newForm.setRetries(0);
		newForm.setForm(reportOfFire);

		rofFormDto.setReportOfFire(mapper.writeValueAsString(newForm));
		rofFormDto.setSubmittedTimestamp(submittedTimestamp);

		this.rofFormDao.insert(rofFormDto);
	}

	private void insertRoFAttachmentCache(String reportOfFireCacheGuid, byte[] imageList) {
		RecordRoFService recordRoFService = serviceApiSpringConfig.recordRoFService();
		rofImageDao = recordRoFService.getRofImageDao();
		String reportOfFireAttachmentCacheGuid = UUID.randomUUID().toString();

		RoFImageDto rofImageDto = new RoFImageDto();
		rofImageDto.setReportOfFireAttachmentCacheGuid(reportOfFireAttachmentCacheGuid);
		rofImageDto.setReportOfFireCacheGuid(reportOfFireCacheGuid);
		rofImageDto.setAttachment(imageList);

		try {
			this.rofImageDao.insert(rofImageDto);
		} catch (DaoException eDaoException) {
			logger.error(eDaoException.toString());
		}
	}

	/**
	 * Helper method for posting the RoF form blob to WFIM This method will validate
	 * and update code table values and inject provided attributes from the form
	 * Attachments will be created from inserted WFDM records
	 * 
	 * @param rofFormDataJson the JSONObject RoF Form
	 * @param attachmentList  WFDM Attachment documents
	 * @param token           token used for API requests
	 * @return The completed RoF, or Null if errors occured
	 * @throws Exception
	 */
	private PublicReportOfFireResource postToInicidentManager(JSONObject rofFormDataJson,
			List<FileDetailsRsrc> attachmentList, String token) throws Exception {
		logger.info("Starting submit to WFIM");
		// Magic number 86400000 represents 1 day in milliseconds
		// we want to force the code tables to refresh every day
		if (codeTables == null || codeTableRefresh == null
				|| (codeTableRefresh != null && codeTableRefresh.getTime() + 86400000 < new Date().getTime())) {
			logger.debug("Refreshing code tables...");
			loadCodeTables();
			codeTableRefresh = new Date();
		}

		logger.debug("Mapping submitted RoF form to PublicReportOfFireResource");
		ObjectMapper mapper = new ObjectMapper();

		String wfimUrl = wfimClientUrl;
		String rofEndpoint = wfimUrl + "publicReportOfFires";

		String serializedRof = prepareRoF(rofFormDataJson, mapper);
		logger.info("Posting serialized ROF to WFIM: " + serializedRof);
		
		Date postDate = new Date();
		HttpResponse<String> response = Unirest.post(rofEndpoint).header("Authorization", "Bearer " + token)
				.header("Content-Type", "application/json").header("Accept", "*/*").body(serializedRof).asString();
		Boolean result = response.getStatus() == 201;
		logger.info(" ### END POST - RoF POST completed with a {} response. Completed in {} seconds.",
				response.getStatus(), ((new Date().getTime() - postDate.getTime()) / 1000));
		if (result.booleanValue()) {
			PublicReportOfFireResource createdRof = mapper.readValue(response.getBody(),
					PublicReportOfFireResource.class);

			try {
				if (result.booleanValue() && attachmentList != null && !attachmentList.isEmpty()) {
					String attchEndpoint = wfimUrl + "publicReportOfFires/" + createdRof.getWildfireYear() + "/"
							+ createdRof.getReportOfFireNumber() + "/attachments";

					// push in the attachments
					logger.info("Creating attachments... {} attachments to process.", attachmentList.size());
					int count = 1;
					for (FileDetailsRsrc fileDetailsRsrc : attachmentList) {
						Date attachDate = new Date();
						logger.debug("Processing Attachment {} for RoF {}", "img" + count,
								createdRof.getReportOfFireNumber());
						AttachmentResource attachment = new AttachmentResource();

						attachment.setArchived(false);
						attachment.setAttachmentDescription("Report of Fire Image");
						attachment.setAttachmentTypeCode("ROF");
						attachment.setCreatedTimestamp(new Date());
						attachment.setFileIdentifier(fileDetailsRsrc.getFileId());
						attachment.setFileName(fileDetailsRsrc.getFilePath());
						attachment.setMimeType(fileDetailsRsrc.getMimeType());
						attachment.setPrivateIndicator(false);
						attachment.setSourceObjectNameCode("ROF");
						attachment.setUploadedBy(fileDetailsRsrc.getUploadedBy());
						attachment.setUploadedTimestamp(new Date());

						for (FileMetadataRsrc metadata : fileDetailsRsrc.getMetadata()) {
							if (metadata.getMetadataName().equalsIgnoreCase("Latitude")) {
								attachment.setLatitude(Double.parseDouble(metadata.getMetadataValue()));
							}
							if (metadata.getMetadataName().equalsIgnoreCase("Longitude")) {
								attachment.setLongitude(Double.parseDouble(metadata.getMetadataValue()));
							}
							if (metadata.getMetadataName().equalsIgnoreCase("Altitude")) {
								attachment.setElevation(Double.parseDouble(metadata.getMetadataValue()));
							}
							if (metadata.getMetadataName().equalsIgnoreCase("Bearing")) {
								attachment.setAzimuth(Double.parseDouble(metadata.getMetadataValue()));
							}
						}

						// get GPS coordinates from RoF payload if not present in metadata
						if (rofFormDataJson.has("attachments") && (rofFormDataJson.getJSONArray("attachments") != null)
								&& rofFormDataJson.getJSONArray("attachments").length() > 0) {
							JSONObject[] attachmentArray = new JSONObject[rofFormDataJson.getJSONArray("attachments")
									.length()];

							for (int i = 0; i < rofFormDataJson.getJSONArray("attachments").length(); i++) {
								attachmentArray[i] = rofFormDataJson.getJSONArray("attachments").getJSONObject(i);
							}

							if (attachment.getLatitude() == null && attachmentArray[count - 1] != null
									&& attachmentArray[count - 1].get("latitude") != null) {
								attachment
										.setLatitude(convertObjectToDouble(attachmentArray[count - 1].get("latitude")));
							}

							if (attachment.getLongitude() == null && attachmentArray[count - 1] != null
									&& attachmentArray[count - 1].get("longitude") != null) {
								attachment.setLongitude(
										convertObjectToDouble(attachmentArray[count - 1].get("longitude")));
							}

							if (attachment.getElevation() == null && attachmentArray[count - 1] != null
									&& attachmentArray[count - 1].get("elevation") != null) {
								attachment.setElevation(
										convertObjectToDouble(attachmentArray[count - 1].get("elevation")));
							}

							if (attachment.getAzimuth() == null && attachmentArray[count - 1] != null
									&& attachmentArray[count - 1].get("heading") != null) {
								attachment.setAzimuth(convertObjectToDouble(attachmentArray[count - 1].get("heading")));
							}
						}

						logger.info(" ### START POST ATTACHMENT - Serializing and executing Attachment POST...");
						String serializedAttachment = mapper.writeValueAsString(attachment);
						// Strip out null meta, which can cause errors when posting to WFIM as of v1.6.1
						serializedAttachment = sanitizeAttachmentString(serializedAttachment);
						// TODO: remove the above code after fix applied in WFIM
						HttpResponse<String> attchResponse = Unirest.post(attchEndpoint)
								.header("Authorization", "Bearer " + token).header("Content-Type", "application/json")
								.header("Accept", "*").body(serializedAttachment).asString();
						logger.info(
								" ### END POST ATTACHMENT - Attachment POST completed in {} seconds, response was: {}",
								((new Date().getTime() - attachDate.getTime()) / 1000), attchResponse.getStatus());
						if (attchResponse.getStatus() != 201) {
							logger.error("Exception occured while posting attachment to WFIM: \n{}",
									attchResponse.getBody());
						}
						count++;
					}
				}
			} catch (Exception e) {
				logger.error("Error adding attachments for RoF {}, error was: {}", createdRof.getReportOfFireNumber(),
						e.getLocalizedMessage(), e);
			}
			return createdRof;
		} else {
			throw new Exception("Failed to post RoF to WFIM. Response: " + response.getStatus());
		}
	}

	private String prepareRoF(JSONObject rofFormDataJson, ObjectMapper mapper)
			throws Exception, JsonProcessingException {
		PublicReportOfFireResource rof = new PublicReportOfFireResource();

		List<CodeTableRsrc> codeTableList = codeTables.getCodeTableList();
		List<String> codeTableNames = new ArrayList<String>();
		for (CodeTableRsrc codeTable : codeTableList) {
			codeTableNames.add(codeTable.getCodeTableName());
		}

		if (!codeTableNames.containsAll(Arrays.asList(RecordServiceConstants.FIRE_SIZE_CODE_TABLE,
				RecordServiceConstants.RATE_OF_SPREAD_CODE_TABLE, RecordServiceConstants.SMOKE_COLOUR_CODE_TABLE,
				RecordServiceConstants.BURNING_CODE_TABLE)))
			throw new Exception("Exception finding Report of Fire code tables");

		for (CodeTableRsrc codeTable : codeTableList) {
			if (codeTable.getCodeTableName().equalsIgnoreCase(RecordServiceConstants.FIRE_SIZE_CODE_TABLE)) {
				List<CodeRsrc> fireSizeCodes = codeTable.getCodes();
				for (CodeRsrc code : fireSizeCodes) {
					if (rofFormDataJson.has("fireSize") && !rofFormDataJson.optString("fireSize", "").equals("")
							&& rofFormDataJson.optString("fireSize", "").equalsIgnoreCase(code.getCode())) {
						rof.setFireSizeComparisionCode(code.getCode());
					}
				}
			} else if (codeTable.getCodeTableName()
					.equalsIgnoreCase(RecordServiceConstants.RATE_OF_SPREAD_CODE_TABLE)) {
				List<CodeRsrc> rateOfSpreadCodes = codeTable.getCodes();
				for (CodeRsrc code : rateOfSpreadCodes) {
					if (rofFormDataJson.has("rateOfSpread") && !rofFormDataJson.optString("rateOfSpread", "").equals("")
							&& rofFormDataJson.optString("rateOfSpread", "").equalsIgnoreCase(code.getCode())) {
						rof.setRateOfSpreadCode(code.getCode());
					}
				}
			} else if (codeTable.getCodeTableName().equalsIgnoreCase(RecordServiceConstants.SMOKE_COLOUR_CODE_TABLE)) {
				List<CodeRsrc> smokeColourCodes = codeTable.getCodes();
				List<String> smokeColourCodeList = new ArrayList<String>();
				if (rofFormDataJson.has("smokeColor") && rofFormDataJson.optJSONArray("smokeColor") != null) {
					List<String> rofSmokeColors = convertJSONArrayToArrayList(
							rofFormDataJson.getJSONArray("smokeColor"));
					for (CodeRsrc code : smokeColourCodes) {
						for (String rofSmokeColor : rofSmokeColors) {
							if (rofSmokeColor.equalsIgnoreCase(code.getCode()))
								smokeColourCodeList.add(code.getCode());
						}
					}
					rof.setSmokeColourCodes(smokeColourCodeList);
				}
			} else if (codeTable.getCodeTableName().equalsIgnoreCase(RecordServiceConstants.BURNING_CODE_TABLE)) {
				List<CodeRsrc> categories = codeTable.getCodes();
				rof.setReportedForestFuel(new ArrayList<>());
				if (rofFormDataJson.has("burning") && rofFormDataJson.optJSONArray("burning") != null) {
					List<String> burnings = convertJSONArrayToArrayList(rofFormDataJson.getJSONArray("burning"));
					for (CodeRsrc code : categories) {
						for (String burning : burnings) {
							if (burning.equalsIgnoreCase(code.getCode())) {
								ForestFuelResource reported = new ForestFuelResource();
								reported.setForestFuelReportTypeCode("Reported");
								reported.setForestFuelCategoryCode(code.getCode());
								rof.getReportedForestFuel().add(reported);
							}
						}
					}
				}
			}
		}

		Date now = new Date();

		rof.setReportedDate(now);
		rof.setMessageStatusTimestamp(now);
		rof.setMessageReceivedTimestamp(now);
		rof.setReceivedTimestamp(now);
		rof.setReportOfFireTypeCode("PUBLIC");
		rof.setMessageStatusCode("Received");
		rof.setPublicReportTypeCode("GENERAL");
		rof.setMessageReceivedSource("public-mobile");
		rof.setMessageTypeCode("Public Report of Fire");
		rof.setRelayedInd(false);
		rof.setLostCallInd(false);
		rof.setGeographicAreaDescription("");
		rof.setRelativeLocationDescription("");
		rof.setReportedByParty(new WildfirePartyResource());

		if (rofFormDataJson.has("fireLocation") && rofFormDataJson.optJSONArray("fireLocation") != null) {
			rof.setLatitude(rofFormDataJson.optJSONArray("fireLocation").getDouble(0));
			rof.setLongitude(rofFormDataJson.optJSONArray("fireLocation").getDouble(1));
			GeometryFactory factory = new GeometryFactory();
			Geometry point = factory.createPoint(new Coordinate(rof.getLongitude(), rof.getLatitude()));
			point.setSRID(4326);
			rof.setFireLocationPoint(point);
		}

		if (rofFormDataJson.has("fullName") && !rofFormDataJson.optString("fullName", "").equals(""))
			rof.setReportedByName(rofFormDataJson.optString("fullName"));
		if (rofFormDataJson.has("consentToCall"))
			rof.setAvailableForCallbackInd(rofFormDataJson.optBoolean("consentToCall"));
		if (rofFormDataJson.has("fullName") && !rofFormDataJson.optString("fullName", "").equals(""))
			rof.setCallerName(rofFormDataJson.optString("fullName"));
		if (rofFormDataJson.has("phoneNumber") && !rofFormDataJson.optString("phoneNumber", "").equals(""))
			rof.setCallerTelephone(rofFormDataJson.optString("phoneNumber"));
		if (rofFormDataJson.has("assetsAtRisk") && rofFormDataJson.optJSONArray("assetsAtRisk") != null)
			rof.setValuesBeingThreatenedNote(rofFormDataJson.getJSONArray("assetsAtRisk").toString().replace("[", "")
					.replace("]", "").replace("\"", "").replace(",", ", "));
		if (rofFormDataJson.has("weather") && rofFormDataJson.optJSONArray("weather") != null)
			rof.setWeatherDescription(rofFormDataJson.getJSONArray("weather").toString().replace("[", "")
					.replace("]", "").replace("\"", "").replace(",", ", "));
		if (rofFormDataJson.has("signsOfResponse") && rofFormDataJson.optJSONArray("signsOfResponse") != null)
			rof.setFireFightingProgressNote(rofFormDataJson.getJSONArray("signsOfResponse").toString().replace("[", "")
					.replace("]", "").replace("\"", "").replace(",", ", "));

		// set default visible flame string as No Comment
		String visibleFlame = noCommentVisibleFlameString;

		if (rofFormDataJson.has("visibleFlame") && rofFormDataJson.optJSONArray("visibleFlame") != null) {
			if (rofFormDataJson.optJSONArray("visibleFlame").isEmpty()) {
				visibleFlame = noCommentVisibleFlameString;
			} else if (rofFormDataJson.getJSONArray("visibleFlame").toString().replace("[", "").replace("]", "")
					.replace("\"", "").equalsIgnoreCase("YES")) {
				visibleFlame = visibleFlameString;
			} else if (rofFormDataJson.getJSONArray("visibleFlame").toString().replace("[", "").replace("]", "")
					.replace("\"", "").equalsIgnoreCase("NO")) {
				visibleFlame = noVisibleFlameString;
			}
		}

		if (rofFormDataJson.has("otherInfo") && !rofFormDataJson.optString("otherInfo", "").equals(""))
			rof.setCallerReportDetails(visibleFlame + rofFormDataJson.optString("otherInfo"));
		else if (rofFormDataJson.has("otherInfo") && rofFormDataJson.optString("otherInfo", "").equals(""))
			rof.setCallerReportDetails(visibleFlame + noCommentString);

		logger.info(" ### START POST - Serializing and executing RoF POST...");
		mapper.activateDefaultTyping(mapper.getPolymorphicTypeValidator(), ObjectMapper.DefaultTyping.JAVA_LANG_OBJECT,
				As.PROPERTY);
		String serializedRof = mapper.writeValueAsString(rof);
		return serializedRof;
	}

	private String sanitizeAttachmentString(String attachment) {
		attachment = attachment.replace("\"links\":[],", "").replace("\"attachmentGuid\":null,", "")
				.replace("\"sourceObjectUniqueId\":null,", "").replace("\"latitude\":null,", "")
				.replace("\"longitude\":null,", "").replace("\"azimuth\":null,", "").replace("\"elevation\":null,", "")
				.replace("\"elevationAngle\":null,", "").replace("\"imageHeight\":null,", "")
				.replace("\"imageWidth\":null,", "").replace("\"imageURL\":null,", "")
				.replace("\"attachmentTitle\":null,", "").replace("\"thumbnailURL\":null,", "")
				.replace("\"thumbnailIdentifier\":null,", "");

		return attachment;
	}

	private Double convertObjectToDouble(Object obj) {
		Double value = null;
		if (!obj.equals(JSONObject.NULL)) {
			if (obj instanceof BigDecimal || obj instanceof Double)
				value = ((BigDecimal) obj).doubleValue();
		}
		return value;
	}

	/**
	 * Helper method for converting json array object to a list
	 * 
	 * @param jsonArray
	 * @return
	 */
	private List<String> convertJSONArrayToArrayList(JSONArray jsonArray) {
		List<String> list = new ArrayList<String>();
		if (jsonArray != null) {
			for (int i = 0; i < jsonArray.length(); i++) {
				list.add(jsonArray.getString(i));
			}
		}
		return list;
	}

	enum FormPushHandler {
		WAIT,
		RETRY,
		INVALID
	}
	
	long retryAfter(int retries) {
		return (1L<<retries)-1;
	}
	
	FormPushHandler howToHandle(RoFFormDto form, RoFEntryForm rofFormData) {
		int retries = rofFormData.getRetries();
		long retryAfter = retryAfter(retries);
		LocalDateTime retryAt = form.getSubmittedTimestamp().plusMinutes(retryAfter);
		if(!rofFormData.getSubmissionStatus().equalsIgnoreCase(RecordServiceConstants.QUEUED_STATUS)) {
			return FormPushHandler.INVALID;
		} else if (! retryAt.isAfter(LocalDateTime.now(clock))) {
			return FormPushHandler.RETRY;
		} else {
			return FormPushHandler.WAIT;
		}
		
	}
	
	/**
	 * Fetch an RoF from the Cache and push to WFIM This method should only be
	 * triggered from the Quartz service
	 */
	public List<PublicReportOfFireResource> pushCachedRoFsToIncidentManager(FactoryContext context) {
		logger.debug("pushRoFToIncidentManager >>");

		ObjectMapper mapper = new ObjectMapper();
		List<PublicReportOfFireResource> results = new ArrayList<>();

		// start a transaction
		TransactionDefinition transactionDefinition = new DefaultTransactionDefinition();
		TransactionStatus transactionStatus = transactionManager.getTransaction(transactionDefinition);
		
		Date processStart = new Date();
		// Fetch all available RoFs from Postgres
		try {
			boolean stuck = false;
			// Select all submitted RoF's from the last 48 hours
			// this will use a lock to ensure only one running instance can
			// acccess selected records
			logger.debug(" ### START TRANSACTION - Starting Transaction. Query for queued RoFs...");
			List<RoFFormDto> forms = getRofFormDao().select();
			
			List<RoFRetryInfo> stuckRofs = new ArrayList<>(forms.size());
			if (!forms.isEmpty()) {
				logger.debug("Found {} RoFs to process.", forms.size());
				// Iterate through each, create in IM
				String ouathApiUrl = webadeOauth2ClientUrl;
				String client = webadeOauth2ClientId;
				String secret = webadeOauth2ClientSecret;

				// create a token
				HttpResponse<JsonNode> tokenResponse = Unirest.get(ouathApiUrl)
						.header("Authorization", "Basic " + Base64.getEncoder().encodeToString((client + ":" + secret).getBytes()))
						.header("Content-Type", "application/json").asJson();
				JsonNode tokenBody = tokenResponse.getBody();
				String token = tokenBody.getObject().getString("access_token");

				for (RoFFormDto form : forms) {
					// map the form blob into an RoF Helper class
					RoFEntryForm rofFormData = mapper.readValue(form.getReportOfFire(), RoFEntryForm.class);
					
					if( pushRoFToIncidentManager(mapper, results, token, form, rofFormData)) {
						stuck = true;
						RoFRetryInfo retryInfo = new RoFRetryInfo();
						retryInfo.setRofCacheGuid(form.getReportOfFireCacheGuid());
						retryInfo.setRetries(rofFormData.getRetries());
						retryInfo.setNextRetry(form.getSubmittedTimestamp().plusMinutes(this.retryAfter(rofFormData.getRetries())));
						stuckRofs.add(retryInfo);
					}
				}
			}
			if(stuck) {
				stuckSince.ifPresent(since->{
					if (ChronoUnit.MINUTES.between(since, LocalDateTime.now(clock))>DEGRADED_NOTIFICATION_INTERVAL) {
						try {
							this.emailNotificationService.sendServiceDegradedMessage(stuckRofs, lastError);
						} catch (UnsupportedEncodingException | MessagingException e) {
							logger.error("Failed to send notification email about performance degredation", e);
						}
					}
				});
				
				stuckSince = Optional.of(LocalDateTime.now(clock));
				
			} else {
				stuckSince.ifPresent(since->{
					try {
						this.emailNotificationService.sendServiceRestoredMessage();
					} catch (UnsupportedEncodingException | MessagingException e) {
						logger.error("Failed to send notification email about performance returning to normal", e);
					}
					stuckSince = Optional.empty();
				});
			}
		} catch (DaoException daoe) {
			logger.error("Failed to connect to DB", daoe);
		} catch (Exception e) {
			logger.error("Error creating WFIM document", e);
		} finally {
			try {
				transactionManager.commit(transactionStatus);
			} catch (Exception te) {
				logger.error("Error occured closing transaction state", te);
			}
			logger.debug("Transaction completed. Total Duration: {} seconds",
					((new Date().getTime() - processStart.getTime()) / 1000));
		}
		
		logger.debug("<< pushRoFToIncidentManager");
		return results;
	}

	private boolean pushRoFToIncidentManager(ObjectMapper mapper, List<PublicReportOfFireResource> results, String token,
			RoFFormDto form, RoFEntryForm rofFormData) {
		boolean stuck = false;
		try {
			switch(howToHandle(form, rofFormData)) {
			case INVALID:
				logger.debug("Attempting to process form in progress or invalidated. Skipping...");
				if(rofFormData.getRetries()>0) {
					stuck = true;
				}
				break;
			case RETRY:
				stuck = doPushRoFToIncidentManagement(mapper, results, token, form, rofFormData);
				break;
			case WAIT:
				logger.debug("Waiting to retry form submission. Skipping...");
				stuck = true;
				break;
			}
		} catch (Exception e) {
			logger.error("Skipping invalid document", e);
			stuck=true;
		}
		return stuck;
	}

	private boolean doPushRoFToIncidentManagement(ObjectMapper mapper, List<PublicReportOfFireResource> results,
			String token, RoFFormDto form, RoFEntryForm rofFormData) throws JsonProcessingException, DaoException {
		Date formStart = new Date();
		boolean stuck = false;
		logger.debug("### START FORM - Starting form submit for {}",
				form.getReportOfFireCacheGuid());
		// flag as in progress
		rofFormData.setSubmissionStatus(RecordServiceConstants.PROCESSING_STATUS);
		form.setReportOfFire(mapper.writeValueAsString(rofFormData));
		getRofFormDao().update(form);
		// fetch the forms images
		try {
			List<FileDetailsRsrc> attachmentList = new ArrayList<>();
			List<RoFImageDto> imageCache = getRofImageDao().select(form.getReportOfFireCacheGuid());
			// push to WFDM
			int count = 1;
			for (RoFImageDto image : imageCache) {
				pushImageToWFDM(mapper, form, rofFormData, attachmentList, count, image);
				count++;
			}
			// Insert into WFIM
			PublicReportOfFireResource handledForm = postToInicidentManager(
					new JSONObject(rofFormData.getForm()), attachmentList, token);

			// if we recieved an object back, the submission was successful
			// we can delete the images and form from the cache
			if (handledForm != null) {
				// Delete from postgres
				try {
					for (RoFImageDto image : imageCache) {
						getRofImageDao().delete(image);
					}
					getRoFFormDao().delete(form);
					results.add(handledForm);
					logger.info(" ### Completed submission/cleanup of form "
							+ form.getReportOfFireCacheGuid());
				} catch (Exception e) {
					logger.error("Failed to delete records from DB", e);
				}
			}
		} catch (Exception e) {
			this.handlePushError(mapper, form, rofFormData, e, "push RoF to WFIM");
			stuck=true;
		}
		logger.debug(" ### END TRANSACTION - Form submit completed. Total Duration: {} seconds",
				((new Date().getTime() - formStart.getTime()) / 1000));
		return stuck;
	}

	private boolean notifyOnRetry(int retry) {
		return retry==NOTIFY_RETRY; 
	}
	
	private void handlePushError(ObjectMapper mapper, RoFFormDto form, RoFEntryForm rofFormData, Exception ex, String failedPushAction) throws JsonProcessingException, DaoException {
		// we encountered an error
		// update the retry count and error message on the cache
		logger.error(String.format("Failed to %s", failedPushAction), ex);
		
		lastError = String.format("%s while trying to %s for RoF %s", ex.getMessage(), failedPushAction, form.getReportOfFireCacheGuid());
		
		rofFormData.setError(ex.getMessage());
		rofFormData.setRetries(rofFormData.getRetries() + 1);
		rofFormData.setSubmissionStatus(
				rofFormData.getRetries() > MAX_RETRIES ? RecordServiceConstants.INVALID_STATUS
						: RecordServiceConstants.QUEUED_STATUS);
		form.setReportOfFire(mapper.writeValueAsString(rofFormData));
		getRofFormDao().update(form);
		String serializedRof;
		try {
			serializedRof = prepareRoF(new JSONObject(rofFormData.getForm()), new ObjectMapper());
		} catch (Exception e) {
			logger.error("Error while serializing RoF for error notification", e);
			serializedRof = "Error while serializing RoF for error notification: "+e.getMessage();
		}
		if (notifyOnRetry(rofFormData.getRetries())) {
			try {
				emailNotificationService.sendRoFsStuckMessage(serializedRof, form.getReportOfFireCacheGuid(), ex, failedPushAction);
			} catch (MessagingException | UnsupportedEncodingException messagingException) {
				logger.error(String.format("Messaging exception while notifying of error while attempting to %s: %s", 
						failedPushAction, messagingException.getMessage()), messagingException);
			}
		}
	}

	private void pushImageToWFDM(ObjectMapper mapper, RoFFormDto form, RoFEntryForm rofFormData,
			List<FileDetailsRsrc> attachmentList, int count, RoFImageDto image)
			throws JsonProcessingException, DaoException, IOException {
		Date wfdmDate = new Date();
		logger.debug(" ### START WFDM - Submitting attachment {} to WFDM",
				"rof-img-" + count);
		try {
			FileDetailsRsrc uploadedFile = uploadFileToDocumentManagement(
					"rof-img-" + count + "_" + form.getReportOfFireCacheGuid(),
					(byte[]) image.getAttachment(), form.getReportOfFire());
			attachmentList.add(uploadedFile);
		} catch (Exception ex) {
			handlePushError(mapper, form, rofFormData, ex, "push image to WFDM");
			throw new IOException("Error loading image "
					+ image.getReportOfFireAttachmentCacheGuid() + " from RoF");
		} finally {
			logger.debug(
					" ### END WFDM - WFDM submit completed for attachment {}. Total Duration: {} seconds",
					"rof-img-" + count,
					((new Date().getTime() - wfdmDate.getTime()) / 1000));
		}
	}

	/**
	 * Upload an image attachment to WFDM
	 * 
	 * @param name  The attachment name
	 * @param image The attachment bytes
	 * @return A successful attachment WFDM Resource
	 * @throws FileServiceException
	 * @throws ValidationException
	 * @throws IOException
	 * @throws ImageProcessingException
	 * @throws MetadataException
	 */
	private FileDetailsRsrc uploadFileToDocumentManagement(String name, byte[] image, String form)
			throws FileServiceException, ValidationException, IOException, ImageProcessingException, MetadataException {
		FileDetailsRsrc fileDetails = new FileDetailsRsrc();
		MultipartData data = new MultipartData();
		String path = "/WFIM/uploads/";
		Double lat = null;
		Double lng = null;
		Double altitude = null;
		Double bearing = null;

		InputStream imageStream = new ByteArrayInputStream(image);
		BufferedInputStream bis = new BufferedInputStream(imageStream);

		try {
			Metadata metadata = ImageMetadataReader.readMetadata(bis);

			List<GpsDirectory> gpsDirectory = (List<GpsDirectory>) metadata.getDirectoriesOfType(GpsDirectory.class);

			if (gpsDirectory != null && !gpsDirectory.isEmpty() && gpsDirectory.get(0) != null) {
				GeoLocation location = gpsDirectory.get(0).getGeoLocation();
				if (location != null) {
					lat = location.getLatitude();
					lng = location.getLongitude();
				} else {
					Rational[] latitudes = gpsDirectory.get(0).getRationalArray(GpsDirectory.TAG_LATITUDE);
					Rational[] longitudes = gpsDirectory.get(0).getRationalArray(GpsDirectory.TAG_LONGITUDE);
					if (latitudes != null) {
						lat = convertDMStoDecimal(latitudes);
					}
					if (longitudes != null) {
						lng = convertDMStoDecimal(longitudes);
					}
				}

				Rational alt = gpsDirectory.get(0).getRational(GpsDirectory.TAG_ALTITUDE);
				if (alt != null) {
					altitude = alt.doubleValue();
				}

				Rational bear = gpsDirectory.get(0).getRational(GpsDirectory.TAG_DEST_BEARING);
				if (bear != null) {
					bearing = bear.doubleValue();
				}
			}
		} catch (Exception e) {
			imageStream.close();
			bis.close();
			throw e;
		} finally {
			imageStream.close();
			bis.close();
		}

		InputStream is = null;
		byte[] convertedImage = null;
		try {
			is = new ByteArrayInputStream(image);
			convertedImage = IOUtils.toByteArray(is);
		} catch (Exception e) {
			throw e;
		} finally {
			if (is != null) {
				is.close();
			}
		}

		String mimeType = "";

		// We dont need to detect content type if we convert to jpeg by default
		try {
			mimeType = URLConnection.guessContentTypeFromStream(is);
			if (mimeType == null)
				mimeType = "image/jpeg";
		} catch (IOException e) {
			// ignore and use default
			mimeType = "image/jpeg";
		}

		// force to jpeg rather than jpg
		if (mimeType.equals("image/jpg"))
			mimeType = "image/jpeg";
		String fileSubType = mimeType.split("/")[1];

		data.setBytes(convertedImage);
		data.setContentType(mimeType);
		data.setFileName(name + "." + fileSubType);

		fileDetails.setFilePath(path + name + "." + fileSubType);
		fileDetails.setFileSize((long) convertedImage.length);
		fileDetails.setFileExtension(fileSubType);
		fileDetails.setMimeType(mimeType);
		fileDetails.setFileType("DOCUMENT");

		FileMetadataRsrc metaOwner = new FileMetadataRsrc();
		metaOwner.setMetadataName("Owner");
		metaOwner.setMetadataValue("HQK");
		
		// set coordinates for image if not set by now
		// device location should be attached to ROF. If for some reason it is not, use fire's location
		if (form != null && lat == null && lng == null) {
			JSONObject rof = new JSONObject(form);
			if (rof.has("form") && rof.optString("form") != null) {
				String rofString = rof.optString("form");
				JSONObject rofForm = new JSONObject(rofString);
				if (rofForm != null && rofForm.optJSONArray("deviceLocation") != null) {
					lat = rofForm.optJSONArray("deviceLocation").getDouble(0);
					lng = rofForm.optJSONArray("deviceLocation").getDouble(1);
				} else if (rofForm != null && rofForm.optJSONArray("fireLocation") != null) {
					lat = rofForm.optJSONArray("fireLocation").getDouble(0);
					lng = rofForm.optJSONArray("fireLocation").getDouble(1);
				}				
			}
		}

		List<FileMetadataRsrc> meta = new ArrayList<>();
		meta.add(metaOwner);
		if (lat != null) {
			FileMetadataRsrc metaLatitude = new FileMetadataRsrc();
			metaLatitude.setMetadataName("Latitude");
			metaLatitude.setMetadataValue(String.valueOf(lat));
			meta.add(metaLatitude);
		}

		if (lng != null) {
			FileMetadataRsrc metaLongitude = new FileMetadataRsrc();
			metaLongitude.setMetadataName("Longitude");
			metaLongitude.setMetadataValue(String.valueOf(lng));
			meta.add(metaLongitude);
		}

		if (altitude != null) {
			FileMetadataRsrc metaAltitude = new FileMetadataRsrc();
			metaAltitude.setMetadataName("Altitude");
			metaAltitude.setMetadataValue(String.valueOf(altitude));
			meta.add(metaAltitude);
		}

		if (bearing != null) {
			FileMetadataRsrc metaBearing = new FileMetadataRsrc();
			metaBearing.setMetadataName("Bearing");
			metaBearing.setMetadataValue(String.valueOf(bearing));
			meta.add(metaBearing);
		}

		fileDetails.setMetadata(meta);
		fileDetails.setRetention("FOR-14600-22");

		FileDetailsRsrc result = fileService.createFile(fileDetails, data);

		logger.debug("Image uploaded to WFDM successfully");

		return result;
	}

	private Double convertDMStoDecimal(Rational[] coordinates) {
		Double coordinatesAsDecimal = null;

		if (coordinates != null && coordinates.length != 0) {
			try {
				double coord1 = coordinates[0].doubleValue();
				double coord2 = coordinates[1].doubleValue();
				double coord3 = coordinates[2].doubleValue();

				coordinatesAsDecimal = coord1 + coord2 / 60 + coord3 / 3600;
			} catch (ArrayIndexOutOfBoundsException ex) {
				logger.debug("Coordinates array out of bounds: " + ex);
			}
		}

		return coordinatesAsDecimal;
	}
}
