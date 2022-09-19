package ca.bc.gov.nrs.wfnews.service.api.v1.impl;

import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.JsonNode;
import com.mashape.unirest.http.Unirest;

import ca.bc.gov.nrs.wfnews.service.api.v1.IncidentsService;
import ca.bc.gov.nrs.wfnews.service.api.v1.model.factory.PublishedIncidentFactory;
import ca.bc.gov.nrs.wfnews.service.api.v1.validation.ModelValidator;
import ca.bc.gov.nrs.common.service.ConflictException;
import ca.bc.gov.nrs.common.service.NotFoundException;
import ca.bc.gov.nrs.common.service.ValidationFailureException;
import ca.bc.gov.nrs.wfone.common.service.api.model.factory.FactoryContext;
import ca.bc.gov.nrs.wfone.common.webade.authentication.WebAdeAuthentication;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.IncidentResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.IncidentListResource;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.json.JSONObject;
import org.json.JSONArray;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.OAuth2RestTemplate;

import ca.bc.gov.nrs.wfone.common.model.Message;
import ca.bc.gov.nrs.wfone.common.webade.oauth2.authentication.WebAdeOAuth2Authentication;
import ca.bc.gov.nrs.common.persistence.dao.DaoException;
import ca.bc.gov.nrs.common.persistence.dao.IntegrityConstraintViolatedDaoException;
import ca.bc.gov.nrs.common.persistence.dao.NotFoundDaoException;
import ca.bc.gov.nrs.common.persistence.dao.OptimisticLockingFailureDaoException;
import ca.bc.gov.nrs.wfone.common.rest.endpoints.BaseEndpointsImpl;
import ca.bc.gov.nrs.common.service.ServiceException;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.ExternalUriListResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.ExternalUriResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.PublishedIncidentListResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.PublishedIncidentResource;
import ca.bc.gov.nrs.wfnews.api.model.v1.PublishedIncident;
import ca.bc.gov.nrs.wfnews.persistence.v1.dao.ExternalUriDao;
import ca.bc.gov.nrs.wfnews.persistence.v1.dao.PublishedIncidentDao;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.ExternalUriDto;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.PagedDtos;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.PublishedIncidentDto;
import ca.bc.gov.nrs.wfnews.service.api.v1.model.factory.ExternalUriFactory;
import ca.bc.gov.nrs.wfnews.service.api.v1.validation.exception.ValidationException;

public class IncidentsServiceImpl extends BaseEndpointsImpl implements IncidentsService{

    private static final Logger logger = LoggerFactory.getLogger(IncidentsServiceImpl.class);
    
    String topLevelRestURL;

	private OAuth2RestTemplate restTemplate;
    
    private PublishedIncidentFactory publishedIncidentFactory;
	private ExternalUriFactory externalUriFactory;
	
	private PublishedIncidentDao publishedIncidentDao;
	private ExternalUriDao externalUriDao;
	
	@Autowired
	private ModelValidator modelValidator;
	
	public void setRestTemplate(OAuth2RestTemplate restTemplate) {
		this.restTemplate = restTemplate;
	}
	
	public void setTopLevelRestURL(String topLevelRestURL) {
		this.topLevelRestURL = topLevelRestURL;
	}
    
    public void setAgolQueryUrl(String agolQueryUrl) {
    	this.agolQueryUrl = agolQueryUrl;
    }
    
    public void setPublishedIncidentFactory(PublishedIncidentFactory publishedIncidentFactory) {
		this.publishedIncidentFactory = publishedIncidentFactory;
	}
	
	public void setExternalUriFactory(ExternalUriFactory externalUriFactory) {
		this.externalUriFactory = externalUriFactory;
	}
	
	public void setPublishedIncidentDao(PublishedIncidentDao publishedIncidentDao) {
        this.publishedIncidentDao = publishedIncidentDao;
    }
    
    public void setExternalUriDao(ExternalUriDao externalUriDao) {
        this.externalUriDao = externalUriDao;
    }
      
    @Value("${wfnews-agol-query.url}")
    private String agolQueryUrl;
    
