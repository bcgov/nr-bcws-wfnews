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

	@Value("${wfone.aws.sqs.queue.public.mobile.notification.url}")
	private String awsSqsQueueUrl;

	@Value("${wfone.aws.sqs.queue.public.mobile.notification.monitor.attribute}")
	private String awsSqsQueueMonitorAttribute;

	@Value("${wfone.aws.sqs.queue.receive.max.num.messages}")
	private Integer awsSqsQueueReceiveMaxNumMessages;

	@Value("${wfone.aws.sqs.queue.receive.wait.time.seconds}")
	private Integer awsSqsQueueReceiveWaitTimeSeconds;

	@Value("${wfone.aws.sqs.queue.s3.bucket.name}")
	private String awsSqsQueueS3BucketName;

	@Value("${wfone.aws.access.key}")
	private String awsAccessKey;

	@Value("${wfone.aws.secret.key}")
	private String awsSecretKey;

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
		result.setAwsAccessKey(awsAccessKey);
		result.setAwsSecretKey(awsSecretKey);

		return result;
	}
}
