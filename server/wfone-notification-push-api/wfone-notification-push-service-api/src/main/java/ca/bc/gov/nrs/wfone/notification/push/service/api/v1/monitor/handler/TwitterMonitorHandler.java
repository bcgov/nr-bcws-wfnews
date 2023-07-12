package ca.bc.gov.nrs.wfone.notification.push.service.api.v1.monitor.handler;

import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.model.TwitterInformation;
import com.amazonaws.services.sqs.model.Message;
import org.json.JSONObject;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class TwitterMonitorHandler {

	public TwitterInformation handleMessage(Message message) throws ParseException {
		JSONObject jsonObject = new JSONObject(message.getBody());
		String idStr = (String) jsonObject.get("id_str");
		String text = (String) jsonObject.get("full_text");
		SimpleDateFormat formatter = new SimpleDateFormat("EEE MMM dd HH:mm:ss Z yyyy");
		Date createdAt = formatter.parse((String) jsonObject.get("created_at"));

		return new TwitterInformation(idStr, text, createdAt);
	}
}
