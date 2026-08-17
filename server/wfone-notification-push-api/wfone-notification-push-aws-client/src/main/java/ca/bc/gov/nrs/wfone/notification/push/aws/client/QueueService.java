package ca.bc.gov.nrs.wfone.notification.push.aws.client;

import com.amazonaws.services.sqs.model.Message;

import java.util.List;

public interface QueueService {

	List<Message> readMessages();

	void deleteMessageFromQueue(Message message);

	/** Hides the message for this many seconds, counted from now. */
	void changeMessageVisibility(Message message, int visibilityTimeoutSeconds);

	/** The receive call and the heartbeat both use this value. */
	int getVisibilityTimeoutSeconds();

}
