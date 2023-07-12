package ca.bc.gov.mof.wfpointid.weather;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.mof.wfpointid.rest.model.PositionedWeatherStation;
import ca.bc.gov.mof.wfpointid.rest.model.WeatherDaily;
import ca.bc.gov.mof.wfpointid.rest.model.WeatherHourly;
import ca.bc.gov.mof.wfpointid.rest.model.WeatherStation;
import ca.bc.gov.mof.wfpointid.util.JDBCUtil;
import ca.bc.gov.mof.wfpointid.util.MathUtil;
import ca.bc.gov.mof.wfpointid.weather.util.WeatherDay;
import ca.bc.gov.mof.wfpointid.weather.util.WeatherHour;

public class DBWeatherDAO implements WeatherDAO {
	
	private static Logger LOG = LoggerFactory.getLogger(DBWeatherDAO.class);

	private static final String  DATA_STATUS_FORECAST = "FORECAST";
	Connection con = null; 
	
	public DBWeatherDAO(Connection con) {
	      this.con = con;  	
	}

	public void close() {
		JDBCUtil.close(con);
	}
	
	private static final String SQL_FMT_SELECT_NEAREST_STATION = 	"select station_code, station_name, latitude, longitude, elevation_m, "
		    +"sdo_geom.sdo_distance(   " 
		    +"sdo_geometry(2001, 4326, sdo_point_type(longitude, latitude, null), null, null), "
		    +"sdo_geometry(2001, 4326, sdo_point_type( %s, %s, null), null, null),  0.005,  'unit=KM' ) as dist "            
			+"from app_wf1_weather.weather_station_vw ws\r\n"  
			+" WHERE ws.station_status_code = 'ACTIVE' "
			+ "  AND longitude IS NOT NULL AND latitude IS NOT NULL order by dist";
 	
	public WeatherStation findStationNearest(double lon, double lat) throws SQLException {
		
		String sql = String.format(SQL_FMT_SELECT_NEAREST_STATION,  lon, lat);
		
		PositionedWeatherStation stn = null;

		try (
				Statement  stmt = con.createStatement();  
				ResultSet  rs = stmt.executeQuery(sql); 
			) {
			
			int rowCount = 0;
	        while (rs.next() && rowCount < 1)  
	        {  
	        	stn = new PositionedWeatherStation();
	        	stn.setStationCode( rs.getInt(1));
	        	stn.setStationName( rs.getString(2));
	        	stn.setLat( JDBCUtil.getDouble(rs, 3).doubleValue());
	        	stn.setLon( JDBCUtil.getDouble(rs, 4).doubleValue());
	        	stn.setElevation( JDBCUtil.getInteger(rs, 5).intValue());
	        	
	        	rowCount++;
	        }
		}
		catch (Exception ex) {
			LOG.debug(ex.getMessage());
		}
		return stn;
	}	

	private static final String SQL_FMT_SELECT_HOURLY = "select to_char(pst_weather_timestamp, 'YYYYMMDDHH24') as weather_timestamp, station_code, HOURLY_MEASUREMENT_TYPE_CODE, temperature, relative_humidity "
		     +" ,wind_speed, wind_direction_degrees, precipitation, fine_fuel_moisture_code, initial_spread_index, fire_weather_index "
		     +" from app_wf1_weather.Hourly_Weather_meas_vw " 
		     +" where station_code = %d " 
		     +" and pst_weather_timestamp >= TO_DATE('%s','YYYYMMDDHH24') and pst_weather_timestamp <= TO_DATE('%s','YYYYMMDDHH24') order by weather_timestamp desc";   
			
