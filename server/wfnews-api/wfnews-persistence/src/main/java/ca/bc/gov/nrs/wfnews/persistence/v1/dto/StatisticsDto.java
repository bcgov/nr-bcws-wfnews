package ca.bc.gov.nrs.wfnews.persistence.v1.dto;

import java.io.Serializable;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.StatisticsResource;

public class StatisticsDto extends BaseDto implements Serializable {
  private static final long serialVersionUID = 1L;
	private static final Logger logger = LoggerFactory.getLogger(StatisticsDto.class);

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

  public StatisticsDto() { }

  public StatisticsDto(StatisticsDto dto) {
		this.activeOutOfControlFires = dto.activeOutOfControlFires;
    this.activeOutOfControlFiresOfNote = dto.activeOutOfControlFiresOfNote;
    this.activeBeingHeldFires = dto.activeBeingHeldFires;
    this.activeBeingHeldFiresOfNote = dto.activeBeingHeldFiresOfNote;
    this.activeUnderControlFires = dto.activeUnderControlFires;
    this.activeUnderControlFiresOfNote = dto.activeUnderControlFiresOfNote;
    this.outFires = dto.outFires;
    this.activeNaturalCausedFires = dto.activeNaturalCausedFires;
    this.activeHumanCausedFires = dto.activeHumanCausedFires;
    this.activeUnknownCausedFires = dto.activeUnknownCausedFires;
    this.extinguishedNaturalCausedFires = dto.extinguishedNaturalCausedFires;
    this.extinguishedHumanCausedFires = dto.extinguishedHumanCausedFires;
    this.extinguishedUnknownCausedFires = dto.extinguishedUnknownCausedFires;
    this.hectaresBurned = dto.hectaresBurned;
    this.newFires24Hours = dto.newFires24Hours;
    this.outFires24Hours = dto.outFires24Hours;
    this.outFires7Days = dto.outFires7Days;
  }

  public StatisticsDto(StatisticsResource resource) {
    this.activeOutOfControlFires = resource.getActiveOutOfControlFires();
    this.activeOutOfControlFiresOfNote = resource.getActiveOutOfControlFiresOfNote();
    this.activeBeingHeldFires = resource.getActiveBeingHeldFires();
    this.activeBeingHeldFiresOfNote = resource.getActiveBeingHeldFiresOfNote();
    this.activeUnderControlFires = resource.getActiveUnderControlFires();
    this.activeUnderControlFiresOfNote = resource.getActiveUnderControlFiresOfNote();
    this.outFires = resource.getOutFires();
    this.activeNaturalCausedFires = resource.getActiveNaturalCausedFires();
    this.activeHumanCausedFires = resource.getActiveHumanCausedFires();
    this.activeUnknownCausedFires = resource.getActiveUnknownCausedFires();
    this.extinguishedNaturalCausedFires = resource.getExtinguishedNaturalCausedFires();
    this.extinguishedHumanCausedFires = resource.getExtinguishedHumanCausedFires();
    this.extinguishedUnknownCausedFires = resource.getExtinguishedUnknownCausedFires();
    this.hectaresBurned = resource.getHectaresBurned();
    this.newFires24Hours = resource.getNewFires24Hours();
    this.outFires24Hours = resource.getOutFires24Hours();
    this.outFires7Days = resource.getOutFires7Days();
  }

  /**
   * Not needed for the Statistics Dto. Assume they're never equals. Non transactional read-only data
   * @param other
   * @return
   */
  @Override
  public boolean equalsAll(Object other) {
		return false;
  }

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

	public StatisticsDto copy() {
		return new StatisticsDto(this);
	}

	public Logger getLogger() {
		return logger;
	}

  /**
   * Not needed for the Statistics Dto. Assume they're never equals. Non transactional read-only data
   * @param other
   * @return
   */
  @Override
	public boolean equalsBK(Object other) {
		return false;
	} 
}
