package ca.bc.gov.mof.wfpointid.weather;

import java.sql.SQLException;

import ca.bc.gov.mof.wfpointid.rest.model.WeatherDaily;
import ca.bc.gov.mof.wfpointid.rest.model.WeatherHourly;
import ca.bc.gov.mof.wfpointid.rest.model.WeatherStation;

public interface WeatherDAO {
	WeatherStation findStationNearest(double lon, double lat) throws Exception;
	WeatherHourly[] findWeatherHourly(int stationCode, String hourMin, String hourMax) throws SQLException;
	WeatherDaily[] findWeatherDaily(int stationCode, String dayMin, String dayMax) throws SQLException;
	void close();
}
