package ca.bc.gov.nrs.wfone.notification.push.aws.client.config;

public class AWSConfig {
	private String sqsQueueUrl;
	private Integer sqsQueueReceiveMaxNumMessages;
	private Integer sqsQueueReceiveWaitTimeSeconds;
	private Integer sqsQueueReceiveVisibilityTimeoutSeconds;
	private String monitorAttribute;
	private String s3BucketName;

	public String getSqsQueueUrl() {
		return sqsQueueUrl;
	}

	public void setSqsQueueUrl(String sqsQueueUrl) {
		this.sqsQueueUrl = sqsQueueUrl;
	}

	public Integer getSqsQueueReceiveMaxNumMessages() {
		return sqsQueueReceiveMaxNumMessages;
	}

	public void setSqsQueueReceiveMaxNumMessages(Integer sqsQueueReceiveMaxNumMessages) {
		this.sqsQueueReceiveMaxNumMessages = sqsQueueReceiveMaxNumMessages;
	}

	public Integer getSqsQueueReceiveWaitTimeSeconds() {
		return sqsQueueReceiveWaitTimeSeconds;
	}

	public void setSqsQueueReceiveWaitTimeSeconds(Integer sqsQueueReceiveWaitTimeSeconds) {
		this.sqsQueueReceiveWaitTimeSeconds = sqsQueueReceiveWaitTimeSeconds;
	}

	public Integer getSqsQueueReceiveVisibilityTimeoutSeconds() {
		return sqsQueueReceiveVisibilityTimeoutSeconds;
	}

	public void setSqsQueueReceiveVisibilityTimeoutSeconds(Integer sqsQueueReceiveVisibilityTimeoutSeconds) {
		this.sqsQueueReceiveVisibilityTimeoutSeconds = sqsQueueReceiveVisibilityTimeoutSeconds;
	}

	public String getMonitorAttribute() {
		return monitorAttribute;
	}

	public void setMonitorAttribute(String monitorAttribute) {
		this.monitorAttribute = monitorAttribute;
	}

	public String getS3BucketName() {
		return s3BucketName;
	}

	public void setS3BucketName(String s3BucketName) {
		this.s3BucketName = s3BucketName;
	}
}
