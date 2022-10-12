package ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.impl;

import java.util.List;

import javax.ws.rs.core.GenericEntity;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import ca.bc.gov.nrs.common.service.ConflictException;
import ca.bc.gov.nrs.common.service.ForbiddenException;
import ca.bc.gov.nrs.common.service.NotFoundException;
import ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.PublicPublishedIncidentEndpoint;
import ca.bc.gov.nrs.wfnews.api.rest.v1.parameters.PagingQueryParameters;
import ca.bc.gov.nrs.wfnews.api.rest.v1.parameters.validation.ParameterValidator;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.PublishedIncidentListResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.PublishedIncidentResource;
import ca.bc.gov.nrs.wfnews.service.api.v1.IncidentsService;
import ca.bc.gov.nrs.wfone.common.model.Message;
import ca.bc.gov.nrs.wfone.common.rest.endpoints.BaseEndpointsImpl;

public class PublicPublishedIncidentEndpointImpl extends BaseEndpointsImpl implements PublicPublishedIncidentEndpoint {
	
	private static final Logger logger = LoggerFactory.getLogger(PublicPublishedIncidentEndpointImpl.class);
	
	@Autowired
	private IncidentsService incidentsService;
	
	@Autowired
	private ParameterValidator parameterValidator;
	
	@Override
	public Response getPublishedIncidentList(String pageNumber, String pageRowCount) throws NotFoundException, ForbiddenException, ConflictException {
		Response response = null;
		
		try {
			PagingQueryParameters parameters = new PagingQueryParameters();
			
			Integer pageNum = null;
			Integer rowCount = null;
			
			if (pageNumber!=null)pageNum = Integer.parseInt(pageNumber);
			if (pageRowCount!=null)rowCount = Integer.parseInt(pageRowCount);

			parameters.setPageNumber(pageNumber);
			parameters.setPageRowCount(pageRowCount);
			
			List<Message> validationMessages = this.parameterValidator.validatePagingQueryParameters(parameters);

			if (!validationMessages.isEmpty()) {
				response = Response.status(Status.BAD_REQUEST).entity(validationMessages).build();
			}else {
				PublishedIncidentListResource results = incidentsService.getPublishedIncidentList(pageNum, rowCount, getFactoryContext());

				GenericEntity<PublishedIncidentListResource> entity = new GenericEntity<PublishedIncidentListResource>(results) {
					/* do nothing */
				};

				response = Response.ok(entity).tag(results.getUnquotedETag()).build();
			}
				
		} catch (Throwable t) {
			response = getInternalServerErrorResponse(t);
		}
		
		logResponse(response);

		return response;
	}
	
	@Override
	public Response getPublishedIncident(String publishedIncidentDetailGuid) throws NotFoundException, ForbiddenException, ConflictException {
		Response response = null;
				
		try {
			PublishedIncidentResource results = incidentsService.getPublishedIncident(publishedIncidentDetailGuid, getWebAdeAuthentication(), getFactoryContext());
			GenericEntity<PublishedIncidentResource> entity = new GenericEntity<PublishedIncidentResource>(results) {

			};

			response = Response.ok(entity).tag(results.getUnquotedETag()).build();
		} catch (Throwable t) {
			response = getInternalServerErrorResponse(t);
		}
		
		logResponse(response);

		return response;
	}

