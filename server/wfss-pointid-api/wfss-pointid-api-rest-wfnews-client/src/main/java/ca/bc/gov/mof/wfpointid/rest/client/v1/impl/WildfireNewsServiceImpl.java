package ca.bc.gov.mof.wfpointid.rest.client.v1.impl;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.apache.commons.collections4.MultiValuedMap;
import org.apache.commons.collections4.multimap.ArrayListValuedHashMap;
import org.locationtech.jts.geom.Point;
import org.opengis.referencing.operation.TransformException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.mof.wfpointid.rest.client.BaseRestServiceClient;
import ca.bc.gov.mof.wfpointid.rest.client.GenericRestDAO;
import ca.bc.gov.mof.wfpointid.rest.client.GeometryConverters;
import ca.bc.gov.mof.wfpointid.rest.client.MultipartData;
import ca.bc.gov.mof.wfpointid.rest.client.Response;
import ca.bc.gov.mof.wfpointid.rest.client.RestDAOException;
import ca.bc.gov.mof.wfpointid.rest.client.v1.WildfireNewsServiceException;
import ca.bc.gov.mof.wfpointid.rest.client.v1.StageOfControl;
import ca.bc.gov.mof.wfpointid.rest.client.v1.WildfireNewsService;
import ca.bc.gov.mof.wfpointid.wfnews.rest.v1.resource.PublishedIncidentListResource;
import ca.bc.gov.mof.wfpointid.wfnews.rest.v1.resource.PublishedIncidentResource;
import ca.bc.gov.mof.wfpointid.wfnews.rest.v1.resource.SimplePublishedIncidentResource;
import ca.bc.gov.nrs.common.rest.resource.PagedResource;

public class WildfireNewsServiceImpl extends BaseRestServiceClient implements WildfireNewsService {

	private static final String INCIDENTS_PATH = "/publicPublishedIncident/";
	private static final int PAGE_SIZE = 20;

	private static final Logger logger = LoggerFactory.getLogger(WildfireNewsServiceImpl.class);
	
	public static final String CLIENT_VERSION = "1";
		
	/**
	 * Constructor used for making OAuth2 Client Credentials requests
	 * @param webadeOauth2ClientId
	 * @param webadeOauth2ClientSecret
	 * @param webadeOauth2TokenUrl
	 */
	public WildfireNewsServiceImpl() {
		super();
		logger.debug("<WildfireNewsServiceImpl");
		
		logger.debug(">WildfireNewsServiceImpl");
	}

	public String getClientVersion() {
		return CLIENT_VERSION;
	}

	@Override
	public Optional<PublishedIncidentResource> getPublishedIncident(final String incidentGuid)
			throws WildfireNewsServiceException {
		throw new UnsupportedOperationException();
	}

	
	private <T, P extends PagedResource> List<T> doGetPaged(String urlString, Class<P> pageClazz, Class<T> clazz, MultiValuedMap<String, String> queryParams, Function<P, ? extends Collection<T>> getItems) throws WildfireNewsServiceException {
		GenericRestDAO<P> dao = this.getRestDAOFactory().getGenericRestDAO(pageClazz);
		try {
			List<T> stations = null;
			String method = "GET";
			String eTag = null;
			Object resource = null;
			MultipartData[] files = null;
			Map<String,String> headerParams = null; 
			MultiValuedMap<String,String> fullQueryParams = new ArrayListValuedHashMap<>(queryParams);
			fullQueryParams.put("size", Integer.toString(PAGE_SIZE));
			
			Response<P> response = null;
			for(int i = 0; 
					response==null || response.getResource().getPageNumber()<response.getResource().getTotalPageCount()-1; 
					i++) {
				fullQueryParams.remove("page");
				fullQueryParams.put("page", Integer.toString(i));
				response = dao.Process(getTransformer(), urlString, method, eTag, resource, files, headerParams, fullQueryParams, getRestTemplate());
				if (stations==null) {
					stations = new ArrayList<>(response.getResource().getTotalRowCount());
				}
				stations.addAll(getItems.apply(response.getResource()));
			}
			return stations;
			
		} catch (RestDAOException e) {
			throw new WildfireNewsServiceException(e);
		} 
	}
	
	private static class Located<T> {
		@SuppressWarnings("unused")
		public final Point location;
		public final T value;
		
		public Located(Point location, T value) throws TransformException {
			super();
			this.location = location;
			this.value = value;
		}
		
	}
	
	private static class Distanced<T> extends Located<T>{
		public final double distance;
		
		public Distanced(Point location, double distance, T value) throws TransformException {
			super(location, value);
			this.distance = distance;
		}
		
	}

	@Override
	public Collection<SimplePublishedIncidentResource> getAllPublishedIncidents() throws WildfireNewsServiceException {
		throw new UnsupportedOperationException();
	}

	static class StreamException extends RuntimeException {

		private static final long serialVersionUID = -8387794448912786933L;

		public StreamException(Throwable cause) {
			super("Exception in closure", cause);
		}
		
		@SuppressWarnings("unchecked")
		public <T extends Throwable> void rethrow(Class<T> clazz) throws T {
			if(clazz.isInstance(this.getCause()) ) {
				throw (T) this.getCause();
			}
		}
	}
	
	@Override
	public List<SimplePublishedIncidentResource> getNearbyPublishedIncidents(Point p, double distance)
			throws WildfireNewsServiceException {

		try {
			
			URI topLevelRestURL = new URI(getTopLevelRestURL());
			String urlString = topLevelRestURL.resolve(INCIDENTS_PATH).toString();
			MultiValuedMap<String,String> queryParams = new ArrayListValuedHashMap<>();
			queryParams.put("latitude", Double.toString(p.getY()));
			queryParams.put("longitude", Double.toString(p.getX()));
			queryParams.put("radius", Double.toString(distance));
			queryParams.putAll("stageOfControlList", 
				StageOfControl.ACTIVE.stream()
					.map(StageOfControl::toString)
					.collect(Collectors.toList()));
			
			final Point albersPoint = GeometryConverters.geographicToProjected(p);
			
			try {
				return doGetPaged(urlString, PublishedIncidentListResource.class, SimplePublishedIncidentResource.class, queryParams, PublishedIncidentListResource::getCollection)
						// Sort them by distance
						.stream()
						.map(incident-> {
							try {
								Point latLon = GeometryConverters.latLon(Double.parseDouble(incident.getLatitude()), Double.parseDouble(incident.getLongitude()));
								Point albers = GeometryConverters.geographicToProjected(latLon);
								return new Distanced<SimplePublishedIncidentResource>(albers, albers.distance(albersPoint), incident);
							} catch (TransformException e) {
								throw new StreamException(e);
							}
						})
						.sorted(Comparator.comparingDouble(distanced->distanced.distance))
						.map(distanced->distanced.value)
						.collect(Collectors.toList());
			} catch (StreamException ex) {
				ex.rethrow(TransformException.class);
				throw ex;
			}
			
		} catch (URISyntaxException|TransformException|NumberFormatException|StreamException e) {
			throw new WildfireNewsServiceException(e);
		}
	}

	@Override
	public SimplePublishedIncidentResource getNearestPublishedIncident(Point p) throws WildfireNewsServiceException {
		throw new UnsupportedOperationException();
	}

	@Override
	public Optional<SimplePublishedIncidentResource> getNearestPublishedIncidentWithin(Point p, double distance)
			throws WildfireNewsServiceException {
		return getNearbyPublishedIncidents(p, distance).stream().findFirst();
	}
	


}
