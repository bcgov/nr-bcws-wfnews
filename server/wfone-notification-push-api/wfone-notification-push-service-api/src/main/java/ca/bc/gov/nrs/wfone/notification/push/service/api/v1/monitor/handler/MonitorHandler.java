package ca.bc.gov.nrs.wfone.notification.push.service.api.v1.monitor.handler;

import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.model.MessageInformation;
import com.amazonaws.services.sqs.model.Message;

public interface MonitorHandler {

	MessageInformation handleMessage(Message message);

}