    private String concatenatedQueryString = "&f=pjson&outFields=*&inSR=4326";

    @Override
    public IncidentListResource getIncidents(String status, String date, Double minLatitude, Double maxLatitude, Double minLongitude, Double maxLongitude){
    	IncidentListResource result = new IncidentListResource();
    	
    	String queryUrl = agolQueryUrl;
    	
    	if (status != null && status !="") {
    		queryUrl = queryUrl + "+AND+FIRE_STATUS+%3D+'"+ status.replace(" ", "+") + "'";
    	}
    	
    	if (date != null && date!= "") {
    		queryUrl = queryUrl + "+AND+IGNITION_DATE+%3E%3D+'"+ date +"+00%3A00%3A00'+AND+IGNITION_DATE+%3C%3D+'"+ date +"+23%3A59%3A59'";
    	}
    	
    	if (minLatitude != null && maxLatitude != null && minLongitude != null && maxLongitude != null) {
    		queryUrl = queryUrl + "&geometryType=esriGeometryEnvelope&geometry="+ minLongitude + "%2C+" + minLatitude + "%2C+"+ maxLongitude + "%2C+" + maxLatitude;
    	}
    	
    	queryUrl = queryUrl + concatenatedQueryString;
    	
        try{
        	
            HttpResponse<JsonNode> response = Unirest
            .post(queryUrl)
            .header("Content-Type", "application/json")
            .header("Accept", "*/*")
            .asJson(); 
            
            if (response != null) {
            	result = getIncidentResourceListFromJsonBody(response.getBody());
            }

            }catch(Exception e){
                logger.error("Failed to retrive JSON from AGOL service for all incidents", e);
            } 
            
        return result;

    }
    
    @Override
    public IncidentResource getIncidentByID(String id) {
    	IncidentResource result = new IncidentResource();
    	IncidentListResource incidentListResource = null;
    	String queryUrl = agolQueryUrl + "+AND+FIRE_ID+%3D" + id + concatenatedQueryString;
    	 try{
         	
             HttpResponse<JsonNode> response = Unirest
             .post(queryUrl)
             .header("Content-Type", "application/json")
             .header("Accept", "*/*")
             .asJson(); 
             
             if (response != null) {
            	 incidentListResource = getIncidentResourceListFromJsonBody(response.getBody());
             }
             
          
             }catch(Exception e){
                 logger.error("Failed to retrive JSON from AGOL service for all incidents", e);
             } 
    	 
    	 if (incidentListResource!= null && incidentListResource.getCollection() != null && !incidentListResource.getCollection().isEmpty()) {
    		 result = incidentListResource.getCollection().get(0);
    	 } 
    	
    	return result;
    }
    
