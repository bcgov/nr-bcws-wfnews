package ca.bc.gov.nrs.wfone.notification.push.aws.client.config;

public class AWSConfig {
	private String sqsQueueUrl;
	private Integer sqsQueueReceiveMaxNumMessages;
	private Integer sqsQueueReceiveWaitTimeSeconds;
	private String monitorAttribute;
	private String s3BucketName;
	private String awsAccessKey;
	private String awsSecretKey;

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

	public String getAwsAccessKey() {
		return awsAccessKey;
	}

	public void setAwsAccessKey(String awsAccessKey) {
		this.awsAccessKey = awsAccessKey;
	}

	public String getAwsSecretKey() {
		return awsSecretKey;
	}

	public void setAwsSecretKey(String awsSecretKey) {
		this.awsSecretKey = awsSecretKey;
	}
}
