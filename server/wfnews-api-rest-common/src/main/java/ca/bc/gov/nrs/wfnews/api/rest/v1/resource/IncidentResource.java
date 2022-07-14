package ca.bc.gov.nrs.wfnews.api.rest.v1.resource;

import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

import org.codehaus.jackson.annotate.JsonSubTypes;
import org.codehaus.jackson.annotate.JsonSubTypes.Type;
import org.codehaus.jackson.annotate.JsonTypeInfo;
import org.codehaus.jackson.annotate.JsonTypeName;

import ca.bc.gov.nrs.wfone.common.model.Message;
import ca.bc.gov.nrs.common.wfone.rest.resource.BaseResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.types.ResourceTypes;
import ca.bc.gov.nrs.wfnews.api.model.v1.Incident;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "@type")
@JsonTypeName(ResourceTypes.INCIDENT)
public class IncidentResource extends BaseResource implements Incident {

	private static final long serialVersionUID = 1L;
	
	private List<Message> errorMessages = new ArrayList<Message>();

	public IncidentResource() {
		
	}
	
	String fireNumber;
	Integer fireYear;
	Long ignitionDate;
	String fireStatus;
	String fireCause;
	Integer fireCentre;
	Integer zone;
	Integer fireID;
	String fireType;
	String geographicDescription;
	Double latitude;
	Double longitude;
	Integer currentSize;
	String fireOfNoteID;
	String fireOfNoteName;
	String fireOfNoteURL;
	String featureCode;
	Integer objectID;
	String globalID;

	public String getFireNumber() {
		return this.fireNumber;
	}

	public void setFireNumber(String fireNumber) {
		this.fireNumber = fireNumber;
	}

	public Integer getFireYear() {
		return this.fireYear;
	}

	public void setFireYear(Integer fireYear) {
		this.fireYear = fireYear;
	}

	public Long getIgnitionDate() {
		return this.ignitionDate;
	}

	public void setIgnitionDate(Long ignitionDate) {
		this.ignitionDate = ignitionDate;
	}

	public String getFireStatus() {
		return this.fireStatus;
	}

	public void setFireStatus(String fireStatus) {
		this.fireStatus = fireStatus;
	}

	public String getFireCause() {
		return this.fireCause;
	}

	public void setFireCause(String fireCause) {
		this.fireCause = fireCause;
	}

	public Integer getFireCentre() {
		return this.fireCentre;
	}

	public void setFireCentre(Integer fireCentre) {
		this.fireCentre = fireCentre;
	}

	public Integer getZone() {
		return this.zone;
	}

	public void setZone(Integer zone) {
		this.zone = zone;
	}

	public Integer getFireID() {
		return this.fireID;
	}

	public void setFireID(Integer fireID) {
		this.fireID = fireID;
	}

	public String getFireType() {
		return this.fireType;
	}

	public void setFireType(String fireType) {
		this.fireType = fireType;
	}

	public String getGeographicDescription() {
		return this.geographicDescription;
	}

	public void setGeographicDescription(String geographicDescription) {
		this.geographicDescription = geographicDescription;
	}

	public Double getLatitude() {
		return this.latitude;
	}

	public void setLatitude(Double latitude) {
		this.latitude = latitude;
	}

	public Double getLongitude() {
		return this.longitude;
	}

	public void setLongitude(Double longitude) {
		this.longitude = longitude;
	}

	public Integer getCurrentSize() {
		return this.currentSize;
	}

	public void setCurrentSize(Integer currentSize) {
		this.currentSize = currentSize;
	}

	public String getFireOfNoteID() {
		return this.fireOfNoteID;
	}

	public void setFireOfNoteID(String fireOfNoteID) {
		this.fireOfNoteID = fireOfNoteID;
	}

	public String getFireOfNoteName() {
		return this.fireOfNoteName;
	}

	public void setFireOfNoteName(String fireOfNoteName) {
		this.fireOfNoteName = fireOfNoteName;
	}

	public String getFireOfNoteURL() {
		return this.fireOfNoteURL;
	}

	public void setFireOfNoteURL(String fireOfNoteURL) {
		this.fireOfNoteURL = fireOfNoteURL;
	}

	public String getFeatureCode() {
		return this.featureCode;
	}

	public void setFeatureCode(String featureCode) {
		this.featureCode = featureCode;
	}

	public Integer getObjectID() {
		return this.objectID;
	}

	public void setObjectID(Integer objectID) {
		this.objectID = objectID;
	}

	public String getGlobalID() {
		return this.globalID;
	}

	public void setGlobalID(String globalID) {
		this.globalID = globalID;
	}

	@Override
	@XmlElement(name="errorMessages")
	public List<Message> getErrorMessages() {
		return errorMessages;
	}

	@Override
	public void setErrorMessages(List<Message> errorMessages) {
		this.errorMessages = errorMessages;
	}
}