    public IncidentListResource getIncidentResourceListFromJsonBody(JsonNode jsonNode) {
    	IncidentListResource result = new IncidentListResource();
    	List<IncidentResource> incidentResourceList = new ArrayList<IncidentResource>();
    	
    	 JSONObject incidentJson = new JSONObject(jsonNode);
         JSONArray arrayJson = incidentJson.getJSONArray("array");  
         JSONObject obj = arrayJson.optJSONObject(0);
         JSONArray featuresArr = obj.optJSONArray("features");
         
         if (featuresArr != null) {
        	 for (int i = 0; i < featuresArr.length(); i++) {
            	 IncidentResource incidentResource = new IncidentResource();
            	 
            	 JSONObject obj1 = featuresArr.optJSONObject(i);
                 JSONObject attributesObj = obj1.optJSONObject("attributes");
                 
                 if(attributesObj.has("FIRE_NUMBER") && !attributesObj.optString("FIRE_NUMBER", "").equals("")) incidentResource.setFireNumber(attributesObj.optString("FIRE_NUMBER"));
                 if(attributesObj.has("FIRE_YEAR") && (attributesObj.optInt("FIRE_YEAR") != (0))) incidentResource.setFireYear(attributesObj.optInt("FIRE_YEAR"));
                 if(attributesObj.has("IGNITION_DATE") && (attributesObj.optLong("IGNITION_DATE") != (0))) incidentResource.setIgnitionDate(attributesObj.optLong("IGNITION_DATE"));
                 if(attributesObj.has("FIRE_STATUS") && !attributesObj.optString("FIRE_STATUS", "").equals("")) incidentResource.setFireStatus(attributesObj.optString("FIRE_STATUS"));
                 if(attributesObj.has("FIRE_CAUSE") && !attributesObj.optString("FIRE_CAUSE", "").equals("")) incidentResource.setFireCause(attributesObj.optString("FIRE_CAUSE"));
                 if(attributesObj.has("FIRE_CENTRE") && (attributesObj.optInt("FIRE_CENTRE") != (0))) incidentResource.setFireCentre(attributesObj.optInt("FIRE_CENTRE"));
                 if(attributesObj.has("FIRE_ID") && (attributesObj.optInt("FIRE_ID") != (0))) incidentResource.setFireID(attributesObj.optInt("FIRE_ID"));
                 if(attributesObj.has("FIRE_TYPE") && !attributesObj.optString("FIRE_TYPE", "").equals("")) incidentResource.setFireType(attributesObj.optString("FIRE_TYPE"));
                 if(attributesObj.has("GEOGRAPHIC_DESCRIPTION") && !attributesObj.optString("GEOGRAPHIC_DESCRIPTION", "").equals("")) incidentResource.setGeographicDescription(attributesObj.optString("GEOGRAPHIC_DESCRIPTION"));
                 if(attributesObj.has("ZONE") && (attributesObj.optInt("ZONE") != (0))) incidentResource.setZone(attributesObj.optInt("ZONE"));
                 if(attributesObj.has("LATITUDE") && (attributesObj.optDouble("LATITUDE") != (0))) incidentResource.setLatitude(attributesObj.optDouble("LATITUDE"));
                 if(attributesObj.has("LONGITUDE") && (attributesObj.optDouble("LONGITUDE") != (0))) incidentResource.setLongitude(attributesObj.optDouble("LONGITUDE"));      
                 if(attributesObj.has("CURRENT_SIZE") && (attributesObj.optInt("CURRENT_SIZE") != (0))) incidentResource.setCurrentSize(attributesObj.optInt("CURRENT_SIZE"));
                 if(attributesObj.has("FIRE_OF_NOTE_URL") && !attributesObj.optString("FIRE_OF_NOTE_URL", "").equals("")) incidentResource.setFireOfNoteURL(attributesObj.optString("FIRE_OF_NOTE_URL"));
                 if(attributesObj.has("FIRE_OF_NOTE_ID") && !attributesObj.optString("FIRE_OF_NOTE_ID", "").equals("")) incidentResource.setFireOfNoteID(attributesObj.optString("FIRE_OF_NOTE_ID"));
                 if(attributesObj.has("FIRE_OF_NOTE_NAME") && !attributesObj.optString("FIRE_OF_NOTE_NAME", "").equals("")) incidentResource.setFireOfNoteName(attributesObj.optString("FIRE_OF_NOTE_NAME"));
                 if(attributesObj.has("FEATURE_CODE") && !attributesObj.optString("FEATURE_CODE", "").equals("")) incidentResource.setFeatureCode(attributesObj.optString("FEATURE_CODE"));
                 if(attributesObj.has("OBJECT_ID") && (attributesObj.optInt("OBJECT_ID") != (0))) incidentResource.setObjectID(attributesObj.optInt("OBJECT_ID"));
                 if(attributesObj.has("GLOBAL_ID") && !attributesObj.optString("GLOBAL_ID", "").equals("")) incidentResource.setGlobalID(attributesObj.optString("GLOBAL_ID"));
                 
                 incidentResourceList.add(incidentResource);
             }
        	 
         }
         
         result.setCollection(incidentResourceList);
         
         return result;
    }
    
