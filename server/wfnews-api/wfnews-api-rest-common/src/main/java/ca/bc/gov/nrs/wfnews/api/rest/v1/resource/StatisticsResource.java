package ca.bc.gov.nrs.wfnews.api.rest.v1.resource;

import javax.xml.bind.annotation.XmlRootElement;

import org.codehaus.jackson.annotate.JsonTypeInfo;
import org.codehaus.jackson.annotate.JsonTypeName;

import ca.bc.gov.nrs.common.rest.resource.BaseResource;
import ca.bc.gov.nrs.wfnews.api.model.v1.Statistics;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.types.ResourceTypes;

@XmlRootElement(namespace = ResourceTypes.NAMESPACE, name = ResourceTypes.STATISTICS_NAME)
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "@type")
@JsonTypeName(ResourceTypes.STATISTICS)
public class StatisticsResource extends BaseResource implements Statistics {
  private static final long serialVersionUID = 1L;
  private int activeOutOfControlFires;
  private int activeOutOfControlFiresOfNote;
  private int activeBeingHeldFires;
  private int activeBeingHeldFiresOfNote;
  private int activeUnderControlFires;
  private int activeUnderControlFiresOfNote;
  private int outFires;
  private int activeNaturalCausedFires;
  private int activeHumanCausedFires;
  private int activeUnknownCausedFires;
  private int extinguishedNaturalCausedFires;
  private int extinguishedHumanCausedFires;
  private int extinguishedUnknownCausedFires;
  private long hectaresBurned;
  private int newFires24Hours;
  private int outFires24Hours;
  private int outFires7Days;

  public int getActiveOutOfControlFires() {
    return activeOutOfControlFires;
  }
  
  public void setActiveOutOfControlFires(int activeOutOfControlFires) {
    this.activeOutOfControlFires = activeOutOfControlFires;
  }

  public int getActiveOutOfControlFiresOfNote() {
    return activeOutOfControlFiresOfNote;
  }

  public void setActiveOutOfControlFiresOfNote(int activeOutOfControlFiresOfNote) {
    this.activeOutOfControlFiresOfNote = activeOutOfControlFiresOfNote;
  }

  public int getActiveBeingHeldFires() {
    return activeBeingHeldFires;
  }

  public void setActiveBeingHeldFires(int activeBeingHeldFires) {
    this.activeBeingHeldFires = activeBeingHeldFires;
  }

  public int getActiveBeingHeldFiresOfNote() {
    return activeBeingHeldFiresOfNote;
  }

  public void setActiveBeingHeldFiresOfNote(int activeBeingHeldFiresOfNote) {
    this.activeBeingHeldFiresOfNote = activeBeingHeldFiresOfNote;
  }

  public int getActiveUnderControlFires() {
    return activeUnderControlFires;
  }

  public void setActiveUnderControlFires(int activeUnderControlFires) {
    this.activeUnderControlFires = activeUnderControlFires;
  }

  public int getActiveUnderControlFiresOfNote() {
    return activeUnderControlFiresOfNote;
  }

  public void setActiveUnderControlFiresOfNote(int activeUnderControlFiresOfNote) {
    this.activeUnderControlFiresOfNote = activeUnderControlFiresOfNote;
  }

  public int getOutFires() {
    return outFires;
  }

  public void setOutFires(int outFires) {
    this.outFires = outFires;
  }

  public int getActiveNaturalCausedFires() {
    return activeNaturalCausedFires;
  }

  public void setActiveNaturalCausedFires(int activeNaturalCausedFires) {
    this.activeNaturalCausedFires = activeNaturalCausedFires;
  }

  public int getActiveHumanCausedFires() {
    return activeHumanCausedFires;
  }

  public void setActiveHumanCausedFires(int activeHumanCausedFires) {
    this.activeHumanCausedFires = activeHumanCausedFires;
  }

  public int getActiveUnknownCausedFires() {
    return activeUnknownCausedFires;
  }

  public void setActiveUnknownCausedFires(int activeUnknownCausedFires) {
    this.activeUnknownCausedFires = activeUnknownCausedFires;
  }

  public int getExtinguishedNaturalCausedFires() {
    return extinguishedNaturalCausedFires;
  }

  public void setExtinguishedNaturalCausedFires(int extinguishedNaturalCausedFires) {
    this.extinguishedNaturalCausedFires = extinguishedNaturalCausedFires;
  }

  public int getExtinguishedHumanCausedFires() {
    return extinguishedHumanCausedFires;
  }

  public void setExtinguishedHumanCausedFires(int extinguishedHumanCausedFires) {
    this.extinguishedHumanCausedFires = extinguishedHumanCausedFires;
  }

  public int getExtinguishedUnknownCausedFires() {
    return extinguishedUnknownCausedFires;
  }

  public void setExtinguishedUnknownCausedFires(int extinguishedUnknownCausedFires) {
    this.extinguishedUnknownCausedFires = extinguishedUnknownCausedFires;
  }

  public long getHectaresBurned() {
    return hectaresBurned;
  }

  public void setHectaresBurned(long hectaresBurned) {
    this.hectaresBurned = hectaresBurned;
  }

  public int getNewFires24Hours() {
    return newFires24Hours;
  }

  public void setNewFires24Hours(int newFires24Hours) {
    this.newFires24Hours = newFires24Hours;
  }

  public int getOutFires24Hours() {
    return outFires24Hours;
  }

  public void setOutFires24Hours(int outFires24Hours) {
    this.outFires24Hours = outFires24Hours;
  }

  public int getOutFires7Days() {
    return outFires7Days;
  }
  
  public void setOutFires7Days(int outFires7Days) {
    this.outFires7Days = outFires7Days;
  }
}
