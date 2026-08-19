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
     * A literal on purpose: computing the expected hash with Guava compares Guava to itself.
     * Guava is not pinned, so a firebase-admin bump can move it.
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

    private String itemIdentifier(String monitorType, String body) throws Exception {
        return new SpatialMonitorHandler().handleMessage(createMessage(monitorType, body)).getItemIdentifier();
    }

    @Test
    public void testHashAlgorithmIsStable() {
        Assert.assertEquals("The murmur3_128 algorithm changed. Every stored push item is invalid.",
                GOLDEN_HASH, SpatialMonitorHandler.generateHash(GOLDEN_INPUT));
    }

    @Test
    public void testCanonicalIdentityHoldsTheEventKeyAndTheAttributes() {
        Map<String, String> eventInformation = new HashMap<>();
        eventInformation.put("fireYear", "2026");
        eventInformation.put("incidentNumberLabel", "V12345");

        Assert.assertEquals("active-fires|V12345|160000000|fireYear=2026|incidentNumberLabel=V12345",
                SpatialMonitorHandler.canonicalIdentity("active-fires", "V12345", 160000000L, eventInformation));
    }

    @Test
    public void testCanonicalIdentityIgnoresKeyOrder() {
        Map<String, String> oneOrder = new HashMap<>();
        oneOrder.put("FIRE_ZONE_NAME", "Vernon");
        oneOrder.put("FIRE_CENTRE_NAME", "Kamloops Fire Centre");

        Map<String, String> otherOrder = new HashMap<>();
        otherOrder.put("FIRE_CENTRE_NAME", "Kamloops Fire Centre");
        otherOrder.put("FIRE_ZONE_NAME", "Vernon");

        Assert.assertEquals(
                SpatialMonitorHandler.canonicalIdentity("area-restrictions", "Kamloops Fire Centre", 1L, oneOrder),
                SpatialMonitorHandler.canonicalIdentity("area-restrictions", "Kamloops Fire Centre", 1L, otherOrder));
    }

    @Test
    public void testActiveFiresReadsTheMessage() throws Exception {
        SpatialMonitorHandler handler = new SpatialMonitorHandler();
        String jsonBody = "{ \"incidentNumberLabel\": \"V12345\", \"fireYear\": 2026, \"discoveryDate\": 160000000, \"latitude\": 50.0, \"longitude\": -120.0 }";

        MessageInformation info = handler.handleMessage(createMessage("active-fires", jsonBody));

        Assert.assertEquals("V12345", info.getMessageId());
        Assert.assertEquals(NotificationTopics.BCWF_ACTIVEFIRES_PUBLIVIEW, info.getTopic());
        Assert.assertEquals(SpatialMonitorHandler.generateHash(
                "active-fires|V12345|160000000|fireYear=2026|incidentNumberLabel=V12345"), info.getItemIdentifier());
    }

    @Test
    public void testMovedVertexKeepsTheItemIdentifier() throws Exception {
        String oneRing = "{ \"attributes\": { \"FIRE_CENTRE_NAME\": \"Kamloops Fire Centre\", \"ACCESS_STATUS_EFFECTIVE_DATE\": 160000000 }, \"geometry\": { \"rings\": [[[10,20],[11,20],[11,21],[10,20]]] } }";
        String movedRing = "{ \"attributes\": { \"FIRE_CENTRE_NAME\": \"Kamloops Fire Centre\", \"ACCESS_STATUS_EFFECTIVE_DATE\": 160000000 }, \"geometry\": { \"rings\": [[[10,20],[11.5,20],[11,21],[10,20]]] } }";

        Assert.assertEquals(itemIdentifier("area-restrictions", oneRing),
                itemIdentifier("area-restrictions", movedRing));
    }

    @Test
    public void testUnreadAttributeKeepsTheItemIdentifier() throws Exception {
        String without = "{ \"attributes\": { \"FIRE_CENTRE_NAME\": \"Cariboo Fire Centre\", \"ACCESS_STATUS_EFFECTIVE_DATE\": 160000000 }, \"geometry\": { \"x\": 10, \"y\": 20 } }";
        String with = "{ \"attributes\": { \"FIRE_CENTRE_NAME\": \"Cariboo Fire Centre\", \"ACCESS_STATUS_EFFECTIVE_DATE\": 160000000, \"OBJECTID\": 88, \"lastUpdatedTimestamp\": 170000000 }, \"geometry\": { \"x\": 10, \"y\": 20 } }";

        Assert.assertEquals(itemIdentifier("bans-prohibitions", without), itemIdentifier("bans-prohibitions", with));
    }

    @Test
    public void testNewEffectiveDateGivesANewItemIdentifier() throws Exception {
        String first = "{ \"attributes\": { \"FIRE_CENTRE_NAME\": \"Kamloops Fire Centre\", \"ACCESS_STATUS_EFFECTIVE_DATE\": 160000000 }, \"geometry\": { \"x\": 10, \"y\": 20 } }";
        String second = "{ \"attributes\": { \"FIRE_CENTRE_NAME\": \"Kamloops Fire Centre\", \"ACCESS_STATUS_EFFECTIVE_DATE\": 170000000 }, \"geometry\": { \"x\": 10, \"y\": 20 } }";

        Assert.assertNotEquals(itemIdentifier("area-restrictions", first),
                itemIdentifier("area-restrictions", second));
    }

    /** DATE_MODIFIED moves on every edit. */
    @Test
    public void testEditedEvacuationOrderKeepsTheItemIdentifier() throws Exception {
        String first = "{ \"attributes\": { \"EVENT_NAME\": \"Lytton Evacuation\", \"ISSUING_AGENCY\": \"Lytton\", \"ORDER_ALERT_STATUS\": \"Order\", \"DATE_MODIFIED\": 160000000 }, \"geometry\": { \"x\": 10, \"y\": 20 } }";
        String edited = "{ \"attributes\": { \"EVENT_NAME\": \"Lytton Evacuation\", \"ISSUING_AGENCY\": \"Lytton\", \"ORDER_ALERT_STATUS\": \"Order\", \"DATE_MODIFIED\": 170000000 }, \"geometry\": { \"x\": 10, \"y\": 20 } }";

        Assert.assertEquals(itemIdentifier("evacuation-orders-alerts", first),
                itemIdentifier("evacuation-orders-alerts", edited));
    }

    @Test
    public void testAlertBecomingAnOrderGivesANewItemIdentifier() throws Exception {
        String alert = "{ \"attributes\": { \"EVENT_NAME\": \"Lytton Evacuation\", \"ISSUING_AGENCY\": \"Lytton\", \"ORDER_ALERT_STATUS\": \"Alert\", \"DATE_MODIFIED\": 160000000 }, \"geometry\": { \"x\": 10, \"y\": 20 } }";
        String order = "{ \"attributes\": { \"EVENT_NAME\": \"Lytton Evacuation\", \"ISSUING_AGENCY\": \"Lytton\", \"ORDER_ALERT_STATUS\": \"Order\", \"DATE_MODIFIED\": 160000000 }, \"geometry\": { \"x\": 10, \"y\": 20 } }";

        Assert.assertNotEquals(itemIdentifier("evacuation-orders-alerts", alert),
                itemIdentifier("evacuation-orders-alerts", order));
    }

    @Test
    public void testEvacuationOrdersReadsTheMessage() throws Exception {
        SpatialMonitorHandler handler = new SpatialMonitorHandler();
        String jsonBody = "{ \"attributes\": { \"EVENT_NAME\": \"Lytton Evacuation\", \"DATE_MODIFIED\": 160000000 }, \"geometry\": { \"x\": 10, \"y\": 20 } }";

        MessageInformation info = handler.handleMessage(createMessage("evacuation-orders-alerts", jsonBody));

        Assert.assertEquals("Lytton Evacuation", info.getMessageId());
        Assert.assertEquals(NotificationTopics.EVACUATION_ORDERS_AND_ALERTS, info.getTopic());
    }

    @Test
    public void testAreaRestrictionsReadsTheMessage() throws Exception {
        SpatialMonitorHandler handler = new SpatialMonitorHandler();
        String jsonBody = "{ \"attributes\": { \"FIRE_CENTRE_NAME\": \"Kamloops Fire Centre\", \"ACCESS_STATUS_EFFECTIVE_DATE\": 160000000 }, \"geometry\": { \"x\": 10, \"y\": 20 } }";

        MessageInformation info = handler.handleMessage(createMessage("area-restrictions", jsonBody));

        Assert.assertEquals("Kamloops Fire Centre", info.getMessageId());
        Assert.assertEquals(NotificationTopics.BRITISH_COLUMBIA_AREA_RESTRICTIONS, info.getTopic());
    }

    @Test
    public void testBansProhibitionsReadsTheMessage() throws Exception {
        SpatialMonitorHandler handler = new SpatialMonitorHandler();
        String jsonBody = "{ \"attributes\": { \"FIRE_CENTRE_NAME\": \"Cariboo Fire Centre\", \"ACCESS_STATUS_EFFECTIVE_DATE\": 160000000 }, \"geometry\": { \"x\": 10, \"y\": 20 } }";

        MessageInformation info = handler.handleMessage(createMessage("bans-prohibitions", jsonBody));

        Assert.assertEquals("Cariboo Fire Centre", info.getMessageId());
        Assert.assertEquals(NotificationTopics.BRITISH_COLUMBIA_BANS_AND_PROHIBITION_AREAS, info.getTopic());
    }
}