    @Override
    public PublishedIncidentResource createPublishedWildfireIncident(PublishedIncident publishedIncident, FactoryContext factoryContext) throws ValidationFailureException, ConflictException, NotFoundException, Exception {
		logger.debug("<createupdatePublishedWildfireIncident");
		PublishedIncidentResource response = null;
		
		long effectiveAsOfMillis =  publishedIncident.getDiscoveryDate()==null?System.currentTimeMillis():publishedIncident.getDiscoveryDate().getTime();
		
		try {
			List<Message> errors = this.modelValidator.validatePublishedIncident(publishedIncident, effectiveAsOfMillis);
			
			if(!errors.isEmpty()) {
				throw new ValidationException(errors);	
			}
			
			PublishedIncidentResource result = new PublishedIncidentResource();
		
			result = (PublishedIncidentResource) createPublishedWildfireIncident(
								publishedIncident, 
								getWebAdeAuthentication(), 
								factoryContext);
			
			response = result;
		
		} catch (IntegrityConstraintViolatedDaoException e) {
			throw new ConflictException(e.getMessage());
		} catch (NotFoundDaoException e) {
			throw new NotFoundException(e.getMessage());
		} catch (DaoException e) {
			throw new ServiceException("DAO threw an exception", e);
		}catch (Exception e) {
			throw new Exception("Service threw an exception", e);
		}

		logger.debug(">createPublishedWildfireIncident");
		return response;
	
		
	}
    
    @Override
    public PublishedIncidentResource updatePublishedWildfireIncident(PublishedIncident publishedIncident, FactoryContext factoryContext) throws ValidationFailureException, ConflictException, NotFoundException, Exception {
		logger.debug("<updatePublishedWildfireIncident");
		PublishedIncidentResource response = null;
		
		long effectiveAsOfMillis =  publishedIncident.getDiscoveryDate()==null?System.currentTimeMillis():publishedIncident.getDiscoveryDate().getTime();
		
		try {
			List<Message> errors = this.modelValidator.validatePublishedIncident(publishedIncident, effectiveAsOfMillis);
			
			if(!errors.isEmpty()) {
				throw new ValidationException(errors);	
			}
			
			PublishedIncidentResource result = new PublishedIncidentResource();
		
				PublishedIncidentResource currentWildfireIncident = (PublishedIncidentResource) getPublishedIncidentByIncidentGuid(
						publishedIncident,
						getWebAdeAuthentication(), 
						factoryContext);
	
					if (currentWildfireIncident != null) {
						result = (PublishedIncidentResource) updatePublishedWildfireIncident(
								publishedIncident, 
								getWebAdeAuthentication(), 
								factoryContext);
					}else {
						result = (PublishedIncidentResource) createPublishedWildfireIncident(
								publishedIncident, 
								getWebAdeAuthentication(), 
								factoryContext);
					}
			
				response = result;
		
		} catch (IntegrityConstraintViolatedDaoException e) {
			throw new ConflictException(e.getMessage());
		} catch (NotFoundDaoException e) {
			throw new NotFoundException(e.getMessage());
		} catch (DaoException e) {
			throw new ServiceException("DAO threw an exception", e);
		}catch (Exception e) {
			throw new Exception("Service threw an exception", e);
		}

		logger.debug(">updatePublishedWildfireIncident");
		return response;
	
		
	}
	
	private PublishedIncidentResource updatePublishedWildfireIncident(PublishedIncident publishedIncident, WebAdeAuthentication webAdeAuthentication, FactoryContext factoryContext) throws DaoException {

		PublishedIncidentResource result = null;
		PublishedIncidentDto dto = new PublishedIncidentDto(publishedIncident);
		try {
			dto.setUpdateDate(new Date());
			if (webAdeAuthentication != null && webAdeAuthentication.getUserId() != null) dto.setUpdateUser(webAdeAuthentication.getUserId());
			if (dto.getCreateUser() == null && webAdeAuthentication != null && webAdeAuthentication.getUserId() != null) dto.setCreateUser(webAdeAuthentication.getUserId());
			if (dto.getCreateDate() == null && webAdeAuthentication != null && webAdeAuthentication.getUserId() != null) dto.setCreateDate(new Date());
			
			this.publishedIncidentDao.update(dto);
		} catch (DaoException e) {
			throw new ServiceException("DAO threw an exception", e);
		}
		
		PublishedIncidentDto updatedDto = this.publishedIncidentDao.fetch(dto.getPublishedIncidentDetailGuid());

		result = this.publishedIncidentFactory.getPublishedWildfireIncident(updatedDto, factoryContext);
		return result;
	}
	
