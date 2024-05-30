package ca.bc.gov.nrs.wfnews.service.api.v1.impl;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import ca.bc.gov.nrs.common.persistence.dao.DaoException;
import ca.bc.gov.nrs.common.persistence.dao.IntegrityConstraintViolatedDaoException;
import ca.bc.gov.nrs.common.persistence.dao.NotFoundDaoException;
import ca.bc.gov.nrs.common.persistence.dao.OptimisticLockingFailureDaoException;
import ca.bc.gov.nrs.common.service.ConflictException;
import ca.bc.gov.nrs.common.service.NotFoundException;
import ca.bc.gov.nrs.common.service.ServiceException;
import ca.bc.gov.nrs.common.service.ValidationFailureException;
import ca.bc.gov.nrs.wfnews.api.model.v1.PublishedIncident;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.AttachmentListResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.AttachmentResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.ExternalUriListResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.ExternalUriResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.PublishedIncidentListResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.PublishedIncidentResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.SituationReportListResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.SituationReportResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.StatisticsResource;
import ca.bc.gov.nrs.wfnews.persistence.v1.dao.AttachmentDao;
import ca.bc.gov.nrs.wfnews.persistence.v1.dao.ExternalUriDao;
import ca.bc.gov.nrs.wfnews.persistence.v1.dao.PublishedIncidentDao;
import ca.bc.gov.nrs.wfnews.persistence.v1.dao.SituationReportDao;
import ca.bc.gov.nrs.wfnews.persistence.v1.dao.StatisticsDao;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.AttachmentDto;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.ExternalUriDto;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.PagedDtos;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.PublishedIncidentDto;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.SituationReportDto;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.StatisticsDto;
import ca.bc.gov.nrs.wfnews.service.api.v1.IncidentsService;
import ca.bc.gov.nrs.wfnews.service.api.v1.model.factory.AttachmentFactory;
import ca.bc.gov.nrs.wfnews.service.api.v1.model.factory.ExternalUriFactory;
import ca.bc.gov.nrs.wfnews.service.api.v1.model.factory.PublishedIncidentFactory;
import ca.bc.gov.nrs.wfnews.service.api.v1.model.factory.SituationReportFactory;
import ca.bc.gov.nrs.wfnews.service.api.v1.model.factory.StatisticsFactory;
import ca.bc.gov.nrs.wfnews.service.api.v1.validation.ModelValidator;
import ca.bc.gov.nrs.wfnews.service.api.v1.validation.exception.ValidationException;
import ca.bc.gov.nrs.wfone.common.model.Message;
import ca.bc.gov.nrs.wfone.common.rest.endpoints.BaseEndpointsImpl;
import ca.bc.gov.nrs.wfone.common.service.api.model.factory.FactoryContext;
import ca.bc.gov.nrs.wfone.common.webade.authentication.WebAdeAuthentication;

public class IncidentsServiceImpl extends BaseEndpointsImpl implements IncidentsService {

	private static final Logger logger = LoggerFactory.getLogger(IncidentsServiceImpl.class);

	String topLevelRestURL;

	private PublishedIncidentFactory publishedIncidentFactory;
	private ExternalUriFactory externalUriFactory;
	private AttachmentFactory attachmentFactory;
	private SituationReportFactory situationReportFactory;
	private StatisticsFactory statisticsFactory;

	private PublishedIncidentDao publishedIncidentDao;
	private AttachmentDao attachmentDao;
	private ExternalUriDao externalUriDao;
	private SituationReportDao situationReportDao;
	private StatisticsDao statisticsDao;

	@Autowired
	private ModelValidator modelValidator;

