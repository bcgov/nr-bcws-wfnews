package ca.bc.gov.nrs.wfone.notification.push.aws.client.consumer;

import ca.bc.gov.nrs.wfone.notification.push.aws.client.QueueService;
import ca.bc.gov.nrs.wfone.notification.push.aws.client.config.AWSConfig;
import com.amazon.sqs.javamessaging.AmazonSQSExtendedClient;
import com.amazon.sqs.javamessaging.ExtendedClientConfiguration;
import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.auth.DefaultAWSCredentialsProviderChain;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.sqs.AmazonSQS;
import com.amazonaws.services.sqs.AmazonSQSClientBuilder;
import com.amazonaws.services.sqs.model.DeleteMessageRequest;
import com.amazonaws.services.sqs.model.Message;
import com.amazonaws.services.sqs.model.ReceiveMessageRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

public class AWSQueueServiceImpl implements QueueService {
	private static final Logger logger = LoggerFactory.getLogger(AWSQueueServiceImpl.class);
	private AmazonSQS sqsClient;
	private AmazonS3 s3Client;
	private AWSConfig awsConfig;

	public AWSQueueServiceImpl(AWSConfig awsConfig) {
		this.s3Client = AmazonS3ClientBuilder.standard().withRegion(Regions.CA_CENTRAL_1).build();

		this.awsConfig = awsConfig;

		final ExtendedClientConfiguration extendedClientConfig = new ExtendedClientConfiguration()
				.withPayloadSupportEnabled(s3Client, awsConfig.getS3BucketName()).withAlwaysThroughS3(true);

		this.sqsClient = new AmazonSQSExtendedClient(AmazonSQSClientBuilder.defaultClient(), extendedClientConfig);
	}

	@Override
	public List<Message> readMessages() {
		ReceiveMessageRequest receiveMessageRequest = new ReceiveMessageRequest(awsConfig.getSqsQueueUrl())
				.withMaxNumberOfMessages(awsConfig.getSqsQueueReceiveMaxNumMessages())
				.withWaitTimeSeconds(awsConfig.getSqsQueueReceiveWaitTimeSeconds())
				.withMessageAttributeNames(awsConfig.getMonitorAttribute());

		List<Message> messages = sqsClient.receiveMessage(receiveMessageRequest).getMessages();
		logger.debug("read {} message from sqs", messages.size());

		return messages;
	}

	@Override
	public void deleteMessageFromQueue(Message message) {
		DeleteMessageRequest deleteMessageRequest = new DeleteMessageRequest().withQueueUrl(awsConfig.getSqsQueueUrl())
				.withReceiptHandle(message.getReceiptHandle());

		sqsClient.deleteMessage(deleteMessageRequest);
		logger.debug("delete message from sqs");
	}
}
