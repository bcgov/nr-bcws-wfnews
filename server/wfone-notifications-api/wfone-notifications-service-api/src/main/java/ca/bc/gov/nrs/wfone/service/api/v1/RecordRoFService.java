package ca.bc.gov.nrs.wfone.service.api.v1;

import java.util.List;

import ca.bc.gov.nrs.wfdm.api.rest.client.FileService;
import ca.bc.gov.nrs.wfim.api.rest.v1.resource.PublicReportOfFireResource;
import ca.bc.gov.nrs.wfone.common.service.api.model.factory.FactoryContext;
import ca.bc.gov.nrs.wfone.persistence.v1.dao.RoFFormDao;
import ca.bc.gov.nrs.wfone.persistence.v1.dao.RoFImageDao;

public interface RecordRoFService {

	public void createRecord(String rofFormData, byte[] image1, byte[] image2, byte[] image3) throws Exception;

	public RoFFormDao getRofFormDao();

	public RoFImageDao getRofImageDao();

	public FileService getFileService();

	public List<PublicReportOfFireResource> pushCachedRoFsToIncidentManager(FactoryContext context);

	public void cleanupOldRoFs();
}