	private PublishedIncidentResource createPublishedWildfireIncident(PublishedIncident publishedIncident, WebAdeAuthentication webAdeAuthentication, FactoryContext factoryContext) throws DaoException {

		PublishedIncidentResource result = null;
		PublishedIncidentDto dto = new PublishedIncidentDto(publishedIncident);
		try {	
			dto.setUpdateDate(new Date());
			dto.setRevisionCount(Long.valueOf(0));
			if (webAdeAuthentication != null && webAdeAuthentication.getUserId() != null) dto.setUpdateUser(webAdeAuthentication.getUserId());
			if (dto.getCreateUser() == null && webAdeAuthentication != null && webAdeAuthentication.getUserId() != null) dto.setCreateUser(webAdeAuthentication.getUserId());
			if (dto.getCreateDate() == null && webAdeAuthentication != null && webAdeAuthentication.getUserId() != null) dto.setCreateDate(new Date());
			
			this.publishedIncidentDao.insert(dto);
		} catch (DaoException e) {
			throw new ServiceException("DAO threw an exception", e);
		}
		
		PublishedIncidentDto updatedDto = this.publishedIncidentDao.fetch(dto.getPublishedIncidentDetailGuid());

		result = this.publishedIncidentFactory.getPublishedWildfireIncident(updatedDto, factoryContext);
		return result;
	}
	
	@Override
	public PublishedIncidentResource getPublishedIncident(String publishedIncidentDetailGuid, WebAdeAuthentication webAdeAuthentication, FactoryContext factoryContext) throws DaoException {

		PublishedIncidentResource result = null;
		PublishedIncidentDto fetchedDto = this.publishedIncidentDao.fetch(publishedIncidentDetailGuid);
		if (fetchedDto != null) {
			result = this.publishedIncidentFactory.getPublishedWildfireIncident(fetchedDto, factoryContext);
		}
		return result;
	}
	
	@Override
	public PublishedIncidentResource getPublishedIncidentByIncidentGuid(PublishedIncident publishedIncident, WebAdeAuthentication webAdeAuthentication, FactoryContext factoryContext) throws DaoException {

		PublishedIncidentResource result = null;
		PublishedIncidentDto dto = new PublishedIncidentDto(publishedIncident);
		PublishedIncidentDto fetchedDto = this.publishedIncidentDao.fetchForIncidentGuid(dto.getIncidentGuid());
		if (fetchedDto != null) {
			result = this.publishedIncidentFactory.getPublishedWildfireIncident(fetchedDto, factoryContext);
		}
		return result;
	}
	
	@Override
	public void deletePublishedIncident(String publishedIncidentDetailGuid, FactoryContext factoryContext) throws NotFoundException, ConflictException{
		logger.debug("<deletePublishedIncident");
		
		try {
			
			PublishedIncidentDto dto = this.publishedIncidentDao.fetch(publishedIncidentDetailGuid);
			
			if(dto==null) {
				throw new NotFoundException("Did not find the PublishedIncident: "+publishedIncidentDetailGuid);
			}
			
			this.publishedIncidentDao.delete(publishedIncidentDetailGuid, "Sean");

		} catch (IntegrityConstraintViolatedDaoException e) {
			throw new ConflictException(e.getMessage());
		} catch (OptimisticLockingFailureDaoException e) {
			throw new ConflictException(e.getMessage());
		} catch (NotFoundDaoException e) {
			throw new NotFoundException(e.getMessage());
		} catch (DaoException e) {
			throw new ServiceException("DAO threw an exception", e);
		}

		logger.debug(">deletePublishedIncident");
	}
	
