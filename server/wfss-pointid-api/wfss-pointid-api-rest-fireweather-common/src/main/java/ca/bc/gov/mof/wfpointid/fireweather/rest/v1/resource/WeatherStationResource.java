package ca.bc.gov.mof.wfpointid.fireweather.rest.v1.resource;

import java.io.Serializable;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonSetter;

import org.locationtech.jts.geom.Point;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@JsonIgnoreProperties(ignoreUnknown=true)
public class WeatherStationResource implements Serializable {
	@SuppressWarnings("unused")
	private static final Logger logger = LoggerFactory.getLogger(WeatherStationResource.class);

	private static final long serialVersionUID = 1L;

	private UUID id;
	
	private String displayLabel;

	private String createdBy;

	private String lastModifiedBy;

	private Long lastEntityUpdateTimestamp;

	private Date updateDate;

	private Integer stationCode;

	private String stationAcronym;

	private Boolean hourly;

	private Double latitude;

	private Double longitude;

	@JsonIgnore
	private Point geometry;

	private Integer elevation;

	private Double windspeedAdjRoughness;

	private Boolean overWinterPrecipAdj;

	private Integer influencingSlope;

	private Long installationDate;

	private Long decommissionDate;

	private String comments;

	private String ecccFileBaseUrlTemplate;

	private String lastProcessedSourceTime;

	private String crdStationName;

  private Boolean pluvioSnowGuage;

  private String stationAccessDescription;

	private Map<?,?> dataSource;
  private Map<?,?> windspeedHeight;
	private Map<?,?> stationStatus;
	private Map<?,?> dataLoggerType;
	private Map<?,?> siteType;
	private Map<?,?> weatherZone;
	private Map<?,?> fireCentre;
  private Map<?,?> stationAccessTypeCode;
  private Map<?,?> surfaceType;
	private Object influencingAspect;
	private Object owner;
	private Object zone;
	private Map<String,Link> links;

	@JsonIgnore
	private Point albersGeometry;

	public UUID getId() {
		return id;
	}

	public void setId(UUID id) {
		this.id = id;
	}

	public String getDisplayLabel() {
		return displayLabel;
	}

	public void setDisplayLabel(String displayLabel) {
		this.displayLabel = displayLabel;
	}

	public String getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(String createdBy) {
		this.createdBy = createdBy;
	}

	public String getLastModifiedBy() {
		return lastModifiedBy;
	}

	public void setLastModifiedBy(String lastModifiedBy) {
		this.lastModifiedBy = lastModifiedBy;
	}

	public Long getLastEntityUpdateTimestamp() {
		return lastEntityUpdateTimestamp;
	}

	public void setLastEntityUpdateTimestamp(Long lastEntityUpdateTimestamp) {
		this.lastEntityUpdateTimestamp = lastEntityUpdateTimestamp;
	}

	public Date getUpdateDate() {
		return updateDate;
	}

	public void setUpdateDate(Date updateDate) {
		this.updateDate = updateDate;
	}

	public Integer getStationCode() {
		return stationCode;
	}

	public void setStationCode(Integer stationCode) {
		this.stationCode = stationCode;
	}

	public String getStationAcronym() {
		return stationAcronym;
	}

	public void setStationAcronym(String stationAcronym) {
		this.stationAcronym = stationAcronym;
	}

	public Map<?,?> getDataSource() {
		return dataSource;
	}

	public void setDataSource(Map<?,?> dataSource) {
		this.dataSource = dataSource;
	}

	public Boolean getHourly() {
		return hourly;
	}

	public void setHourly(Boolean hourly) {
		this.hourly = hourly;
	}

	public Double getLatitude() {
		return latitude;
	}

	public void setLatitude(Double latitude) {
		this.latitude = latitude;
	}

	public Double getLongitude() {
		return longitude;
	}

	public void setLongitude(Double longitude) {
		this.longitude = longitude;
	}
	
	@JsonIgnore
	public void setGeometry(Point geom) {
		this.geometry = geom;
	}
	
	@JsonIgnore
	public Point getGeometry() {
		return this.geometry;
	}

	public Integer getElevation() {
		return elevation;
	}

	public void setElevation(Integer elevation) {
		this.elevation = elevation;
	}

	public Double getWindspeedAdjRoughness() {
		return windspeedAdjRoughness;
	}

	public void setWindspeedAdjRoughness(Double windspeedAdjRoughness) {
		this.windspeedAdjRoughness = windspeedAdjRoughness;
	}

  public Map<?, ?> getStationAccessTypeCode() {
		return stationAccessTypeCode;
	}

