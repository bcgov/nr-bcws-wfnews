package ca.bc.gov.nrs.wfnews.api.rest.v1.resource;

import java.io.Serial;

import jakarta.xml.bind.annotation.XmlRootElement;

import ca.bc.gov.nrs.common.wfone.rest.resource.BaseResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.types.ResourceTypes;

@XmlRootElement(namespace = ResourceTypes.NAMESPACE, name = ResourceTypes.ENDPOINTS_NAME)
public class EndpointsRsrc extends BaseResource {
	@Serial
	private static final long serialVersionUID = -7844824213085594025L;

	private String releaseVersion;

	public String getReleaseVersion() {
		return releaseVersion;
	}

	public void setReleaseVersion(String releaseVersion) {
		this.releaseVersion = releaseVersion;
	}
}
