package ca.bc.gov.nrs.wfnews.persistence.v1.dao.mybatis;

import java.time.Year;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import ca.bc.gov.nrs.common.persistence.dao.DaoException;
import ca.bc.gov.nrs.wfnews.persistence.v1.dao.BaseDao;
import ca.bc.gov.nrs.wfnews.persistence.v1.dao.StatisticsDao;
import ca.bc.gov.nrs.wfnews.persistence.v1.dao.mybatis.mapper.StatisticsMapper;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.StatisticsDto;

public class StatisticsDaoImpl extends BaseDao implements StatisticsDao {
  private static final long serialVersionUID = 1L;
	private static final Logger logger = LoggerFactory.getLogger(StatisticsDaoImpl.class);

  public void setStatisticsMapper(StatisticsMapper statisticsMapper) {
		this.statisticsMapper = statisticsMapper;
	}
	
	@Autowired
	private transient StatisticsMapper statisticsMapper;

  public StatisticsDto fetch(String fireCentre, Integer fireYear) throws DaoException {
		logger.debug("<fetch");

		StatisticsDto result = null;

		try {

			Map<String, Object> parameters = new HashMap<String, Object>();
			parameters.put("fireCentre", fireCentre);
			parameters.put("fireYear", fireYear != null ? fireYear.intValue() : getCurrentFireYear());
			result = this.statisticsMapper.fetch(parameters);

		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug(">fetch " + result);
		return result;
	}

	private int getCurrentFireYear() {
		int currentYear = Year.now().getValue();
		if (Calendar.getInstance().get(Calendar.MONTH) < 3) {
			currentYear -= 1;
		}
		return currentYear;
	}
}