	public WeatherHourly[] findWeatherHourly(int stationCode, String hourMin, String hourMax) throws SQLException {

		String sql = String.format(SQL_FMT_SELECT_HOURLY, Integer.valueOf(stationCode), hourMin, hourMax);
		
		List<WeatherHourly> hrs = new ArrayList<WeatherHourly>();
		try (
			Statement  stmt = con.createStatement();  
			ResultSet  rs = stmt.executeQuery(sql); 
		) {
	        while (rs.next()) {  
	        	WeatherHourly hr = new WeatherHourly();
	        	
	        	String weatherDate = rs.getString(1);
	        	int hourOffset = WeatherHour.diffHours(hourMax, weatherDate);
	        	int hourIndex = hourOffset + 1;
	        	
	        	hr.setHour(weatherDate);
	        	hr.setIndex(hourIndex);
	        	hr.setTemp(				JDBCUtil.getDouble(rs, 4));
	        	hr.setRelativeHumidity(	JDBCUtil.getInteger(rs, 5));
	        	hr.setWindSpeed(		JDBCUtil.getDouble(rs, 6));
	        	hr.setWindDirection(	JDBCUtil.getInteger(rs, 7));
	        	hr.setPrecipitation(	JDBCUtil.getDouble(rs, 8));
	        	hr.setFineFuelMoistureCode(				MathUtil.round1( JDBCUtil.getDouble(rs, 9)) );
	        	hr.setInitialSpreadIndex(				MathUtil.round1( JDBCUtil.getDouble(rs, 10)) );
	        	hr.setFireWeatherIndex(	MathUtil.round1( JDBCUtil.getDouble(rs, 11)) );
	        	hrs.add(hr);
	        }
		}
		catch (Exception ex) {
			LOG.debug(ex.getMessage());
		}
		
		return hrs.toArray(new WeatherHourly[0]);
	}

	private static final String SQL_FMT_SELECT_DAILY = "select to_char(pst_weather_timestamp, 'YYYYMMDD') as weather_timestamp, station_code, DAILY_MEASUREMENT_TYPE_CODE, temperature, relative_humidity "
		    +",wind_speed, wind_direction_degrees, precipitation,  BUILD_UP_INDEX,  fine_fuel_moisture_code, initial_spread_index, fire_weather_index, DUFF_MOISTURE_CODE, DROUGHT_CODE "
		    +"from app_wf1_weather.Daily_Weather_Meas_vw " 
		    +"where station_code = %d " 
		    +"and pst_weather_timestamp >= TO_DATE('%s','YYYYMMDD') and pst_weather_timestamp <= TO_DATE('%s','YYYYMMDD') order by weather_timestamp desc";    
			
	public WeatherDaily[] findWeatherDaily(int stationCode, String dayMin, String dayMax) throws SQLException {

		String sql = String.format(SQL_FMT_SELECT_DAILY, Integer.valueOf(stationCode), dayMin, dayMax);
		
		List<WeatherDaily> items = new ArrayList<WeatherDaily>();

		try (
				Statement  stmt = con.createStatement();  
				ResultSet  rs = stmt.executeQuery(sql); 
			) {
	        while (rs.next()) {  
	        	WeatherDaily ob = new WeatherDaily();
	        	
	        	String weatherDate = rs.getString(1);
	        	int dayOffset = WeatherDay.diffDays(dayMax, weatherDate);
	        	int index = dayOffset + 1;
	        	
				String dataStatus = rs.getString(3);

	        	ob.setDay(weatherDate);
	        	ob.setIndex(index);
	        	ob.setForecastInd( forecastInd(dataStatus) );
	        	ob.setTemp(				JDBCUtil.getDouble(rs, 4));
	        	ob.setRelativeHumidity(	JDBCUtil.getInteger(rs, 5));
	        	ob.setWindSpeed(		JDBCUtil.getDouble(rs, 6));
	        	ob.setWindDirection(	JDBCUtil.getInteger(rs, 7));
	        	ob.setPrecipitation(	JDBCUtil.getDouble(rs, 8));
	        	ob.setBuildupIndex(		MathUtil.round1( JDBCUtil.getDouble(rs, 9)) );
	        	ob.setFineFuelMoistureCode(				MathUtil.round1( JDBCUtil.getDouble(rs, 10)) );
	        	ob.setInitialSpreadIndex(				MathUtil.round1( JDBCUtil.getDouble(rs, 11)) );
				ob.setFireWeatherIndex(MathUtil.round1(JDBCUtil.getDouble(rs, 12)));
				ob.setDuffMoistureCode(MathUtil.round1(JDBCUtil.getDouble(rs, 13)));
				ob.setDroughtCode(MathUtil.round1(JDBCUtil.getDouble(rs, 14)));
	        	items.add(ob);
	        }
		}
		catch (Exception ex) {
			LOG.debug(ex.getMessage());
		}
		return items.toArray(new WeatherDaily[0]);
	}

	private static boolean forecastInd(String dataStatus) {
		boolean result =  false;
		if ( dataStatus!=null && dataStatus.equalsIgnoreCase(DATA_STATUS_FORECAST)) {
			
			result = true;
		}
			
		return result;
	}	

}

