package ca.bc.gov.nrs.wfnews.api.rest.v1.common;

public class AttachmentsAwsConfig {
    private String bucketName;
    private String regionName;
    private String awsAccessKeyId;
    private String awsSecretAccessKey;

    public AttachmentsAwsConfig(String attachmentsBucketName, String attachmentsRegionName, String awsAccessKeyId, String awsSecretAccessKey) {
        this.bucketName = attachmentsBucketName;
        this.regionName = attachmentsRegionName;
        this.awsAccessKeyId = awsAccessKeyId;
        this.awsSecretAccessKey = awsSecretAccessKey;
    }

    public String getBucketName(){
        return bucketName;
    }

    public String getRegionName(){
        return regionName;
    }

    public String getAccessKeyId() {
        return awsAccessKeyId;
    }

    public String getSecretAccessKey() {
        return awsSecretAccessKey;
    }
}
