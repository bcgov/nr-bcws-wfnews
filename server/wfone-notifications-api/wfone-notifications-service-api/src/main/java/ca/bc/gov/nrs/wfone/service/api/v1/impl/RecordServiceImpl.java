package ca.bc.gov.nrs.wfone.service.api.v1.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;

import ca.bc.gov.nrs.wfone.common.persistence.dao.DaoException;
import ca.bc.gov.nrs.wfone.persistence.v1.dao.RoFFormDao;
import ca.bc.gov.nrs.wfone.persistence.v1.dao.RoFImageDao;
import ca.bc.gov.nrs.wfone.persistence.v1.dto.RoFFormDto;
import ca.bc.gov.nrs.wfone.persistence.v1.dto.RoFImageDto;
import ca.bc.gov.nrs.wfone.service.api.v1.RecordRoFService;
import ca.bc.gov.nrs.wfone.service.api.v1.RecordService;
import ca.bc.gov.nrs.wfone.service.api.v1.spring.ServiceApiSpringConfig;

public class RecordServiceImpl implements RecordService {

	private Properties applicationProperties;
	private RoFFormDao rofFormDao;
	private RoFImageDao rofImageDao;

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

	public void createRecord(String rofFormData, byte[] image1, byte[] image2, byte[] image3) {
		String reportOfFireCacheGuid = UUID.randomUUID().toString();
		List<byte[]> imageList = new ArrayList<byte[]>();
		imageList.add(image1);
		imageList.add(image2);
		imageList.add(image3);
		insertRoFCache(reportOfFireCacheGuid, rofFormData);
		insertRoFAttachmentCache(reportOfFireCacheGuid, image1);

	}

	private void insertRoFCache(String reportOfFireCacheGuid, String reportOfFire) {
		RecordRoFService recordService = serviceApiSpringConfig.recordRoFService();

		rofFormDao = recordService.getRofFormDao();

		LocalDateTime submittedTimestamp = LocalDateTime.now();

		RoFFormDto rofFormDto = new RoFFormDto();
		rofFormDto.setReportOfFireCacheGuid(reportOfFireCacheGuid);
		rofFormDto.setReportOfFire(reportOfFire);
		rofFormDto.setSubmittedTimestamp(submittedTimestamp);

		try {
			this.rofFormDao.insert(rofFormDto);
		} catch (DaoException eDaoException) {
			// do nothing
		}

	}

	private void insertRoFAttachmentCache(String reportOfFireCacheGuid, byte[] imageList) {
		RecordRoFService recordService = serviceApiSpringConfig.recordRoFService();
		rofImageDao = recordService.getRofImageDao();
		String reportOfFireAttachmentCacheGuid = UUID.randomUUID().toString();

		RoFImageDto rofImageDto = new RoFImageDto();
		rofImageDto.setReportOfFireAttachmentCacheGuid(reportOfFireAttachmentCacheGuid);
		rofImageDto.setReportOfFireCacheGuid(reportOfFireCacheGuid);
		rofImageDto.setAttachment(imageList);

		try {
			this.rofImageDao.insert(rofImageDto);
		} catch (DaoException eDaoException) {
			// do nothing
		}

	}

}