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
			projected = (ProjectedCRS) CRS.parseWKT("""
					PROJCS["NAD83 / BC Albers",
					    GEOGCS["NAD83",
					        DATUM["North_American_Datum_1983",
					            SPHEROID["GRS 1980",6378137,298.257222101,
					                AUTHORITY["EPSG","7019"]],
					            TOWGS84[0,0,0,0,0,0,0],
					            AUTHORITY["EPSG","6269"]],
					        PRIMEM["Greenwich",0,
					            AUTHORITY["EPSG","8901"]],
					        UNIT["degree",0.0174532925199433,
					            AUTHORITY["EPSG","9122"]],
					        AUTHORITY["EPSG","4269"]],
					    PROJECTION["Albers_Conic_Equal_Area"],
					    PARAMETER["standard_parallel_1",50],
					    PARAMETER["standard_parallel_2",58.5],
					    PARAMETER["latitude_of_center",45],
					    PARAMETER["longitude_of_center",-126],
					    PARAMETER["false_easting",1000000],
					    PARAMETER["false_northing",0],
					    UNIT["metre",1,
					        AUTHORITY["EPSG","9001"]],
					    AXIS["Easting",EAST],
					    AXIS["Northing",NORTH],
					    AUTHORITY["EPSG","3005"]]
					""");
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
