package ca.bc.gov.nrs.wfnews.persistence.v1.dao.mybatis;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.nrs.common.persistence.dao.DaoException;
import ca.bc.gov.nrs.common.persistence.dao.OptimisticLockingFailureDaoException;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.BaseDto;

public class BaseDao {

	private static final Logger logger = LoggerFactory.getLogger(BaseDao.class);

	@SuppressWarnings({ "unchecked"})
	protected <T> List<T> cast(List<?> list) {
		return (List<T>) list;
	}

	@SuppressWarnings({ "unchecked"})
	protected <T> T cast(Object item) {
		return (T) item;
	}

	protected Long getRevisionCount(String optimisticLock) throws OptimisticLockingFailureDaoException {
		logger.debug("<getRevisionCount");

		Long result = null;

		if (optimisticLock == null || optimisticLock.trim().length() == 0) {
			throw new OptimisticLockingFailureDaoException("lock is null");
		}

		try {
			result = Long.valueOf(optimisticLock);
		} catch (NumberFormatException e) {
			throw new OptimisticLockingFailureDaoException("invalid format "
					+ optimisticLock);
		}

		logger.debug(">getRevisionCount " + result);
		return result;
	}

	protected void handleException(Throwable e) throws DaoException {
		logger.debug("<handleException " + e.getClass());

			throw new DaoException(e);
	}
	
	protected void resetDirty(List<? extends BaseDto<?>> dtos) {
		for(BaseDto<?> dto:dtos) {
			
			dto.resetDirty();
		}
	}
}
