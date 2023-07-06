package ca.bc.gov.nrs.wfone.resource;

public class BanProhibitionDetail {

    public enum FireStatus {
        PROHIBITIONS,
        PERMITTED,
        UNRESTRICTED
    }

    private String fireCentre;
    private FireStatus openFiresStatus;
    private FireStatus campfiresStatus;
    private FireStatus forestUseStatus;

    public String getFireCentre() {
        return fireCentre;
    }

    public void setFireCentre(String fireCentre) {
        this.fireCentre = fireCentre;
    }

    public FireStatus getOpenFiresStatus() {
        return openFiresStatus;
    }

    public void setOpenFiresStatus(FireStatus openFiresStatus) {
        this.openFiresStatus = openFiresStatus;
    }

    public FireStatus getCampfiresStatus() {
        return campfiresStatus;
    }

    public void setCampfiresStatus(FireStatus campfiresStatus) {
        this.campfiresStatus = campfiresStatus;
    }

    public FireStatus getForestUseStatus() {
        return forestUseStatus;
    }

    public void setForestUseStatus(FireStatus forestUseStatus) {
        this.forestUseStatus = forestUseStatus;
    }
}
