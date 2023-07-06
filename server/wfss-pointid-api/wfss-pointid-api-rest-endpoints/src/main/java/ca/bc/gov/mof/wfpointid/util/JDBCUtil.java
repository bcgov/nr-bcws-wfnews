package ca.bc.gov.mof.wfpointid.util;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;

public class JDBCUtil {

	public static Double getDouble(ResultSet rs, int i) throws SQLException {
		double d = rs.getDouble(i);
		if (rs.wasNull()) return null;
		return Double.valueOf(d);
	}

	public static Integer getInteger(ResultSet rs, int i) throws SQLException {
		int d = rs.getInt(i);
		if (rs.wasNull()) return null;
		return Integer.valueOf(d);
	}

	public static void close(Connection con) {
		try {
			con.close();
		} catch (SQLException e) {
			// oh well, we're done anyway
		}
	}
}
