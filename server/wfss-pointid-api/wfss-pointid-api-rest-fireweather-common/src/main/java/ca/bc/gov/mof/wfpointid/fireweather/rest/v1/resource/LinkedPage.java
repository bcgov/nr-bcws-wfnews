package ca.bc.gov.mof.wfpointid.fireweather.rest.v1.resource;

import java.util.Map;
import java.util.Optional;

import com.fasterxml.jackson.annotation.JsonSetter;

public abstract class LinkedPage<T> extends Page<T> {

	Map<String, Link> links;
	Optional<PageMetadata> metadata = Optional.empty();

	public LinkedPage() {
		super();
	}

	public Optional<String> getNext() {
		return Optional.ofNullable(getLinks().get("next")).map(Link::getHref);
	}

	public Map<String, Link> getLinks() {
		return links;
	}

	@JsonSetter("_links")
	public void setLinks(Map<String, Link> links) {
		this.links = links;
	}

	public Optional<PageMetadata> getMetadata() {
		return metadata;
	}

	@JsonSetter("page")
	public void setMetadata(PageMetadata metadata) {
		this.metadata = Optional.of(metadata);
	}

	@Override
	public boolean isLast() {
		return getMetadata()
				.map(x->x.getNumber()==x.getTotalPages())
				.orElse(true);
	}

	@Override
	public int getTotal() {
		return getMetadata()
				.map(PageMetadata::getTotalElements)
				.orElseGet(()->getItems().size());
	}

}