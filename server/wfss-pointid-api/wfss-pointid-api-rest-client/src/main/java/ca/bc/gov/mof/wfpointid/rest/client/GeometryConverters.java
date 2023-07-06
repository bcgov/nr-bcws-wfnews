package ca.bc.gov.mof.wfpointid.rest.client;

import org.geotools.geometry.jts.JTS;
import org.geotools.referencing.CRS;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.crs.GeographicCRS;
import org.opengis.referencing.crs.ProjectedCRS;
import org.opengis.referencing.operation.MathTransform;
import org.opengis.referencing.operation.TransformException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;

/**
 * Utility Class for geometry conversion
 */
public class GeometryConverters {
	public static final ProjectedCRS BC_ALBERS;
	public static final GeographicCRS LAT_LON;
	private static final MathTransform TRANFORM_TO_ALBERS;
	private static final GeometryFactory factory = new GeometryFactory();
	
	private static final Logger logger = LoggerFactory.getLogger(GeometryConverters.class);

	static {
		ProjectedCRS projected = null;
		GeographicCRS geographic = null;
		MathTransform transformToAlbers = null;
		try {
			projected = (ProjectedCRS) CRS.parseWKT("PROJCS[\"NAD83 / BC Albers\",\n"
					+ "    GEOGCS[\"NAD83\",\n"
					+ "        DATUM[\"North_American_Datum_1983\",\n"
					+ "            SPHEROID[\"GRS 1980\",6378137,298.257222101,\n"
					+ "                AUTHORITY[\"EPSG\",\"7019\"]],\n"
					+ "            TOWGS84[0,0,0,0,0,0,0],\n"
					+ "            AUTHORITY[\"EPSG\",\"6269\"]],\n"
					+ "        PRIMEM[\"Greenwich\",0,\n"
					+ "            AUTHORITY[\"EPSG\",\"8901\"]],\n"
					+ "        UNIT[\"degree\",0.0174532925199433,\n"
					+ "            AUTHORITY[\"EPSG\",\"9122\"]],\n"
					+ "        AUTHORITY[\"EPSG\",\"4269\"]],\n"
					+ "    PROJECTION[\"Albers_Conic_Equal_Area\"],\n"
					+ "    PARAMETER[\"standard_parallel_1\",50],\n"
					+ "    PARAMETER[\"standard_parallel_2\",58.5],\n"
					+ "    PARAMETER[\"latitude_of_center\",45],\n"
					+ "    PARAMETER[\"longitude_of_center\",-126],\n"
					+ "    PARAMETER[\"false_easting\",1000000],\n"
					+ "    PARAMETER[\"false_northing\",0],\n"
					+ "    UNIT[\"metre\",1,\n"
					+ "        AUTHORITY[\"EPSG\",\"9001\"]],\n"
					+ "    AXIS[\"Easting\",EAST],\n"
					+ "    AXIS[\"Northing\",NORTH],\n"
					+ "    AUTHORITY[\"EPSG\",\"3005\"]]\n"
					+ "");
			geographic = projected.getBaseCRS();
			
			transformToAlbers = CRS.findMathTransform(geographic, projected);

		} catch (FactoryException e) {
			logger.error("Error setting up transformations", e);
		}
		BC_ALBERS = projected;
		LAT_LON = geographic;
		TRANFORM_TO_ALBERS = transformToAlbers;
	}

	@SuppressWarnings("unchecked")
	public static <G extends Geometry> G geographicToProjected(G geom) throws TransformException {
		if(TRANFORM_TO_ALBERS==null) throw new TransformException("Could not find a transformation");
		if(geom==null) return null;
		return (G) JTS.transform(geom, TRANFORM_TO_ALBERS);
	}
	
	public static Point latLon(Double latitude, Double longitude) {
		try {
			Point geom = factory.createPoint(new Coordinate(longitude, latitude));
			geom.setSRID(4269);
			return geom;
		} catch (NullPointerException e) {
			return null;
		}
	}
}
