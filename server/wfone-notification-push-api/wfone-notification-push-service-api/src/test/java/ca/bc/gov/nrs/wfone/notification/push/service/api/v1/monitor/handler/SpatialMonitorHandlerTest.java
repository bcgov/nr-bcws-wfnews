package ca.bc.gov.nrs.wfone.notification.push.service.api.v1.monitor.handler;

import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.model.MessageInformation;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.type.NotificationTopics;
import com.amazonaws.services.sqs.model.Message;
import com.amazonaws.services.sqs.model.MessageAttributeValue;
import org.junit.Assert;
import org.junit.Test;

import java.util.HashMap;
import java.util.Map;

public class SpatialMonitorHandlerTest {

    /**
     * Literals on purpose: computing the expected hash with Guava compares Guava to itself.
     * Guava is not pinned, so a firebase-admin bump can move it. If these fail, see the
     * item identifier decision in section 4 of the push notification plan.
     */
    private static final String GOLDEN_INPUT = "{ \"incidentNumberLabel\": \"GOLDEN\", \"discoveryDate\": 160000000, \"latitude\": 50.0, \"longitude\": -120.0 }";
    private static final String GOLDEN_HASH = "4982d47dacf925b467956bf2e552d2ad";

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
    public void testHashAlgorithmIsStable() throws Exception {
        SpatialMonitorHandler handler = new SpatialMonitorHandler();
        Message message = createMessage("active-fires", GOLDEN_INPUT);

        MessageInformation info = handler.handleMessage(message);

        Assert.assertEquals("The murmur3_128 item identifier changed. Every stored push item is invalid.",
                GOLDEN_HASH, info.getItemIdentifier());
    }

    @Test
    public void testActiveFiresHashing() throws Exception {
        SpatialMonitorHandler handler = new SpatialMonitorHandler();
        String jsonBody = "{ \"incidentNumberLabel\": \"V12345\", \"discoveryDate\": 160000000, \"latitude\": 50.0, \"longitude\": -120.0 }";
        Message message = createMessage("active-fires", jsonBody);

        MessageInformation info = handler.handleMessage(message);

        Assert.assertEquals("V12345", info.getMessageId());
        Assert.assertEquals("9ad93d540f8c8c43ef3e8ff701a68fbe", info.getItemIdentifier());
        Assert.assertEquals(NotificationTopics.BCWF_ACTIVEFIRES_PUBLIVIEW, info.getTopic());
    }

    @Test
    public void testAreaRestrictionsHashing() throws Exception {
        SpatialMonitorHandler handler = new SpatialMonitorHandler();
        String jsonBody = "{ \"attributes\": { \"FIRE_CENTRE_NAME\": \"Kamloops Fire Centre\", \"ACCESS_STATUS_EFFECTIVE_DATE\": 160000000 }, \"geometry\": { \"x\": 10, \"y\": 20 } }";
        Message message = createMessage("area-restrictions", jsonBody);

        MessageInformation info = handler.handleMessage(message);

        Assert.assertEquals("Kamloops Fire Centre", info.getMessageId());
        Assert.assertEquals("009c2b2e48828fc1a5557350476a3e48", info.getItemIdentifier());
        Assert.assertEquals(NotificationTopics.BRITISH_COLUMBIA_AREA_RESTRICTIONS, info.getTopic());
    }
    
    @Test
    public void testBansProhibitionsHashing() throws Exception {
        SpatialMonitorHandler handler = new SpatialMonitorHandler();
        String jsonBody = "{ \"attributes\": { \"FIRE_CENTRE_NAME\": \"Cariboo Fire Centre\", \"ACCESS_STATUS_EFFECTIVE_DATE\": 160000000 }, \"geometry\": { \"x\": 10, \"y\": 20 } }";
        Message message = createMessage("bans-prohibitions", jsonBody);

        MessageInformation info = handler.handleMessage(message);

        Assert.assertEquals("Cariboo Fire Centre", info.getMessageId());
        Assert.assertEquals("232d4e5642d6270df7db9b86f0121540", info.getItemIdentifier());
        Assert.assertEquals(NotificationTopics.BRITISH_COLUMBIA_BANS_AND_PROHIBITION_AREAS, info.getTopic());
    }

    @Test
    public void testEvacuationOrdersAlertsHashing() throws Exception {
        SpatialMonitorHandler handler = new SpatialMonitorHandler();
        String jsonBody = "{ \"attributes\": { \"EVENT_NAME\": \"Lytton Evacuation\", \"DATE_MODIFIED\": 160000000 }, \"geometry\": { \"x\": 10, \"y\": 20 } }";
        Message message = createMessage("evacuation-orders-alerts", jsonBody);

        MessageInformation info = handler.handleMessage(message);

        Assert.assertEquals("Lytton Evacuation", info.getMessageId());
        Assert.assertEquals("9914e4b713f3dda26288795fb67095d9", info.getItemIdentifier());
        Assert.assertEquals(NotificationTopics.EVACUATION_ORDERS_AND_ALERTS, info.getTopic());
    }
}
