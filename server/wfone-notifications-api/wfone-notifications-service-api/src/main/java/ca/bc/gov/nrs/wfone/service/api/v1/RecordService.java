package ca.bc.gov.nrs.wfone.service.api.v1;

import ca.bc.gov.nrs.wfone.persistence.v1.dao.RoFFormDao;
import ca.bc.gov.nrs.wfone.persistence.v1.dao.RoFImageDao;

public interface RecordService {

	public void createRecord(String rofFormData, byte[] image1, byte[] image2, byte[] image3);

	public RoFFormDao getRofFormDao();

	public RoFImageDao getRofImageDao();
}