	public void setTopLevelRestURL(String topLevelRestURL) {
		this.topLevelRestURL = topLevelRestURL;
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

	public void setAttachmentDao(AttachmentDao attachmentDao) {
		this.attachmentDao = attachmentDao;
	}

	public void setAttachmentFactory(AttachmentFactory attachmentFactory) {
		this.attachmentFactory = attachmentFactory;
	}

	public void setExternalUriDao(ExternalUriDao externalUriDao) {
		this.externalUriDao = externalUriDao;
	}

	public void setSituationReportDao(SituationReportDao situationReportDao) {
		this.situationReportDao = situationReportDao;
	}

	public void setSituationReportFactory(SituationReportFactory situationReportFactory) {
		this.situationReportFactory = situationReportFactory;
	}

	public void setStatisticsDao(StatisticsDao statisticsDao) {
		this.statisticsDao = statisticsDao;
	}

	public void setStatisticsFactory(StatisticsFactory statisticsFactory) {
		this.statisticsFactory = statisticsFactory;
	}

	@Override
	public PublishedIncidentResource createPublishedWildfireIncident(PublishedIncident publishedIncident,
			FactoryContext factoryContext)
			throws ValidationFailureException, ConflictException, NotFoundException, Exception {
		logger.debug("<createupdatePublishedWildfireIncident");
		PublishedIncidentResource response = null;

		long effectiveAsOfMillis = publishedIncident.getDiscoveryDate() == null ? System.currentTimeMillis()
				: publishedIncident.getDiscoveryDate().getTime();

		try {
			List<Message> errors = this.modelValidator.validatePublishedIncident(publishedIncident,
					effectiveAsOfMillis);

			if (!errors.isEmpty()) {
				throw new ValidationException(errors);
			}

			PublishedIncidentResource result = new PublishedIncidentResource();

			publishedIncident.setPublishedTimestamp(new Date());

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
			throw new ServiceException(e.getMessage(), e);
		} catch (Exception e) {
			throw new Exception(e.getMessage(), e);
		}

		logger.debug(">createPublishedWildfireIncident");
		return response;

	}

	@Override
	public PublishedIncidentResource updatePublishedWildfireIncident(PublishedIncident publishedIncident,
			FactoryContext factoryContext)
			throws ValidationFailureException, ConflictException, NotFoundException, Exception {
		logger.debug("<updatePublishedWildfireIncident");
		PublishedIncidentResource response = null;

		long effectiveAsOfMillis = publishedIncident.getDiscoveryDate() == null ? System.currentTimeMillis()
				: publishedIncident.getDiscoveryDate().getTime();

		try {
			List<Message> errors = this.modelValidator.validatePublishedIncident(publishedIncident,
					effectiveAsOfMillis);

			if (!errors.isEmpty()) {
				throw new ValidationException(errors);
			}

			PublishedIncidentResource result = new PublishedIncidentResource();
			publishedIncident.setPublishedTimestamp(new Date());
			PublishedIncidentResource currentWildfireIncident = (PublishedIncidentResource) getPublishedIncident(
					publishedIncident.getPublishedIncidentDetailGuid(), publishedIncident.getFireYear(),
					getWebAdeAuthentication(),
					factoryContext);

			if (currentWildfireIncident != null) {
				result = (PublishedIncidentResource) updatePublishedWildfireIncident(
						publishedIncident,
						getWebAdeAuthentication(),
						factoryContext);
			} else {
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
			throw new ServiceException(e.getMessage(), e);
		} catch (Exception e) {
			throw new Exception(e.getMessage(), e);
		}

		logger.debug(">updatePublishedWildfireIncident");
		return response;

	}

	private PublishedIncidentResource updatePublishedWildfireIncident(PublishedIncident publishedIncident,
			WebAdeAuthentication webAdeAuthentication, FactoryContext factoryContext)
			throws DaoException, NotFoundException {

		PublishedIncidentResource result = null;
		PublishedIncidentResource currentPublishedIncidentResource = getPublishedIncident(
				publishedIncident.getPublishedIncidentDetailGuid(), null, webAdeAuthentication, factoryContext);

		// if the incident is "out", strip out all of the extra published details
		if (publishedIncident.getStageOfControlCode().equalsIgnoreCase("OUT")) {
			publishedIncident.setAviationResourceCount(null);
			publishedIncident.setCrewResourceCount(null);
			publishedIncident.setFireOfNoteInd(false);
			publishedIncident.setWildfireCrewResourcesInd(false);
			publishedIncident.setWildfireAviationResourceInd(false);
			publishedIncident.setHeavyEquipmentResourcesInd(false);
			publishedIncident.setIncidentMgmtCrewRsrcInd(false);
			publishedIncident.setStructureProtectionRsrcInd(false);
			publishedIncident.setIncidentOverview(null);
			publishedIncident.setResourceDetail(null);
			publishedIncident.setWildfireCrewResourcesDetail(null);
			publishedIncident.setWildfireAviationResourceDetail(null);
			publishedIncident.setHeavyEquipmentResourcesDetail(null);
			publishedIncident.setIncidentMgmtCrewRsrcDetail(null);
			publishedIncident.setStructureProtectionRsrcDetail(null);
			publishedIncident.setHeavyEquipmentResourceCount(null);
			publishedIncident.setIncidentManagementResourceCount(null);
			publishedIncident.setStructureProtectionResourceCount(null);
		}

		PublishedIncidentDto dto = new PublishedIncidentDto(publishedIncident);

		try {
			dto.setUpdateDate(new Date());
			if (webAdeAuthentication != null && webAdeAuthentication.getUserId() != null)
				dto.setUpdateUser(webAdeAuthentication.getUserId());
			if (dto.getCreateUser() == null && webAdeAuthentication != null && webAdeAuthentication.getUserId() != null)
				dto.setCreateUser(webAdeAuthentication.getUserId());
			// use createDate from current incident as this should not change.
			// otherwise use discoveryDate or if that is somehow null, use create date in payload
			if (currentPublishedIncidentResource != null) {
				dto.setCreateDate(currentPublishedIncidentResource.getCreateDate() != null
						? currentPublishedIncidentResource.getCreateDate()
						: currentPublishedIncidentResource.getDiscoveryDate());
			} else if (dto.getCreateDate() != null) {
				dto.setCreateDate(dto.getCreateDate());
			} else dto.setCreateDate(new Date());

			this.publishedIncidentDao.update(dto);
		} catch (DaoException e) {
			throw new ServiceException(e.getMessage(), e);
		}

		PublishedIncidentDto updatedDto = this.publishedIncidentDao.fetch(dto.getPublishedIncidentDetailGuid(),
				dto.getFireYear());

		result = this.publishedIncidentFactory.getPublishedWildfireIncident(updatedDto, factoryContext);
		return result;
	}

	private PublishedIncidentResource createPublishedWildfireIncident(PublishedIncident publishedIncident,
			WebAdeAuthentication webAdeAuthentication, FactoryContext factoryContext) throws DaoException {

		PublishedIncidentResource result = null;
		PublishedIncidentDto dto = new PublishedIncidentDto(publishedIncident);
		try {
			dto.setUpdateDate(new Date());
			dto.setRevisionCount(Long.valueOf(0));
			if (webAdeAuthentication != null && webAdeAuthentication.getUserId() != null)
				dto.setUpdateUser(webAdeAuthentication.getUserId());
			if (dto.getCreateUser() == null && webAdeAuthentication != null && webAdeAuthentication.getUserId() != null)
				dto.setCreateUser(webAdeAuthentication.getUserId());
			// discoveryDate should be the same as createDate at this point.
			// discoveryDate is mandatory in WFIM so it shouldn't be null.
			if (dto.getDiscoveryDate() != null) {
				dto.setCreateDate(dto.getDiscoveryDate());
			}else if(dto.getCreateDate() != null) {
				dto.setCreateDate(dto.getCreateDate());
			}else dto.setCreateDate(new Date());
			
			this.publishedIncidentDao.insert(dto);
		} catch (DaoException e) {
			throw new ServiceException(e.getMessage(), e);
		}

		PublishedIncidentDto updatedDto = this.publishedIncidentDao.fetch(dto.getPublishedIncidentDetailGuid(),
				dto.getFireYear());

		result = this.publishedIncidentFactory.getPublishedWildfireIncident(updatedDto, factoryContext);
		return result;
	}

	@Override
	public String getPublishedIncidentsAsJson(String stageOfControl, String bbox,
			WebAdeAuthentication webAdeAuthentication, FactoryContext factoryContext) throws DaoException {
		return this.publishedIncidentDao.selectAsJson(stageOfControl, bbox);
	}

	@Override
	public String getFireOfNoteAsJson(String bbox, WebAdeAuthentication webAdeAuthentication,
			FactoryContext factoryContext) throws DaoException {
		return this.publishedIncidentDao.selectFireOfNoteAsJson(bbox);
	}

	@Override
	public PublishedIncidentResource getPublishedIncident(String publishedIncidentDetailGuid, Integer fireYear,
			WebAdeAuthentication webAdeAuthentication, FactoryContext factoryContext)
			throws DaoException, NotFoundException {

		PublishedIncidentResource result = null;
		PublishedIncidentDto fetchedDto = this.publishedIncidentDao.fetch(publishedIncidentDetailGuid, fireYear);
		if (fetchedDto != null) {
			result = this.publishedIncidentFactory.getPublishedWildfireIncident(fetchedDto, factoryContext);
		} else
			throw new NotFoundException("Did not find the publishedIncidentDetailGuid: " + publishedIncidentDetailGuid);
		return result;
	}

	@Override
	public PublishedIncidentResource getPublishedIncidentByIncidentGuid(String incidentGuid,
			WebAdeAuthentication webAdeAuthentication, FactoryContext factoryContext)
			throws DaoException, NotFoundException {

		PublishedIncidentResource result = null;
		PublishedIncidentDto fetchedDto = this.publishedIncidentDao.fetchForIncidentGuid(incidentGuid);
		if (fetchedDto != null) {
			result = this.publishedIncidentFactory.getPublishedWildfireIncident(fetchedDto, factoryContext);
		} else
			throw new NotFoundException("Did not find the publishedIncidentDetailGuid: " + incidentGuid);
		return result;
	}

	@Override
	public void flush(FactoryContext factoryContext) throws NotFoundException, ConflictException {
		try {
			this.publishedIncidentDao.flush();
			this.externalUriDao.flush();
			this.attachmentDao.flush();
		} catch (Exception e) {
			throw new ServiceException(e.getMessage(), e);
		}
	}

	@Override
	public void deletePublishedIncident(String publishedIncidentDetailGuid, FactoryContext factoryContext)
			throws NotFoundException, ConflictException {
		logger.debug("<deletePublishedIncident");

		try {

			PublishedIncidentDto dto = this.publishedIncidentDao.fetch(publishedIncidentDetailGuid, null);

			if (dto == null) {
				throw new NotFoundException("Did not find the PublishedIncident: " + publishedIncidentDetailGuid);
			}

			this.publishedIncidentDao.delete(publishedIncidentDetailGuid);

		} catch (IntegrityConstraintViolatedDaoException e) {
			throw new ConflictException(e.getMessage());
		} catch (OptimisticLockingFailureDaoException e) {
			throw new ConflictException(e.getMessage());
		} catch (NotFoundDaoException e) {
			throw new NotFoundException(e.getMessage());
		} catch (DaoException e) {
			throw new ServiceException(e.getMessage(), e);
		}

		logger.debug(">deletePublishedIncident");
	}

	@Override
	public PublishedIncidentListResource getPublishedIncidentList(String searchText, Integer pageNumber,
			Integer pageRowCount, String orderBy, Boolean fireOfNote, List<String> stageOfControlList, Boolean newFires,
			String fireCentreCode, String fireCentreName, Date fromCreateDate, Date toCreateDate,
			Date fromDiscoveryDate, Date toDiscoveryDate, String bbox,
			Double latitude, Double longitude, Integer fireYear, Double radius, FactoryContext factoryContext) {
		PublishedIncidentListResource results = null;
		PagedDtos<PublishedIncidentDto> publishedIncidentList = new PagedDtos<>();
		try {

			List<String> orderByList = new ArrayList<>();
			if (orderBy != null && orderBy.split(",").length > 0) {
				for (String orderbyString : orderBy.split(",")) {
					String daoDirection = null;
					String daoOrderByString = "";
					String[] split = orderbyString.split("\\s+");

					if (split != null && split.length > 0) {
						daoOrderByString = split[0];
					}

					if (split != null && daoOrderByString.length() > 0) {
						if (split.length > 1) {
							String direction = split[1];
							if (direction.equalsIgnoreCase("desc") || direction.equalsIgnoreCase("descending")) {
								daoDirection = "DESC";
							} else {
								daoDirection = "ASC";
							}
						} else {
							daoDirection = "ASC";
						}

						orderByList.add(daoOrderByString);
						orderByList.add(daoDirection);
					}
				}
			}

			publishedIncidentList = this.publishedIncidentDao.select(searchText, pageNumber, pageRowCount, orderByList,
					fireOfNote, stageOfControlList, newFires, fireCentreCode, fireCentreName, fromCreateDate,
					toCreateDate, fromDiscoveryDate, toDiscoveryDate, bbox, latitude, longitude, fireYear, radius);
			results = this.publishedIncidentFactory.getPublishedIncidentList(publishedIncidentList, pageNumber,
					pageRowCount,
					factoryContext);
		} catch (DaoException e) {
			throw new ServiceException(e.getMessage(), e);
		}

		return results;
	}

	@Override
	public ExternalUriResource createExternalUri(ExternalUriResource externalUri, FactoryContext factoryContext)
			throws ValidationFailureException, ConflictException, NotFoundException, Exception {
		ExternalUriResource response = null;
		long effectiveAsOfMillis = externalUri.getCreateDate() == null ? System.currentTimeMillis()
				: externalUri.getCreateDate().getTime();
		try {
			List<Message> errors = this.modelValidator.validateExternalUri(externalUri, effectiveAsOfMillis);
			if (!errors.isEmpty()) {
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
			throw new ServiceException(e.getMessage(), e);
		} catch (Exception e) {
			throw new Exception(e.getMessage(), e);
		}

		logger.debug(">PublishedWildfireIncident");
		return response;

	}

	@Override
	public ExternalUriResource updateExternalUri(ExternalUriResource externalUri, FactoryContext factoryContext)
			throws ValidationFailureException, ConflictException, NotFoundException, Exception {
		ExternalUriResource response = null;
		long effectiveAsOfMillis = externalUri.getCreateDate() == null ? System.currentTimeMillis()
				: externalUri.getCreateDate().getTime();
		try {
			List<Message> errors = this.modelValidator.validateExternalUri(externalUri, effectiveAsOfMillis);
			if (!errors.isEmpty()) {
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
			} else {
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
			throw new ServiceException(e.getMessage(), e);
		} catch (Exception e) {
			throw new Exception(e.getMessage(), e);
		}

		logger.debug(">PublishedWildfireIncident");
		return response;

	}

	@Override
	public ExternalUriResource getExternalUri(String externalUriGuid, WebAdeAuthentication webAdeAuthentication,
			FactoryContext factoryContext) throws DaoException, NotFoundException {

		ExternalUriResource result = null;
		ExternalUriDto fetchedDto = this.externalUriDao.fetch(externalUriGuid);
		if (fetchedDto != null) {
			result = this.externalUriFactory.getExternalUri(fetchedDto, factoryContext);
		} else
			throw new NotFoundException("Did not find the externalUriGuid: " + externalUriGuid);
		return result;
	}

	private ExternalUriResource createExternalUri(ExternalUriResource publishedIncident,
			WebAdeAuthentication webAdeAuthentication, FactoryContext factoryContext) throws DaoException {

		ExternalUriResource result = null;
		ExternalUriDto dto = new ExternalUriDto(publishedIncident);
		try {
			dto.setCreateDate(new Date());
			dto.setUpdateDate(new Date());
			dto.setRevisionCount(Long.valueOf(0));
			if (dto.getCreatedTimestamp() == null)
				dto.setCreatedTimestamp(new Date());
			if (webAdeAuthentication != null && webAdeAuthentication.getUserId() != null)
				dto.setUpdateUser(webAdeAuthentication.getUserId());
			if (webAdeAuthentication != null && webAdeAuthentication.getUserId() != null)
				dto.setCreateUser(webAdeAuthentication.getUserId());

			this.externalUriDao.insert(dto);
		} catch (DaoException e) {
			throw new ServiceException(e.getMessage(), e);
		}

		ExternalUriDto updatedDto = this.externalUriDao.fetch(dto.getExternalUriGuid());

		result = this.externalUriFactory.getExternalUri(updatedDto, factoryContext);
		return result;
	}

	private ExternalUriResource updateExternalUri(ExternalUriResource publishedIncident,
			WebAdeAuthentication webAdeAuthentication, FactoryContext factoryContext) throws DaoException {

		ExternalUriResource result = null;
		ExternalUriDto dto = new ExternalUriDto(publishedIncident);
		try {
			dto.setUpdateDate(new Date());
			if (dto.getCreateDate() == null)
				dto.setCreateDate(new Date());
			if (dto.getCreatedTimestamp() == null)
				dto.setCreatedTimestamp(new Date());
			if (webAdeAuthentication != null && webAdeAuthentication.getUserId() != null)
				dto.setUpdateUser(webAdeAuthentication.getUserId());
			if (webAdeAuthentication != null && webAdeAuthentication.getUserId() != null)
				dto.setCreateUser(webAdeAuthentication.getUserId());

			this.externalUriDao.update(dto);
		} catch (DaoException e) {
			throw new ServiceException(e.getMessage(), e);
		}

		ExternalUriDto updatedDto = this.externalUriDao.fetch(dto.getExternalUriGuid());

		result = this.externalUriFactory.getExternalUri(updatedDto, factoryContext);
		return result;
	}

	@Override
	public void deleteExternalUri(String externalUriGuid, FactoryContext factoryContext)
			throws NotFoundException, ConflictException {
		logger.debug("<deleteExternalUri");

		try {
			ExternalUriDto dto = this.externalUriDao.fetch(externalUriGuid);

			if (dto == null) {
				throw new NotFoundException("Did not find the externalUri: " + externalUriGuid);
			}

			this.externalUriDao.delete(externalUriGuid, getWebAdeAuthentication().getUserId());

		} catch (IntegrityConstraintViolatedDaoException | OptimisticLockingFailureDaoException e) {
			throw new ConflictException(e.getMessage());
		} catch (NotFoundDaoException e) {
			throw new NotFoundException(e.getMessage());
		} catch (DaoException e) {
			throw new ServiceException(e.getMessage(), e);
		}

		logger.debug(">deleteExternalUri");
	}

	@Override
	public ExternalUriListResource getExternalUriList(String sourceObjectUniqueId, Integer pageNumber,
			Integer pageRowCount, FactoryContext factoryContext) {
		ExternalUriListResource results = null;
		PagedDtos<ExternalUriDto> externalUriList = null;
		try {
			// if sourceObjectUniqueId is null return all
			if (sourceObjectUniqueId != null) {
				externalUriList = this.externalUriDao.selectForIncident(sourceObjectUniqueId, pageNumber, pageRowCount);
			} else
				externalUriList = this.externalUriDao.select(pageNumber, pageRowCount);
			results = this.externalUriFactory.getExternalUriList(externalUriList, pageNumber, pageRowCount,
					factoryContext);
		} catch (DaoException e) {
			throw new ServiceException(e.getMessage(), e);
		}

		return results;
	}

	@Override
	public AttachmentListResource getIncidentAttachmentList(String incidentNumberSequence, boolean primaryIndicator,
			String[] sourceObjectNameCodes, String[] attachmentTypeCodes, Integer pageNumber, Integer pageRowCount,
			String[] orderBy, FactoryContext factoryContext) throws ConflictException, NotFoundException {
		AttachmentListResource result = new AttachmentListResource();

		PagedDtos<PublishedIncidentDto> publishedIncidentList = new PagedDtos<>();
		try {

			List<String> orderByList = new ArrayList<>();
			if (orderBy != null && orderBy.length > 0) {
				for (String orderbyString : orderBy) {
					String daoDirection = null;
					String daoOrderByString = "";
					String[] split = orderbyString.split("\\s+");
					if (split != null && split.length > 0) {
						String orderByProperty = split[0];

						switch (orderByProperty) {
							case "attachmentTypeCode":
								daoOrderByString = orderByProperty;
								break;
							case "sourceObjectNameCode":
								daoOrderByString = orderByProperty;
								break;
							case "sourceObjectUniqueId":
								daoOrderByString = orderByProperty;
								break;
							case "uploadedByUserType":
								daoOrderByString = orderByProperty;
								break;
							case "uploadedByUserId":
								daoOrderByString = orderByProperty;
								break;
							case "uploadedByUserGuid":
								daoOrderByString = orderByProperty;
								break;

							default: {
								logger.warn("Ignoring unsupported order by: " + orderByProperty);
								continue;
							}
						}
					}
					if (daoOrderByString.length() > 0) {
						if (split != null && split.length > 1) {
							String direction = split[1];
							if (direction.equalsIgnoreCase("desc") || direction.equalsIgnoreCase("descending")) {
								daoDirection = "DESC";
							} else {
								daoDirection = "ASC";
							}
						} else {
							daoDirection = "ASC";
						}

						orderByList.add(daoOrderByString);
						orderByList.add(daoDirection);
					}
				}
			}

			String[] newOrderBy = null;
			if (orderByList.size() > 0) {
				newOrderBy = orderByList.toArray(new String[0]);
			}

			PagedDtos<AttachmentDto> list = this.attachmentDao.select(incidentNumberSequence, primaryIndicator,
					sourceObjectNameCodes, attachmentTypeCodes, pageNumber, pageRowCount, newOrderBy);
			result = this.attachmentFactory.getAttachmentList(list, pageNumber, pageRowCount, factoryContext);
		} catch (IntegrityConstraintViolatedDaoException | OptimisticLockingFailureDaoException e) {
			throw new ConflictException(e.getMessage());
		} catch (NotFoundDaoException e) {
			throw new NotFoundException(e.getMessage());
		} catch (DaoException e) {
			throw new ServiceException(e.getMessage(), e);
		}

		return result;
	}

	@Override
	public AttachmentResource createIncidentAttachment(AttachmentResource attachment,
			WebAdeAuthentication webAdeAuthentication, FactoryContext factoryContext)
			throws ValidationFailureException, ConflictException, NotFoundException, Exception {
		AttachmentResource response = null;
		long effectiveAsOfMillis = attachment.getCreatedTimestamp() == null ? System.currentTimeMillis()
				: attachment.getCreatedTimestamp().getTime();
		try {
			List<Message> errors = this.modelValidator.validateAttachment(attachment, effectiveAsOfMillis);
			if (!errors.isEmpty()) {
				throw new Exception("Validation failed for attachment: " + errors.toString());
			}

			AttachmentResource result = new AttachmentResource();
			AttachmentDto dto = new AttachmentDto(attachment);
			try {
				dto.setCreateDate(new Date());
				dto.setUpdateDate(new Date());
				dto.setRevisionCount(Long.valueOf(0));
				if (dto.getCreatedTimestamp() == null)
					dto.setCreatedTimestamp(new Date());
				if (webAdeAuthentication != null && webAdeAuthentication.getUserId() != null)
					dto.setUpdateUser(webAdeAuthentication.getUserId());
				if (webAdeAuthentication != null && webAdeAuthentication.getUserId() != null)
					dto.setCreateUser(webAdeAuthentication.getUserId());

				this.attachmentDao.insert(dto);
			} catch (DaoException e) {
				throw new ServiceException(e.getMessage(), e);
			}

			AttachmentDto updatedDto = this.attachmentDao.fetch(dto.getAttachmentGuid());

			result = this.attachmentFactory.getAttachment(updatedDto, factoryContext);

			response = result;

			/* Also Call WFDM, and copy the attachment bytes into the AWS bucket! */

		} catch (IntegrityConstraintViolatedDaoException e) {
			throw new ConflictException(e.getMessage());
		} catch (NotFoundDaoException e) {
			throw new NotFoundException(e.getMessage());
		} catch (DaoException e) {
			throw new ServiceException(e.getMessage(), e);
		} catch (Exception e) {
			throw new Exception(e.getMessage(), e);
		}

		logger.debug(">PublishedWildfireIncident");
		return response;
	}

	@Override
	public AttachmentResource updateIncidentAttachment(AttachmentResource attachment,
			WebAdeAuthentication webAdeAuthentication, FactoryContext factoryContext)
			throws ValidationFailureException, ConflictException, NotFoundException, Exception {
		AttachmentResource response = null;
		long effectiveAsOfMillis = attachment.getCreatedTimestamp() == null ? System.currentTimeMillis()
				: attachment.getCreatedTimestamp().getTime();

		try {
			List<Message> errors = this.modelValidator.validateAttachment(attachment, effectiveAsOfMillis);

			if (!errors.isEmpty()) {
				throw new Exception("Validation failed for attachment: " + errors.toString());
			}

			AttachmentResource result = new AttachmentResource();
			AttachmentResource currentAttachment = getIncidentAttachment(attachment.getAttachmentGuid(),
					factoryContext);

			if (currentAttachment != null) {
				AttachmentDto dto = new AttachmentDto(attachment);

				try {
					dto.setUpdateDate(new Date());
					if (dto.getCreateDate() == null)
						dto.setCreateDate(new Date());
					if (dto.getCreatedTimestamp() == null)
						dto.setCreatedTimestamp(new Date());
					if (webAdeAuthentication != null && webAdeAuthentication.getUserId() != null)
						dto.setUpdateUser(webAdeAuthentication.getUserId());
					if (webAdeAuthentication != null && webAdeAuthentication.getUserId() != null)
						dto.setCreateUser(webAdeAuthentication.getUserId());

					this.attachmentDao.update(dto);
				} catch (DaoException e) {
					throw new ServiceException(e.getMessage(), e);
				}

				AttachmentDto updatedDto = this.attachmentDao.fetch(dto.getAttachmentGuid());
				result = this.attachmentFactory.getAttachment(updatedDto, factoryContext);

				/* Also Re-upload the attachment from WFDM into the AWS bucket! */
			}

			response = result;

		} catch (IntegrityConstraintViolatedDaoException e) {
			throw new ConflictException(e.getMessage());
		} catch (NotFoundDaoException e) {
			throw new NotFoundException(e.getMessage());
		} catch (DaoException e) {
			throw new ServiceException(e.getMessage(), e);
		} catch (Exception e) {
			throw new Exception(e.getMessage(), e);
		}

		logger.debug(">updateIncidentAttachment");
		return response;
	}

	@Override
	public AttachmentResource deleteIncidentAttachment(String attachmentGuid, WebAdeAuthentication webAdeAuthentication,
			FactoryContext factoryContext)
			throws ValidationFailureException, ConflictException, NotFoundException, Exception {
		logger.debug("<deleteIncidentAttachment");

		try {
			AttachmentDto dto = this.attachmentDao.fetch(attachmentGuid);
			AttachmentResource result = this.attachmentFactory.getAttachment(dto, factoryContext);

			if (dto == null) {
				throw new NotFoundException("Did not find the attachment: " + attachmentGuid);
			}

			this.attachmentDao.delete(attachmentGuid, getWebAdeAuthentication().getUserId());

			/* Also Delete the attachment from the AWS bucket! */

			return result;
		} catch (IntegrityConstraintViolatedDaoException | OptimisticLockingFailureDaoException e) {
			throw new ConflictException(e.getMessage());
		} catch (NotFoundDaoException e) {
			throw new NotFoundException(e.getMessage());
		} catch (DaoException e) {
			throw new ServiceException(e.getMessage(), e);
		}
	}

	@Override
	public AttachmentResource getIncidentAttachment(String attachmentGuid, FactoryContext factoryContext)
			throws ValidationFailureException, ConflictException, NotFoundException, Exception {
		try {
			AttachmentDto dto = this.attachmentDao.fetch(attachmentGuid);
			if (dto != null) {
				return this.attachmentFactory.getAttachment(dto, factoryContext);
			} else
				throw new NotFoundException("Did not find the attachmentGuid: " + attachmentGuid);

		} catch (IntegrityConstraintViolatedDaoException | OptimisticLockingFailureDaoException e) {
			throw new ConflictException(e.getMessage());
		} catch (NotFoundDaoException e) {
			throw new NotFoundException(e.getMessage());
		} catch (DaoException e) {
			throw new ServiceException(e.getMessage(), e);
		}
	}

	@Override
	public SituationReportListResource getSitationReportList(Integer pageNumber, Integer pageRowCount,
			Boolean published, FactoryContext factoryContext) throws ConflictException, NotFoundException {
		SituationReportListResource result = new SituationReportListResource();

		try {
			PagedDtos<SituationReportDto> list = this.situationReportDao.select(pageNumber, pageRowCount, published);
			result = this.situationReportFactory.getSituationReportList(list, pageNumber, pageRowCount, factoryContext);
		} catch (IntegrityConstraintViolatedDaoException | OptimisticLockingFailureDaoException e) {
			throw new ConflictException(e.getMessage());
		} catch (NotFoundDaoException e) {
			throw new NotFoundException(e.getMessage());
		} catch (DaoException e) {
			throw new ServiceException(e.getMessage(), e);
		}

		return result;
	}

	@Override
	public SituationReportResource createSituationReport(SituationReportResource report,
			WebAdeAuthentication webAdeAuthentication, FactoryContext factoryContext)
			throws ValidationFailureException, ConflictException, NotFoundException, Exception {
		SituationReportResource response = null;
		long effectiveAsOfMillis = report.getCreatedTimestamp() == null ? System.currentTimeMillis()
				: report.getCreatedTimestamp().getTime();
		try {
			List<Message> errors = this.modelValidator.validateReport(report, effectiveAsOfMillis);
			if (!errors.isEmpty()) {
				throw new Exception("Validation failed for report: " + errors.toString());
			}

			SituationReportDto dto = new SituationReportDto(report);
			try {
				dto.setCreateDate(new Date());
				dto.setUpdateDate(new Date());
				dto.setRevisionCount(Long.valueOf(0));
				if (dto.getSituationReportDate() == null)
					dto.setSituationReportDate(new Date());
				if (dto.getCreatedTimestamp() == null)
					dto.setCreatedTimestamp(new Date());
				if (webAdeAuthentication != null && webAdeAuthentication.getUserId() != null)
					dto.setUpdateUser(webAdeAuthentication.getUserId());
				if (webAdeAuthentication != null && webAdeAuthentication.getUserId() != null)
					dto.setCreateUser(webAdeAuthentication.getUserId());

				this.situationReportDao.insert(dto);
			} catch (DaoException e) {
				throw new ServiceException(e.getMessage(), e);
			}

			SituationReportDto updatedDto = this.situationReportDao.fetch(dto.getReportGuid());

			response = this.situationReportFactory.getSituationReport(updatedDto, factoryContext);

		} catch (IntegrityConstraintViolatedDaoException e) {
			throw new ConflictException(e.getMessage());
		} catch (NotFoundDaoException e) {
			throw new NotFoundException(e.getMessage());
		} catch (DaoException e) {
			throw new ServiceException(e.getMessage(), e);
		} catch (Exception e) {
			throw new Exception(e.getMessage(), e);
		}

		logger.debug(">CreateSitationReport");
		return response;
	}

	@Override
	public SituationReportResource updateSituationReport(SituationReportResource report,
			WebAdeAuthentication webAdeAuthentication, FactoryContext factoryContext)
			throws ValidationFailureException, ConflictException, NotFoundException, Exception {
		SituationReportResource response = null;
		long effectiveAsOfMillis = report.getCreatedTimestamp() == null ? System.currentTimeMillis()
				: report.getCreatedTimestamp().getTime();

		try {
			List<Message> errors = this.modelValidator.validateReport(report, effectiveAsOfMillis);

			if (!errors.isEmpty()) {
				throw new Exception("Validation failed for report: " + errors.toString());
			}

			SituationReportResource currentReport = getSituationReport(report.getReportGuid(), factoryContext);

			if (currentReport != null) {
				SituationReportDto dto = new SituationReportDto(report);

				try {
					dto.setUpdateDate(new Date());
					if (dto.getCreateDate() == null)
						dto.setCreateDate(new Date());
					if (dto.getCreatedTimestamp() == null)
						dto.setCreatedTimestamp(new Date());
					if (webAdeAuthentication != null && webAdeAuthentication.getUserId() != null)
						dto.setUpdateUser(webAdeAuthentication.getUserId());
					if (webAdeAuthentication != null && webAdeAuthentication.getUserId() != null)
						dto.setCreateUser(webAdeAuthentication.getUserId());

					this.situationReportDao.update(dto);
				} catch (DaoException e) {
					throw new ServiceException(e.getMessage(), e);
				}

				SituationReportDto updatedDto = this.situationReportDao.fetch(dto.getReportGuid());
				response = this.situationReportFactory.getSituationReport(updatedDto, factoryContext);
			}

		} catch (IntegrityConstraintViolatedDaoException e) {
			throw new ConflictException(e.getMessage());
		} catch (NotFoundDaoException e) {
			throw new NotFoundException(e.getMessage());
		} catch (DaoException e) {
			throw new ServiceException(e.getMessage(), e);
		} catch (Exception e) {
			throw new Exception(e.getMessage(), e);
		}

		logger.debug(">updateSituationReport");
		return response;
	}

	@Override
	public SituationReportResource deleteSituationReport(String reportGuid, WebAdeAuthentication webAdeAuthentication,
			FactoryContext factoryContext)
			throws ValidationFailureException, ConflictException, NotFoundException, Exception {
		logger.debug("<deleteSituationReport");

		try {
			SituationReportDto dto = this.situationReportDao.fetch(reportGuid);
			SituationReportResource result = this.situationReportFactory.getSituationReport(dto, factoryContext);

			if (dto == null) {
				throw new NotFoundException("Did not find the report: " + reportGuid);
			}

			this.situationReportDao.delete(reportGuid);

			return result;
		} catch (IntegrityConstraintViolatedDaoException | OptimisticLockingFailureDaoException e) {
			throw new ConflictException(e.getMessage());
		} catch (NotFoundDaoException e) {
			throw new NotFoundException(e.getMessage());
		} catch (DaoException e) {
			throw new ServiceException(e.getMessage(), e);
		}
	}

	@Override
	public SituationReportResource getSituationReport(String reportGuid, FactoryContext factoryContext)
			throws ValidationFailureException, ConflictException, NotFoundException, Exception {
		try {
			SituationReportDto dto = this.situationReportDao.fetch(reportGuid);
			if (dto != null) {
				return this.situationReportFactory.getSituationReport(dto, factoryContext);
			} else
				throw new NotFoundException("Did not find the reportGuid: " + reportGuid);

		} catch (IntegrityConstraintViolatedDaoException | OptimisticLockingFailureDaoException e) {
			throw new ConflictException(e.getMessage());
		} catch (NotFoundDaoException e) {
			throw new NotFoundException(e.getMessage());
		} catch (DaoException e) {
			throw new ServiceException(e.getMessage(), e);
		}
	}

	@Override
	public List<StatisticsResource> getStatistics(String fireCentre, Integer fireYear, FactoryContext factoryContext)
			throws ValidationFailureException, ConflictException, NotFoundException, Exception {
		try {
			List<StatisticsDto> dto = this.statisticsDao.fetch(fireCentre, fireYear);
			if (dto != null) {
				return this.statisticsFactory.getStatistics(dto, factoryContext);
			} else
				throw new NotFoundException("Did not find the fire centre: " + fireCentre);

		} catch (IntegrityConstraintViolatedDaoException | OptimisticLockingFailureDaoException e) {
			throw new ConflictException(e.getMessage());
		} catch (NotFoundDaoException e) {
			throw new NotFoundException(e.getMessage());
		} catch (DaoException e) {
			throw new ServiceException(e.getMessage(), e);
		}
	}
}