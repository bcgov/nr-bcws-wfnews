package ca.bc.gov.nrs.wfnews.api.rest.v1.common;

public class AttachmentsAwsConfig {
    private String bucketName;
    private String regionName;

    public AttachmentsAwsConfig(String attachmentsBucketName, String attachmentsRegionName) {
        this.bucketName = attachmentsBucketName;
        this.regionName = attachmentsRegionName;
    }

    public String getBucketName(){
        return bucketName;
    }

    public String getRegionName(){
        return regionName;
    }
}
