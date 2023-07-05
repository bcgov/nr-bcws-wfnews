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
import ca.bc.gov.nrs.wfone.persistence.v1.dao.RoFFormDao;
import ca.bc.gov.nrs.wfone.persistence.v1.dao.mybatis.mapper.RoFFormMapper;
import ca.bc.gov.nrs.wfone.persistence.v1.dto.RoFFormDto;

@Repository
public class RoFFormDaoImpl extends BaseDao implements RoFFormDao {
	
	private static final Logger logger = LoggerFactory.getLogger(RoFFormDaoImpl.class);

	@Autowired
	private RoFFormMapper mapper;

	@Override
	public void insert(RoFFormDto dto) throws DaoException {
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

		logger.debug(">insert " + dto.getReportOfFireCacheGuid());
	}

  @Override
  public List<RoFFormDto> select() throws DaoException {
    logger.debug("fetch >>");

		List<RoFFormDto> result = null;

		try {
			result = this.mapper.select();

			if (result != null) {
        for (RoFFormDto dto : result) {
				  dto.resetDirty();
        }
			}
		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug("<< fetch " + result);
		return result;
  }

  @Override
  public int delete(RoFFormDto dto) throws DaoException {
    logger.debug("<delete");
    int count = 0;
		try {

			Map<String, Object> parameters = new HashMap<String, Object>();
			parameters.put("reportOfFireCacheGuid", dto.getReportOfFireCacheGuid());
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

  @Override
  public int update(RoFFormDto dto) throws DaoException {
    logger.debug("<update");
		int count = 0;
    try {
      Map<String, Object> parameters = new HashMap<String, Object>();
      parameters.put("reportOfFireCacheGuid", dto.getReportOfFireCacheGuid());
      parameters.put("dto", dto);
      count = this.mapper.update(parameters);

      if (count == 0) {
        throw new DaoException("Record not updated: " + count);
      }

    } catch (RuntimeException e) {
      handleException(e);
    }

		logger.debug(">update");
    return 0;
  }

  @Override
  public RoFFormDto fetch(String guid) throws DaoException {
    logger.debug("<fetch");
    RoFFormDto dto = null;

		try {
			Map<String, Object> parameters = new HashMap<String, Object>();
			parameters.put("reportOfFireCacheGuid", guid);
			dto = this.mapper.fetch(parameters);
		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug(">fetch");
    return dto;
  }
}
