package ca.bc.gov.nrs.wfone.persistence.v1.dao.mybatis;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import ca.bc.gov.nrs.wfone.common.persistence.dao.DaoException;
import ca.bc.gov.nrs.wfone.common.persistence.dao.mybatis.BaseDao;
import ca.bc.gov.nrs.wfone.persistence.v1.dao.RoFImageDao;
import ca.bc.gov.nrs.wfone.persistence.v1.dao.mybatis.mapper.RoFImageMapper;
import ca.bc.gov.nrs.wfone.persistence.v1.dto.RoFImageDto;

@Repository
public class RoFImageDaoImpl extends BaseDao implements RoFImageDao {
	
    private static final Logger logger = LoggerFactory.getLogger(RoFImageDaoImpl.class);

    @Autowired
    private RoFImageMapper mapper;

 	@Override
 	public void insert(RoFImageDto dto) throws DaoException {
 		logger.debug("<insert");

         if (this.mapper == null){
             logger.debug("<inserter");
         }
 		try {

 			Map<String, Object> parameters = new HashMap<String, Object>();

 			parameters.put("dto", dto);
 			int count = this.mapper.insert(parameters);

 			if(count==0) {
 				throw new DaoException("Record not inserted: "+count);
 			}
			
 		} catch (RuntimeException e) {
 			handleException(e);
 		}

 		logger.debug(">insert " + dto.getReportOfFireAttachmentCacheGuid());
 	}

  @Override
  public List<RoFImageDto> select(String reportOfFireCacheGuid) throws DaoException {
    logger.debug("<select");

		List<RoFImageDto> result = null;

		try {

			Map<String, Object> parameters = new HashMap<String, Object>();
			parameters.put("reportOfFireCacheGuid", reportOfFireCacheGuid);
			result = this.mapper.select(parameters);

		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug(">select " + result);
		return result;
  }

  @Override
  public int delete(RoFImageDto dto) throws DaoException {
    logger.debug("<delete");
    int count = 0;
		try {

			Map<String, Object> parameters = new HashMap<String, Object>();
			parameters.put("reportOfFireAttachmentCacheGuid", dto.getReportOfFireAttachmentCacheGuid());
			count = this.mapper.delete(parameters);

			if (count == 0) {
				throw new DaoException("Record not deleted: "+count);
			}

		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug(">delete");
    return count;
  }

 }
	
