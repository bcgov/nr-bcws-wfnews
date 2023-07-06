package ca.bc.gov.mof.wfpointid.weather;

import java.sql.SQLException;

import ca.bc.gov.mof.wfpointid.rest.model.WeatherDaily;
import ca.bc.gov.mof.wfpointid.rest.model.WeatherHourly;
import ca.bc.gov.mof.wfpointid.rest.model.WeatherResource;
import ca.bc.gov.mof.wfpointid.rest.model.WeatherStation;

public class MockWeatherDAO implements WeatherDAO {

	public WeatherResource findByPoint(double lon, double lat) {
		WeatherResource res = new WeatherResource();
		
		res.setLon(lon);
		res.setLat(lat);
		res.setErrorCount(0);
		res.setErrorMsg("");
		
		res.setStations(new WeatherStation[] { createStation() });
		
		return res;
	}

	private static WeatherStation createStation() {
		WeatherStation stn = new WeatherStation();
		
		stn.setStationCode(999);
		stn.setStationName("TEST");
		
		WeatherHourly[] hourly = new WeatherHourly[11];
		for (int i = 0; i < 11; i++) {
			hourly[i] = createHourly(i);
		}
		stn.setHourly(hourly);
		return stn;
	}

	private static WeatherHourly createHourly(int i) {
		WeatherHourly hourly = new WeatherHourly();
		hourly.setHour("2017010101");
		hourly.setIndex(i + 1);
		hourly.setWindDirection(Integer.valueOf(270));
		return hourly;
	}

	@Override
	public WeatherStation findStationNearest(double lon, double lat)
			throws Exception {

		return null;
	}

	@Override
	public WeatherHourly[] findWeatherHourly(int stationCode, String hourMax,
			String hourMin) throws SQLException {
		return new WeatherHourly[0];
	}

	@Override
	public WeatherDaily[] findWeatherDaily(int stationCode, String hourMax,
			String hourMin) throws SQLException {
		return new WeatherDaily[0];
	}

	@Override
	public void close() {
		// do nothing
	}



}
