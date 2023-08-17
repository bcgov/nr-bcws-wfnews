package ca.bc.gov.nrs.wfone.notification.push.aws.client.spring;

import ca.bc.gov.nrs.wfone.notification.push.aws.client.config.AWSConfig;
import ca.bc.gov.nrs.wfone.notification.push.aws.client.consumer.AWSQueueServiceImpl;
import ca.bc.gov.nrs.wfone.notification.push.aws.client.QueueService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AwsClientSpringConfig {

	private static final Logger logger = LoggerFactory.getLogger(AwsClientSpringConfig.class);

	@Value("${WFONE_SQS_QUEUE_NOTIFICATION_URL}")
	private String awsSqsQueueUrl;

	@Value("${WFONE_PUSH_NOTIFICATION_SQS_MONITOR_ATTRIBUTE}")
	private String awsSqsQueueMonitorAttribute;

	@Value("${WFONE_PUSH_NOTIFICATION_SQS_MAX_MESSAGES}")
	private Integer awsSqsQueueReceiveMaxNumMessages;

	@Value("${WFONE_PUSH_NOTIFICATION_SQS_WAIT_SECONDS}")
	private Integer awsSqsQueueReceiveWaitTimeSeconds;

	@Value("${WFONE_PM_SQS_S3_BUCKET_NAME}")
	private String awsSqsQueueS3BucketName;

	public AwsClientSpringConfig() {
		logger.debug("<AwsClientSpringConfig");

		logger.debug(">AwsClientSpringConfig");
	}

	@Bean
	public QueueService queueService() {
		AWSQueueServiceImpl result = new AWSQueueServiceImpl(awsConfig());

		return result;
	}

	@Bean()
	public AWSConfig awsConfig() {
		AWSConfig result = new AWSConfig();
		result.setSqsQueueUrl(awsSqsQueueUrl);
		result.setSqsQueueReceiveMaxNumMessages(awsSqsQueueReceiveMaxNumMessages);
		result.setSqsQueueReceiveWaitTimeSeconds(awsSqsQueueReceiveWaitTimeSeconds);
		result.setMonitorAttribute(awsSqsQueueMonitorAttribute);
		result.setS3BucketName(awsSqsQueueS3BucketName);

		return result;
	}
}
