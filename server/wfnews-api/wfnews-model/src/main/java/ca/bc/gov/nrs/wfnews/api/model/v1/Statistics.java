package ca.bc.gov.nrs.wfnews.api.model.v1;

import java.io.Serializable;

public interface Statistics extends Serializable {
  public int getActiveOutOfControlFires();
  public void setActiveOutOfControlFires(int activeOutOfControlFires);

  public int getActiveOutOfControlFiresOfNote();
  public void setActiveOutOfControlFiresOfNote(int activeOutOfControlFiresOfNote);

  public int getActiveBeingHeldFires();
  public void setActiveBeingHeldFires(int activeBeingHeldFires);

  public int getActiveBeingHeldFiresOfNote();
  public void setActiveBeingHeldFiresOfNote(int activeBeingHeldFiresOfNote);

  public int getActiveUnderControlFires();
  public void setActiveUnderControlFires(int activeUnderControlFires);

  public int getActiveUnderControlFiresOfNote();
  public void setActiveUnderControlFiresOfNote(int activeUnderControlFiresOfNote);

  public int getOutFires();
  public void setOutFires(int outFires);

  public int getActiveNaturalCausedFires();
  public void setActiveNaturalCausedFires(int activeNaturalCausedFires);

  public int getActiveHumanCausedFires();
  public void setActiveHumanCausedFires(int activeHumanCausedFires);

  public int getActiveUnknownCausedFires();
  public void setActiveUnknownCausedFires(int activeUnknownCausedFires);

  public int getExtinguishedNaturalCausedFires();
  public void setExtinguishedNaturalCausedFires(int extinguishedNaturalCausedFires);

  public int getExtinguishedHumanCausedFires();
  public void setExtinguishedHumanCausedFires(int extinguishedHumanCausedFires);

  public int getExtinguishedUnknownCausedFires();
  public void setExtinguishedUnknownCausedFires(int extinguishedUnknownCausedFires);

  public long getHectaresBurned();
  public void setHectaresBurned(long hectaresBurned);

  public int getNewFires24Hours();
  public void setNewFires24Hours(int newFires24Hours);

  public int getOutFires24Hours();
  public void setOutFires24Hours(int outFires24Hours);

  public int getOutFires7Days();
  public void setOutFires7Days(int outFires7Days);
}
