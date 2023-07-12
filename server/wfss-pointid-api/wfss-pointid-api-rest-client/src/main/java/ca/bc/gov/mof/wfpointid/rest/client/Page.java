package ca.bc.gov.mof.wfpointid.rest.client;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.fasterxml.jackson.annotation.JsonSetter;


public class Page<T> {
	List<T> items;
	Map<String, URI> links;
	
	public Page(List<T> items, Map<String, URI> links) {
		super();
		this.items = items;
		this.links = links;
	}

	
	@JsonSetter("_embeded")
	public void setItems(List<T> items) {
		this.items = items;
	}
	
	@JsonSetter("_links")
	public void setLinks(Map<String, Map<String, String>> links) throws RestDAOException {
		this.links = new HashMap<>();
		List<Map.Entry<String, Map<String, String>>> badLinks = new ArrayList<>(links.size());
		links.entrySet().forEach( pair -> {
			try {
				this.links.put(pair.getKey(), new URI(pair.getValue().get("href")));
			} catch (URISyntaxException|NullPointerException e) {
				badLinks.add(pair);
			}
		});
		if(!badLinks.isEmpty()) {
			throw new RestDAOException("Could not parse link "+badLinks.iterator().next().getKey());
		}
	}

	public List<T> getItems() {
		return items;
	}
	
	public Map<String, URI> getLinks() {
		return links;
	}
	
	public Optional<URI> getNext() {
		return Optional.ofNullable(links.get("next"));
	}
}