	@Override
	public PublishedIncidentListResource getPublishedIncidentList(Integer pageNumber, 
			Integer pageRowCount, FactoryContext factoryContext) {
		PublishedIncidentListResource results = null;
		PagedDtos<PublishedIncidentDto> publishedIncidentList = new PagedDtos<PublishedIncidentDto>();
		try {
			publishedIncidentList = this.publishedIncidentDao.select(pageNumber, pageRowCount);
			results = this.publishedIncidentFactory.getPublishedIncidentList(publishedIncidentList, pageNumber, pageRowCount, factoryContext);
		}catch(DaoException e) {
			throw new ServiceException("DAO threw an exception", e);
		}
		
		return results;
	}
	
	@Override
	public ExternalUriResource createExternalUri(ExternalUriResource externalUri, FactoryContext factoryContext) throws ValidationFailureException, ConflictException, NotFoundException, Exception{
		ExternalUriResource response = null;
		long effectiveAsOfMillis =  externalUri.getCreateDate() ==null?System.currentTimeMillis():externalUri.getCreateDate().getTime();
		try {
			List<Message> errors = this.modelValidator.validateExternalUri(externalUri, effectiveAsOfMillis);
			if(!errors.isEmpty()) {
				throw new Exception("Validation failed for ExternalUri: " + errors.toString());	
			}
			
			ExternalUriResource result = new ExternalUriResource();
			result = (ExternalUriResource) createExternalUri(
								externalUri, 
								getWebAdeAuthentication(), 
								factoryContext);
					
			response = result;
		
		} catch (IntegrityConstraintViolatedDaoException e) {
			throw new ConflictException(e.getMessage());
		} catch (NotFoundDaoException e) {
			throw new NotFoundException(e.getMessage());
		} catch (DaoException e) {
			throw new ServiceException("DAO threw an exception", e);
		}catch (Exception e) {
			throw new Exception("Service threw an exception", e);
		}

		logger.debug(">PublishedWildfireIncident");
		return response;
			
	}
	
	@Override
	public ExternalUriResource updateExternalUri(ExternalUriResource externalUri, FactoryContext factoryContext) throws ValidationFailureException, ConflictException, NotFoundException, Exception{
		ExternalUriResource response = null;
		long effectiveAsOfMillis =  externalUri.getCreateDate() ==null?System.currentTimeMillis():externalUri.getCreateDate().getTime();
		try {
			List<Message> errors = this.modelValidator.validateExternalUri(externalUri, effectiveAsOfMillis);
			if(!errors.isEmpty()) {
				throw new Exception("Validation failed for ExternalUri: " + errors.toString());	
			}
			
			ExternalUriResource result = new ExternalUriResource();
		
			ExternalUriResource currentExternalUri = (ExternalUriResource) getExternalUri(
					externalUri.getExternalUriGuid(),
						getWebAdeAuthentication(), 
						factoryContext);
	
					if (currentExternalUri != null) {
						result = (ExternalUriResource) updateExternalUri(
								externalUri, 
								getWebAdeAuthentication(), 
								factoryContext);
					}else {
						result = (ExternalUriResource) createExternalUri(
								externalUri, 
								getWebAdeAuthentication(), 
								factoryContext);
					}
			
				response = result;
		
		} catch (IntegrityConstraintViolatedDaoException e) {
			throw new ConflictException(e.getMessage());
		} catch (NotFoundDaoException e) {
			throw new NotFoundException(e.getMessage());
		} catch (DaoException e) {
			throw new ServiceException("DAO threw an exception", e);
		}catch (Exception e) {
			throw new Exception("Service threw an exception", e);
		}

		logger.debug(">PublishedWildfireIncident");
		return response;
			
	}
	
	@Override
	public ExternalUriResource getExternalUri(String externalUriGuid, WebAdeAuthentication webAdeAuthentication, FactoryContext factoryContext) throws DaoException {

		ExternalUriResource result = null;
		ExternalUriDto fetchedDto = this.externalUriDao.fetch(externalUriGuid);
		if (fetchedDto != null) {
			result = this.externalUriFactory.getExternalUri(fetchedDto, factoryContext);
		}
		return result;
	}
	
