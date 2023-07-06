package ca.bc.gov.mof.wfpointid.weather;

import java.beans.PropertyVetoException;
import java.sql.Connection;
import java.sql.SQLException;

import javax.sql.DataSource;

import com.mchange.v2.c3p0.ComboPooledDataSource;

public class WeatherDB {
	
	private static final int POOL_MAX_CONNECTION_AGE = 6000;
	private static final int POOL_ACQUIRE_INCREMENT = 2;
	private static final int POOL_MAX_SIZE = 20;
	private static final int POOL_MIN_SIZE = 2;
	
	private DataSource dataSource;
	private String url;

    public Connection getConnection() throws SQLException {
        return dataSource.getConnection();
    }

    public void init(String jdbcClass, String u, String user, String pwd) {
    	this.url = u;
        ComboPooledDataSource cpds = new ComboPooledDataSource();
        try {
            cpds.setDriverClass(jdbcClass);
        } catch (PropertyVetoException e) {
        	throw new RuntimeException("C#PO PropertyVetoException: ", e);
        }
        cpds.setJdbcUrl(u);
        cpds.setUser(user);
        cpds.setPassword(pwd);
        cpds.setMinPoolSize(POOL_MIN_SIZE);
        cpds.setAcquireIncrement(POOL_ACQUIRE_INCREMENT);
        cpds.setMaxConnectionAge(POOL_MAX_CONNECTION_AGE);
        cpds.setMaxPoolSize(POOL_MAX_SIZE);
        
        dataSource = cpds;
    }

	public String getURL() {
		return url;
	}
}