	public void setStationAccessTypeCode(Map<?, ?> stationAccessTypeCode) {
		this.stationAccessTypeCode = stationAccessTypeCode;
	}

	public Map<?, ?> getWindspeedHeight() {
		return windspeedHeight;
	}

	public void setWindspeedHeight(Map<?, ?> windspeedHeight) {
		this.windspeedHeight = windspeedHeight;
	}

	public Boolean getOverWinterPrecipAdj() {
		return overWinterPrecipAdj;
	}

	public void setOverWinterPrecipAdj(Boolean overWinterPrecipAdj) {
		this.overWinterPrecipAdj = overWinterPrecipAdj;
	}

	public Integer getInfluencingSlope() {
		return influencingSlope;
	}

	public void setInfluencingSlope(Integer influencingSlope) {
		this.influencingSlope = influencingSlope;
	}

	public Long getInstallationDate() {
		return installationDate;
	}

	public void setInstallationDate(Long installationDate) {
		this.installationDate = installationDate;
	}

	public Long getDecommissionDate() {
		return decommissionDate;
	}

	public void setDecommissionDate(Long decommissionDate) {
		this.decommissionDate = decommissionDate;
	}

	public String getComments() {
		return comments;
	}

	public void setComments(String comments) {
		this.comments = comments;
	}

	public String getEcccFileBaseUrlTemplate() {
		return ecccFileBaseUrlTemplate;
	}

	public void setEcccFileBaseUrlTemplate(String ecccFileBaseUrlTemplate) {
		this.ecccFileBaseUrlTemplate = ecccFileBaseUrlTemplate;
	}

	public String getLastProcessedSourceTime() {
		return lastProcessedSourceTime;
	}

	public void setLastProcessedSourceTime(String lastProcessedSourceTime) {
		this.lastProcessedSourceTime = lastProcessedSourceTime;
	}

	public String getCrdStationName() {
		return crdStationName;
	}

	public void setCrdStationName(String crdStationName) {
		this.crdStationName = crdStationName;
	}

	public Map<?, ?> getStationStatus() {
		return stationStatus;
	}

	public void setStationStatus(Map<?, ?> stationStatus) {
		this.stationStatus = stationStatus;
	}

	public Map<?, ?> getDataLoggerType() {
		return dataLoggerType;
	}

	public void setDataLoggerType(Map<?, ?> dataLoggerType) {
		this.dataLoggerType = dataLoggerType;
	}

	public Map<?, ?> getSiteType() {
		return siteType;
	}

	public void setSiteType(Map<?, ?> siteType) {
		this.siteType = siteType;
	}

	public Map<?, ?> getWeatherZone() {
		return weatherZone;
	}

	public void setWeatherZone(Map<?, ?> weatherZone) {
		this.weatherZone = weatherZone;
	}

	public Map<?, ?> getFireCentre() {
		return fireCentre;
	}

	public void setFireCentre(Map<?, ?> fireCentre) {
		this.fireCentre = fireCentre;
	}

	public Object getInfluencingAspect() {
		return influencingAspect;
	}

	public void setInfluencingAspect(Object influencingAspect) {
		this.influencingAspect = influencingAspect;
	}

	public Object getOwner() {
		return owner;
	}

	public void setOwner(Object owner) {
		this.owner = owner;
	}

	public Object getZone() {
		return zone;
	}

	public void setZone(Object zone) {
		this.zone = zone;
	}

  public Boolean getPluvioSnowGuage() {
    return this.pluvioSnowGuage;
  }

  public void setPluvioSnowGuage(Boolean pluvioSnowGuage) {
    this.pluvioSnowGuage = pluvioSnowGuage;
  }

  public Map<?, ?> getSurfaceType() {
    return this.surfaceType;
  }

  public void setSurfaceType(Map<?, ?> surfaceType) {
    this.surfaceType = surfaceType;
  }

	public Map<String, Link> getLinks() {
		return links;
	}

  public String getStationAccessDescription() {
    return this.stationAccessDescription;
  }

  public void setStationAccessDescription(String stationAccessDescription) {
    this.stationAccessDescription = stationAccessDescription;
  }

	@JsonSetter("_links")
	public void setLinks(Map<String, Link> links) {
		this.links = links;
	}
	
	@JsonIgnore
	public Point getAlbersGeometry() {
		return this.albersGeometry;
	}
	@JsonIgnore
	public void setAlbersGeometry(Point albersGeometry) {
		this.albersGeometry = albersGeometry;
	}
}
