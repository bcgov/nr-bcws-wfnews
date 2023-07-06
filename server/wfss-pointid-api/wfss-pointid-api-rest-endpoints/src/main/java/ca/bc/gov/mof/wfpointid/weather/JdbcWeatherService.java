package ca.bc.gov.mof.wfpointid.weather;

import java.sql.Connection;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.mof.wfpointid.Messages;
import ca.bc.gov.mof.wfpointid.ServiceErrorException;
import ca.bc.gov.mof.wfpointid.query.QueryPt;
import ca.bc.gov.mof.wfpointid.rest.model.WeatherDaily;
import ca.bc.gov.mof.wfpointid.rest.model.WeatherHourly;
import ca.bc.gov.mof.wfpointid.rest.model.WeatherResource;
import ca.bc.gov.mof.wfpointid.rest.model.WeatherStation;
import ca.bc.gov.mof.wfpointid.weather.util.WeatherDay;
import ca.bc.gov.mof.wfpointid.weather.util.WeatherHour;

public class JdbcWeatherService extends WeatherService {
	
	public static final String JDBC_MS_SQL = "com.microsoft.sqlserver.jdbc.SQLServerDriver";
	
	public static final String JDBC_ORACLE_DRIVER = "oracle.jdbc.driver.OracleDriver";
	
	
	private static Logger LOG = LoggerFactory.getLogger(JdbcWeatherService.class);
	
	private WeatherDB weatherDB;
			
	public JdbcWeatherService(String jdbcUrl, String user, String pwd) {

		weatherDB = new WeatherDB();

		LOG.info(String.format("Init Weather DB for JDBC URL: %s, user: %s", jdbcUrl, user));
		
		weatherDB.init(JDBC_ORACLE_DRIVER, jdbcUrl, user, pwd);
	}

	public WeatherDAO getWeatherDAO() throws ServiceErrorException {
		
		Connection conn;
		try {
			conn= weatherDB.getConnection();
		}
		catch (Exception ex) {
			LOG.error("Unable to access Weather DB " + weatherDB.getURL(), ex);
			throw new ServiceErrorException(Messages.ERROR_WEATHER_DB, ex);
		}
		return new DBWeatherDAO(conn);
	}
	
	@Override
	public WeatherResource queryWeatherData(QueryPt pt, String hourstamp, int hourlyDuration, int dailyDuration) throws ServiceErrorException 
	{
		boolean useNow = hourstamp == null;
		WeatherDAO wxDAO = getWeatherDAO();
		
		WeatherStation stn;
		try {
			stn = wxDAO.findStationNearest(pt.getLon(),  pt.getLat());
			
			// use given hour or default to NOW
			if (useNow) {
				hourstamp = WeatherHour.now();
			}
			
			String hrMin = WeatherHour.addHours(hourstamp, -10);
			WeatherHourly[] hrly = wxDAO.findWeatherHourly(stn.getStationCode(), hrMin, hourstamp);
			stn.setHourly(hrly);
			
			String daystamp = null;
			if (useNow) {
				daystamp = WeatherDay.nowNoonRollover();
			}
			else {
				daystamp = WeatherHour.toDay(hourstamp);
			}
			String dayMin = WeatherDay.addDays(daystamp, -2);
			WeatherDaily[] daily = wxDAO.findWeatherDaily(stn.getStationCode(), dayMin, daystamp);
			stn.setDaily(daily);
		}
		catch (Exception ex) {
			ex.printStackTrace();
			throw new ServiceErrorException(Messages.ERROR_WEATHER_DATA, ex);
		}
		finally {
			wxDAO.close();
		}
		return WeatherService.createResource(pt, stn);
	}

	@Override
	public WeatherResource queryWeatherStationData(int code, String hourstamp, int hourlyDuration, int dailyDuration)
			throws ServiceErrorException {
		throw new ServiceErrorException(Messages.ERROR_OPERATION_NOT_SUPPORTED);
	}

}
