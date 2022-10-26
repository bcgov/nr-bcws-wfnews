package ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.impl;

import java.net.URI;

import javax.ws.rs.core.EntityTag;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.ResponseBuilder;
import javax.ws.rs.core.Response.Status;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import ca.bc.gov.nrs.common.persistence.dao.DaoException;
import ca.bc.gov.nrs.wfone.common.rest.endpoints.BaseEndpointsImpl;
import ca.bc.gov.nrs.wfone.common.service.api.ServiceException;
import ca.bc.gov.nrs.common.service.ConflictException;
import ca.bc.gov.nrs.common.service.ForbiddenException;
import ca.bc.gov.nrs.common.service.NotFoundException;
import ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.PublishedIncidentEndpoint;
import ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.security.Scopes;
import ca.bc.gov.nrs.wfnews.api.rest.v1.parameters.validation.ParameterValidator;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.PublishedIncidentResource;
import ca.bc.gov.nrs.wfnews.api.model.v1.PublishedIncident;
import ca.bc.gov.nrs.wfnews.service.api.v1.IncidentsService;
import ca.bc.gov.nrs.wfnews.service.api.v1.validation.exception.ValidationException;

public class PublishedIncidentEndpointImpl extends BaseEndpointsImpl implements PublishedIncidentEndpoint {

	private static final Logger logger = LoggerFactory.getLogger(PublishedIncidentEndpointImpl.class);

	@Autowired
	private IncidentsService incidentsService;

	@Autowired
	private ParameterValidator parameterValidator;

	@Override
	public Response createPublishedIncident(PublishedIncidentResource publishedIncidentResource)
			throws ForbiddenException, ConflictException {

		Response response = null;

		logRequest();

		if (!hasAuthority(Scopes.CREATE_PUBLISHED_INCIDENT)) {
			return Response.status(Status.FORBIDDEN).build();
		}

		try {
			PublishedIncident publishedIncident = getPublishedIncidentFromResource(publishedIncidentResource);
			PublishedIncidentResource result = incidentsService.createPublishedWildfireIncident(publishedIncident,
					getFactoryContext());

			URI createdUri = URI.create(result.getSelfLink());

			response = Response.created(createdUri).entity(result).tag(result.getUnquotedETag()).build();

		} catch (DaoException e) {
			throw new ServiceException("DAO threw an exception", e);
		} catch (ValidationException e) {
			throw new ServiceException("FileService threw a validation exception", e);
		} catch (Throwable t) {
			response = getInternalServerErrorResponse(t);
		}

		logResponse(response);

		return response;
	}

	@Override
	public Response updatePublishedIncident(PublishedIncidentResource publishedIncidentResource, String incidentGuid)
			throws ForbiddenException, ConflictException {

		Response response = null;

		logRequest();

		if (!hasAuthority(Scopes.UPDATE_PUBLISHED_INCIDENT)) {
			return Response.status(Status.FORBIDDEN).build();
		}

		try {
			PublishedIncident publishedIncident = getPublishedIncidentFromResource(publishedIncidentResource);
			PublishedIncidentResource result = incidentsService.updatePublishedWildfireIncident(publishedIncident,
					getFactoryContext());

			URI createdUri = URI.create(result.getSelfLink());

			response = Response.created(createdUri).entity(result).tag(result.getUnquotedETag()).build();

		} catch (DaoException e) {
			throw new ServiceException("DAO threw an exception", e);
		} catch (ValidationException e) {
			throw new ServiceException("FileService threw a validation exception", e);
		} catch (Throwable t) {
			response = getInternalServerErrorResponse(t);
		}

		logResponse(response);

		return response;
	}

	@Override
	public Response flush() throws NotFoundException, ConflictException, DaoException {
		Response response = null;

		logRequest();

		if (!hasAuthority(Scopes.DELETE_PUBLISHED_INCIDENT)) {
			return Response.status(Status.FORBIDDEN).build();
		}

		try {
			incidentsService.flush(getFactoryContext());
			response = Response.status(204).build();
		} catch (ConflictException e) {
			response = Response.status(Status.CONFLICT).entity(e.getMessage()).build();
		} catch (NotFoundException e) {
			response = Response.status(Status.NOT_FOUND).build();
		} catch (Throwable t) {
			response = getInternalServerErrorResponse(t);
		}

		logResponse(response);

		logger.debug(">flush " + response.getStatus());

		return response;
	}

	@Override
	public Response deletePublishedIncident(String publishedIncidentDetailGuid)
			throws NotFoundException, ConflictException, DaoException {
		Response response = null;

		logRequest();

		if (!hasAuthority(Scopes.DELETE_PUBLISHED_INCIDENT)) {
			return Response.status(Status.FORBIDDEN).build();
		}

		try {
			PublishedIncidentResource current = incidentsService.getPublishedIncident(publishedIncidentDetailGuid,
					getWebAdeAuthentication(), getFactoryContext());

			EntityTag currentTag = EntityTag.valueOf(current.getQuotedETag());

			ResponseBuilder responseBuilder = this.evaluatePreconditions(currentTag);

			if (responseBuilder == null) {
				// Preconditions Are Met

				incidentsService.deletePublishedIncident(publishedIncidentDetailGuid, getFactoryContext());

				response = Response.status(204).build();
			} else {
				// Preconditions Are NOT Met

				response = responseBuilder.tag(currentTag).build();
			}
		} catch (ConflictException e) {
			response = Response.status(Status.CONFLICT).entity(e.getMessage()).build();
		} catch (NotFoundException e) {
			response = Response.status(Status.NOT_FOUND).build();
		} catch (Throwable t) {
			response = getInternalServerErrorResponse(t);
		}

		logResponse(response);

		logger.debug(">deletePublishedIncident " + response.getStatus());

		return response;
	}