	private ExternalUriResource createExternalUri(ExternalUriResource publishedIncident, WebAdeAuthentication webAdeAuthentication, FactoryContext factoryContext) throws DaoException {
		
		ExternalUriResource result = null;
		ExternalUriDto dto = new ExternalUriDto(publishedIncident);
		try {
			if (dto.getCreateDate()==null)dto.setCreateDate(new Date());
			if (dto.getCreatedTimestamp()==null)dto.setUpdateDate(new Date());
			dto.setRevisionCount(Long.valueOf(0));
			if (dto.getCreatedTimestamp()==null)dto.setCreatedTimestamp(new Date());
			if (webAdeAuthentication != null && webAdeAuthentication.getUserId() != null) dto.setUpdateUser(webAdeAuthentication.getUserId());
			if (webAdeAuthentication != null && webAdeAuthentication.getUserId() != null) dto.setCreateUser(webAdeAuthentication.getUserId());
			
			this.externalUriDao.insert(dto);
		} catch (DaoException e) {
			throw new ServiceException("DAO threw an exception", e);
		}
		
		ExternalUriDto updatedDto = this.externalUriDao.fetch(dto.getExternalUriGuid());

		result = this.externalUriFactory.getExternalUri(updatedDto, factoryContext);
		return result;
	}
	
	private ExternalUriResource updateExternalUri(ExternalUriResource publishedIncident, WebAdeAuthentication webAdeAuthentication, FactoryContext factoryContext) throws DaoException {
		
		ExternalUriResource result = null;
		ExternalUriDto dto = new ExternalUriDto(publishedIncident);
		try {
			if (dto.getCreateDate()==null)dto.setCreateDate(new Date());
			if (dto.getCreatedTimestamp()==null)dto.setUpdateDate(new Date());
			if (dto.getCreatedTimestamp()==null)dto.setCreatedTimestamp(new Date());
			if (webAdeAuthentication != null && webAdeAuthentication.getUserId() != null) dto.setUpdateUser(webAdeAuthentication.getUserId());
			if (webAdeAuthentication != null && webAdeAuthentication.getUserId() != null) dto.setCreateUser(webAdeAuthentication.getUserId());
			
			this.externalUriDao.update(dto);
		} catch (DaoException e) {
			throw new ServiceException("DAO threw an exception", e);
		}
		
		ExternalUriDto updatedDto = this.externalUriDao.fetch(dto.getExternalUriGuid());

		result = this.externalUriFactory.getExternalUri(updatedDto, factoryContext);
		return result;
	}
	
	
	@Override
	public void deleteExternalUri(String externalUriGuid, FactoryContext factoryContext) throws NotFoundException, ConflictException{
		logger.debug("<deleteExternalUri");
		
		try {
			ExternalUriDto dto = this.externalUriDao.fetch(externalUriGuid);
			
			if(dto==null) {
				throw new NotFoundException("Did not find the externalUri: "+externalUriGuid);
			}
			
			this.externalUriDao.delete(externalUriGuid, getWebAdeAuthentication().getUserId());

		} catch (IntegrityConstraintViolatedDaoException e) {
			throw new ConflictException(e.getMessage());
		} catch (OptimisticLockingFailureDaoException e) {
			throw new ConflictException(e.getMessage());
		} catch (NotFoundDaoException e) {
			throw new NotFoundException(e.getMessage());
		} catch (DaoException e) {
			throw new ServiceException("DAO threw an exception", e);
		}

		logger.debug(">deleteExternalUri");
	}
	
	@Override
	public ExternalUriListResource getExternalUriList(String sourceObjectUniqueId, Integer pageNumber, 
			Integer pageRowCount, FactoryContext factoryContext) {
		ExternalUriListResource results = null;
		PagedDtos<ExternalUriDto> externalUriList = null;
		try {
			//if sourceObjectUniqueId is null return all
			if(sourceObjectUniqueId!=null) {
				externalUriList = this.externalUriDao.select(sourceObjectUniqueId, pageNumber, pageRowCount);
			}else externalUriList = this.externalUriDao.fetchAll(pageNumber, pageRowCount);
			results = this.externalUriFactory.getExternalUriList(externalUriList, pageNumber, pageRowCount, factoryContext);
		}catch(DaoException e) {
			throw new ServiceException("DAO threw an exception", e);
		}
		
		return results;
	}
	
     
}
