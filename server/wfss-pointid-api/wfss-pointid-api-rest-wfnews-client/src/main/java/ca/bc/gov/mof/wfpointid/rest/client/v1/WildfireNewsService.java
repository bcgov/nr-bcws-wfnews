package ca.bc.gov.mof.wfpointid.rest.client.v1;

import java.util.Collection;
import java.util.Optional;

import org.locationtech.jts.geom.Point;

import ca.bc.gov.mof.wfpointid.wfnews.rest.v1.resource.PublishedIncidentResource;
import ca.bc.gov.mof.wfpointid.wfnews.rest.v1.resource.SimplePublishedIncidentResource;

public interface WildfireNewsService {

	/**
	 * Get the published incident with id incidentId.
	 */
	Optional<PublishedIncidentResource> getPublishedIncident(String incidentId) throws WildfireNewsServiceException;

	/**
	 * Get all published incidents.
	 */
	Collection<SimplePublishedIncidentResource> getAllPublishedIncidents() throws WildfireNewsServiceException;

	/**
	 * Get all published incidents within distance metres of p.
	 */
	Collection<SimplePublishedIncidentResource> getNearbyPublishedIncidents(Point p, double distance)
			throws WildfireNewsServiceException;

	/**
	 * Get the nearest published incident to p.
	 */
	SimplePublishedIncidentResource getNearestPublishedIncident(Point p) throws WildfireNewsServiceException;

	/**
	 * Get the nearest published incident to p provided it is less than distance meters from p.
	 */
	Optional<SimplePublishedIncidentResource> getNearestPublishedIncidentWithin(Point p, double distance)
			throws WildfireNewsServiceException;
}
