package ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.impl;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
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
import ca.bc.gov.nrs.wfone.common.model.MessageImpl;
import ca.bc.gov.nrs.wfone.common.rest.endpoints.BaseEndpointsImpl;

public class PublicPublishedIncidentEndpointImpl extends BaseEndpointsImpl implements PublicPublishedIncidentEndpoint {
	
	private static final Logger logger = LoggerFactory.getLogger(PublicPublishedIncidentEndpointImpl.class);
	
	@Autowired
	private IncidentsService incidentsService;
	
	@Autowired
	private ParameterValidator parameterValidator;
	
	@Override
	public Response getPublishedIncidentList(String searchText, String pageNumber, String pageRowCount, String orderBy, Boolean fireOfNote, List<String> stageOfControlList, Boolean newFires, String fireCentreCode, String fireCentreName, String fromCreateDateString, String toCreateDateString, String fromDiscoveryDateString, String toDiscoveryDateString, String bbox, Double latitude, Double longitude, Integer fireYear, Double radius) throws NotFoundException, ForbiddenException, ConflictException {
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

			Date fromCreateDate = null;
			if (fromCreateDateString != null && !fromCreateDateString.isEmpty()) {
				fromCreateDate = toSimpleFormatDate(fromCreateDateString);
			}
			
			Date toCreateDate = null;
			if (toCreateDateString != null && !toCreateDateString.isEmpty()) {
				toCreateDate = toSimpleFormatDate(toCreateDateString);
			}

			Date fromDiscoveryDate = null;
			if (fromDiscoveryDateString != null && !fromDiscoveryDateString.isEmpty()) {
				fromDiscoveryDate = toSimpleFormatDate(fromDiscoveryDateString);
			}

			Date toDiscoveryDate = null;
			if (toDiscoveryDateString != null && !toDiscoveryDateString.isEmpty()) {
				toDiscoveryDate = toSimpleFormatDate(toDiscoveryDateString);
			}
			
			if (bbox != null) {
				String[] coords = bbox.split(",");
				boolean invalidBox = false;
				if (coords.length != 4) {
					invalidBox = true;
				} else {
					for (String coord : coords) {
						try {
							Double.parseDouble(coord);
						} catch (Exception e) {
							invalidBox = true;
							break;
						}
					}
				}

				if (invalidBox) {
					Message message = new MessageImpl();
					message.setPath("bbox");
					message.setMessage("BBox contains invalid coordinate set");
					validationMessages.add(message);
					bbox = null;
				}
			}

			if (!validationMessages.isEmpty()) {
				response = Response.status(Status.BAD_REQUEST).entity(validationMessages).build();
			}else {

				if (stageOfControlList == null) {
					stageOfControlList = new ArrayList<>();
					// Should we supply a default set if this is ignored?
					stageOfControlList.add("OUT_CNTRL");
          stageOfControlList.add("HOLDING");
          stageOfControlList.add("UNDR_CNTRL");
				}

				PublishedIncidentListResource results = incidentsService.getPublishedIncidentList(searchText, pageNum, rowCount, orderBy, fireOfNote, stageOfControlList, newFires, fireCentreCode, fireCentreName, fromCreateDate, toCreateDate, fromDiscoveryDate, toDiscoveryDate, bbox, latitude, longitude, fireYear, radius, getFactoryContext());

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
	public Response getPublishedIncident(String publishedIncidentDetailGuid, Integer fireYear) throws NotFoundException, ForbiddenException, ConflictException {
		Response response = null;
				
		try {
			// publishedIncidentDetailGuid can also be the fire number or fire name
			PublishedIncidentResource results = incidentsService.getPublishedIncident(publishedIncidentDetailGuid, fireYear, getWebAdeAuthentication(), getFactoryContext());
			GenericEntity<PublishedIncidentResource> entity = new GenericEntity<PublishedIncidentResource>(results) {

			};

			response = Response.ok(entity).tag(results.getUnquotedETag()).build();
		
		} catch (NotFoundException e) {
			response = Response.status(Status.NOT_FOUND).build();	
		} catch (Throwable t) {
			response = getInternalServerErrorResponse(t);
		}
		
		logResponse(response);

		return response;
	}
	
	@Override
	public Response getPublishedIncidentByIncidentGuid(String incidentGuid) throws NotFoundException, ForbiddenException, ConflictException {
		Response response = null;
				
		try {
			PublishedIncidentResource results = incidentsService.getPublishedIncidentByIncidentGuid(incidentGuid, getWebAdeAuthentication(), getFactoryContext());
			GenericEntity<PublishedIncidentResource> entity = new GenericEntity<PublishedIncidentResource>(results) {

			};

			response = Response.ok(entity).tag(results.getUnquotedETag()).build();
		
		} catch (NotFoundException e) {
			response = Response.status(Status.NOT_FOUND).build();	
		} catch (Throwable t) {
			response = getInternalServerErrorResponse(t);
		}
		
		logResponse(response);

		return response;
	}

	@Override
	public Response getPublishedIncidentListAsFeatures(String stageOfControl, String bbox) throws NotFoundException, ForbiddenException, ConflictException {
		Response response = null;

		if (bbox == null) {
			bbox = "-139.06,48.30,-114.03,60.00";
		}

		String[] coords = bbox.split(",");
		boolean invalidBox = false;
		if (coords.length != 4) {
			invalidBox = true;
		} else {
			for (String coord : coords) {
				try {
					Double.parseDouble(coord);
				} catch (Exception e) {
					invalidBox = true;
					break;
				}
			}
		}

		List<Message> validationMessages = new ArrayList<>();

		if (invalidBox) {
			Message message = new MessageImpl();
			message.setPath("bbox");
			message.setMessage("BBox contains invalid coordinate set");
			validationMessages.add(message);
		}

		if (!validationMessages.isEmpty()) {
			response = Response.status(Status.BAD_REQUEST).entity(validationMessages).build();
		} else {
			try {
				String json = "";
				if (stageOfControl == null || stageOfControl.equalsIgnoreCase("FIRE_OF_NOTE")) {
					json = incidentsService.getFireOfNoteAsJson(bbox, getWebAdeAuthentication(), getFactoryContext());
				} else {
					json = incidentsService.getPublishedIncidentsAsJson(stageOfControl, bbox, getWebAdeAuthentication(), getFactoryContext());
				}
				GenericEntity<String> entity = new GenericEntity<String>(json) {
					/* do nothing */
				};
				response = Response.ok(entity).build();
			} catch (Throwable t) {
				response = getInternalServerErrorResponse(t);
			}
		}
		
		logResponse(response);

		return response;
	}
	
	private Date toSimpleFormatDate(String dateString) throws ParseException {
		return new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSSSSS").parse(dateString);
	}
}