	private PublishedIncident getPublishedIncidentFromResource(PublishedIncidentResource publishedIncidentResource) {

		PublishedIncident incident = new PublishedIncidentResource();
		incident.setPublishedIncidentDetailGuid(publishedIncidentResource.getPublishedIncidentDetailGuid());
		incident.setIncidentGuid(publishedIncidentResource.getIncidentGuid());
		incident.setIncidentNumberLabel(publishedIncidentResource.getIncidentNumberLabel());
		incident.setNewsCreatedTimestamp(publishedIncidentResource.getNewsCreatedTimestamp());
		incident.setStageOfControlCode(publishedIncidentResource.getStageOfControlCode());
		incident.setGeneralIncidentCauseCatId(publishedIncidentResource.getGeneralIncidentCauseCatId());
		incident.setNewsPublicationStatusCode(publishedIncidentResource.getNewsPublicationStatusCode());
		incident.setDiscoveryDate(publishedIncidentResource.getDiscoveryDate());
		incident.setFireZoneUnitIdentifier(publishedIncidentResource.getFireZoneUnitIdentifier());
		incident.setFireOfNoteInd(publishedIncidentResource.getFireOfNoteInd());
		incident.setIncidentName(publishedIncidentResource.getIncidentName());
		incident.setIncidentLocation(publishedIncidentResource.getIncidentLocation());
		incident.setIncidentOverview(publishedIncidentResource.getIncidentOverview());
		incident.setTraditionalTerritoryDetail(publishedIncidentResource.getTraditionalTerritoryDetail());
		incident.setIncidentSizeType(publishedIncidentResource.getIncidentSizeType());
		incident.setIncidentSizeEstimatedHa(publishedIncidentResource.getIncidentSizeEstimatedHa());
		incident.setIncidentSizeMappedHa(publishedIncidentResource.getIncidentSizeMappedHa());
		incident.setIncidentSizeDetail(publishedIncidentResource.getIncidentSizeDetail());
		incident.setIncidentCauseDetail(publishedIncidentResource.getIncidentCauseDetail());
		incident.setContactOrgUnitIdentifer(publishedIncidentResource.getContactOrgUnitIdentifer());
		incident.setContactPhoneNumber(publishedIncidentResource.getContactPhoneNumber());
		incident.setContactEmailAddress(publishedIncidentResource.getContactEmailAddress());
		incident.setResourceDetail(publishedIncidentResource.getResourceDetail());
		incident.setWildfireCrewResourcesInd(publishedIncidentResource.getWildfireCrewResourcesInd());
		incident.setWildfireCrewResourcesDetail(publishedIncidentResource.getWildfireCrewResourcesDetail());
		incident.setWildfireAviationResourceInd(publishedIncidentResource.getWildfireAviationResourceInd());
		incident.setWildfireAviationResourceDetail(publishedIncidentResource.getWildfireAviationResourceDetail());
		incident.setHeavyEquipmentResourcesInd(publishedIncidentResource.getHeavyEquipmentResourcesInd());
		incident.setHeavyEquipmentResourcesDetail(publishedIncidentResource.getHeavyEquipmentResourcesDetail());
		incident.setIncidentMgmtCrewRsrcInd(publishedIncidentResource.getIncidentMgmtCrewRsrcInd());
		incident.setIncidentMgmtCrewRsrcDetail(publishedIncidentResource.getIncidentMgmtCrewRsrcDetail());
		incident.setStructureProtectionRsrcInd(publishedIncidentResource.getStructureProtectionRsrcInd());
		incident.setStructureProtectionRsrcDetail(publishedIncidentResource.getStructureProtectionRsrcDetail());
		incident.setPublishedTimestamp(publishedIncidentResource.getPublishedTimestamp());
		incident.setPublishedUserTypeCode(publishedIncidentResource.getPublishedUserTypeCode());
		incident.setPublishedUserGuid(publishedIncidentResource.getPublishedUserGuid());
		incident.setPublishedUserUserId(publishedIncidentResource.getPublishedUserUserId());
		incident.setPublishedUserName(publishedIncidentResource.getPublishedUserName());
		incident.setLastUpdatedTimestamp(publishedIncidentResource.getLastUpdatedTimestamp());
		incident.setPublishedIncidentRevisionCount(publishedIncidentResource.getPublishedIncidentRevisionCount());
		incident.setCreateDate(publishedIncidentResource.getCreateDate());
		incident.setCreateUser(publishedIncidentResource.getCreateUser());
		incident.setUpdateDate(publishedIncidentResource.getUpdateDate());
		incident.setUpdateUser(publishedIncidentResource.getUpdateUser());
		incident.setLatitude(publishedIncidentResource.getLatitude());
		incident.setLongitude(publishedIncidentResource.getLongitude());
		incident.setFireCentre(publishedIncidentResource.getFireCentre());
		incident.setFireYear(publishedIncidentResource.getFireYear());
		incident.setDiscoveryDate(publishedIncidentResource.getDiscoveryDate());

		return incident;
	}

}