package ca.bc.gov.nrs.wfone.notification.push.service.api.v1.monitor.handler;

import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.model.MessageInformation;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.type.NotificationTopics;
import com.amazonaws.services.sqs.model.Message;
import com.amazonaws.services.sqs.model.MessageAttributeValue;
import org.junit.Assert;
import org.junit.Test;

import com.google.common.hash.Hashing;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

public class SpatialMonitorHandlerTest {

    private String getExpectedHash(String input) throws Exception {
        return Hashing.murmur3_128().hashString(input, StandardCharsets.UTF_8).toString();
    }

    private Message createMessage(String monitorType, String body) {
        Message message = new Message();
        Map<String, MessageAttributeValue> attributes = new HashMap<>();
        MessageAttributeValue monitorTypeAttr = new MessageAttributeValue();
        monitorTypeAttr.setStringValue(monitorType);
        attributes.put("monitorType", monitorTypeAttr);
        message.setMessageAttributes(attributes);
        message.setBody(body);
        return message;
    }

    @Test
    public void testActiveFiresHashing() throws Exception {
        SpatialMonitorHandler handler = new SpatialMonitorHandler();
        String jsonBody = "{ \"incidentNumberLabel\": \"V12345\", \"discoveryDate\": 160000000, \"latitude\": 50.0, \"longitude\": -120.0 }";
        Message message = createMessage("active-fires", jsonBody);

        MessageInformation info = handler.handleMessage(message);

        Assert.assertEquals("V12345", info.getMessageId());
        Assert.assertEquals(getExpectedHash(jsonBody), info.getItemIdentifier());
        Assert.assertEquals(NotificationTopics.BCWF_ACTIVEFIRES_PUBLIVIEW, info.getTopic());
    }

    @Test
    public void testAreaRestrictionsHashing() throws Exception {
        SpatialMonitorHandler handler = new SpatialMonitorHandler();
        String jsonBody = "{ \"attributes\": { \"FIRE_CENTRE_NAME\": \"Kamloops Fire Centre\", \"ACCESS_STATUS_EFFECTIVE_DATE\": 160000000 }, \"geometry\": { \"x\": 10, \"y\": 20 } }";
        Message message = createMessage("area-restrictions", jsonBody);

        MessageInformation info = handler.handleMessage(message);

        Assert.assertEquals("Kamloops Fire Centre", info.getMessageId());
        Assert.assertEquals(getExpectedHash(jsonBody), info.getItemIdentifier());
        Assert.assertEquals(NotificationTopics.BRITISH_COLUMBIA_AREA_RESTRICTIONS, info.getTopic());
    }
    
    @Test
    public void testBansProhibitionsHashing() throws Exception {
        SpatialMonitorHandler handler = new SpatialMonitorHandler();
        String jsonBody = "{ \"attributes\": { \"FIRE_CENTRE_NAME\": \"Cariboo Fire Centre\", \"ACCESS_STATUS_EFFECTIVE_DATE\": 160000000 }, \"geometry\": { \"x\": 10, \"y\": 20 } }";
        Message message = createMessage("bans-prohibitions", jsonBody);

        MessageInformation info = handler.handleMessage(message);

        Assert.assertEquals("Cariboo Fire Centre", info.getMessageId());
        Assert.assertEquals(getExpectedHash(jsonBody), info.getItemIdentifier());
        Assert.assertEquals(NotificationTopics.BRITISH_COLUMBIA_BANS_AND_PROHIBITION_AREAS, info.getTopic());
    }

    @Test
    public void testEvacuationOrdersAlertsHashing() throws Exception {
        SpatialMonitorHandler handler = new SpatialMonitorHandler();
        String jsonBody = "{ \"attributes\": { \"EVENT_NAME\": \"Lytton Evacuation\", \"DATE_MODIFIED\": 160000000 }, \"geometry\": { \"x\": 10, \"y\": 20 } }";
        Message message = createMessage("evacuation-orders-alerts", jsonBody);

        MessageInformation info = handler.handleMessage(message);

        Assert.assertEquals("Lytton Evacuation", info.getMessageId());
        Assert.assertEquals(getExpectedHash(jsonBody), info.getItemIdentifier());
        Assert.assertEquals(NotificationTopics.EVACUATION_ORDERS_AND_ALERTS, info.getTopic());
    }
}