	@Override
	public Response getPublishedIncidentListAsFeatures(String stageOfControl) throws NotFoundException, ForbiddenException, ConflictException {
		Response response = null;
		
		try {
			PagingQueryParameters parameters = new PagingQueryParameters();
			
			Integer pageNum = 1;
			Integer rowCount = 999999; // I don't expect we'll ever have 100000 fires... May need confifuration
			
			List<Message> validationMessages = this.parameterValidator.validatePagingQueryParameters(parameters);

			if (!validationMessages.isEmpty()) {
				response = Response.status(Status.BAD_REQUEST).entity(validationMessages).build();
			}else {
				PublishedIncidentListResource results = incidentsService.getPublishedIncidentList(pageNum, rowCount, getFactoryContext());

				// convert to a GeoJson feature collection
				String featureJson = "";

				StringBuilder sb = new StringBuilder();
				sb.append("{\"type\":\"FeatureCollection\",\"features\":[");
				for (PublishedIncidentResource feature : results.getCollection()) {
					if ((stageOfControl == null && !feature.getStageOfControlCode().equalsIgnoreCase("OUT")) || 
					    (stageOfControl != null && stageOfControl.equals("FIRE_OF_NOTE") && feature.getFireOfNoteInd().equalsIgnoreCase("T")) || 
							(stageOfControl != null && stageOfControl.equals("FIRE_OF_NOTE") && feature.getFireOfNoteInd().equalsIgnoreCase("1")) ||
							feature.getStageOfControlCode().equalsIgnoreCase(stageOfControl)) {
						sb.append("{\"type\": \"Feature\",\"geometry\": {\"type\": \"Point\",\"coordinates\": [" + feature.getLongitude() + "," + feature.getLatitude() + "]},");
						// properties
						sb.append("\"properties\":{");
						sb.append("\"contactEmailAddress\": \"" + feature.getContactEmailAddress() + "\",");
						sb.append("\"contactPhoneNumber\": \"" + feature.getContactPhoneNumber() + "\",");
						sb.append("\"fireOfNote\": \"" + feature.getFireOfNoteInd() + "\",");
						sb.append("\"heavyEquipmentDetail\": \"" + feature.getHeavyEquipmentResourcesDetail() + "\",");
						sb.append("\"heavyEquipmentInd\": \"" + feature.getHeavyEquipmentResourcesInd() + "\",");
						sb.append("\"causeDetail\": \"" + feature.getIncidentCauseDetail() + "\",");
						sb.append("\"location\": \"" + feature.getIncidentLocation() + "\",");
						sb.append("\"incidentManagementCrewDetail\": \"" + feature.getIncidentMgmtCrewRsrcDetail() + "\",");
						sb.append("\"incidentManagementCrewInd\": \"" + feature.getIncidentMgmtCrewRsrcInd() + "\",");
						sb.append("\"incidentName\": \"" + feature.getIncidentName() + "\",");
						sb.append("\"incidentNumberLabel\": \"" + feature.getIncidentNumberLabel() + "\",");
						sb.append("\"incidentOverview\": \"" + feature.getIncidentOverview() + "\",");
						sb.append("\"incidentSizeDetail\": \"" + feature.getIncidentSizeDetail() + "\",");
						sb.append("\"incidentSizeType\": \"" + feature.getIncidentSizeType() + "\",");
						sb.append("\"guid\": \"" + feature.getPublishedIncidentDetailGuid() + "\",");
						sb.append("\"resourceDetail\": \"" + feature.getResourceDetail() + "\",");
						sb.append("\"stageOfControl\": \"" + feature.getStageOfControlCode() + "\",");
						sb.append("\"structureProtectionDetail\": \"" + feature.getStructureProtectionRsrcDetail() + "\",");
						sb.append("\"structureProtectionInd\": \"" + feature.getStructureProtectionRsrcInd() + "\",");
						sb.append("\"traditionalTerritoryDetail\": \"" + feature.getTraditionalTerritoryDetail() + "\",");
						sb.append("\"aviationDetail\": \"" + feature.getWildfireAviationResourceDetail() + "\",");
						sb.append("\"aviationInd\": \"" + feature.getWildfireAviationResourceInd() + "\",");
						sb.append("\"crewResourceDetail\": \"" + feature.getWildfireCrewResourcesDetail() + "\",");
						sb.append("\"crewResourceInd\": \"" + feature.getWildfireCrewResourcesInd() + "\",");
						sb.append("\"contactOrgUnit\": \"" + feature.getContactOrgUnitIdentifer() + "\",");
						sb.append("\"fireZoneOrgUnit\": \"" + feature.getFireZoneUnitIdentifier() + "\",");
						sb.append("\"generalIncidentCauseId\": \"" + feature.getGeneralIncidentCauseCatId() + "\",");
						sb.append("\"sizeMappedHa\": \"" + feature.getIncidentSizeMappedHa() + "\",");
						sb.append("\"sizeEstimatedHa\": \"" + feature.getIncidentSizeEstimatedHa() + "\",");
						sb.append("\"discoveryData\": \"" + feature.getDiscoveryDate() + "\"");
						sb.append("}");
						// fin
						sb.append("},");
					}
				}

				// remove any trailing comma and close
				featureJson = sb.toString();
				if (featureJson.endsWith(",")) {
					featureJson = featureJson.substring(0, featureJson.length() - 1);
				}
				featureJson += "]}";

				GenericEntity<String> entity = new GenericEntity<String>(featureJson) {
					/* do nothing */
				};

				response = Response.ok(entity).build();
			}
				
		} catch (Throwable t) {
			response = getInternalServerErrorResponse(t);
		}
		
		logResponse(response);

		return response;
	}
}
