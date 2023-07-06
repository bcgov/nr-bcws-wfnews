package ca.bc.gov.nrs.wfone.notification.push.aws.client;

import com.amazonaws.services.sqs.model.Message;

import java.util.List;

public interface QueueService {

	List<Message> readMessages();

	void deleteMessageFromQueue(Message message);

}
