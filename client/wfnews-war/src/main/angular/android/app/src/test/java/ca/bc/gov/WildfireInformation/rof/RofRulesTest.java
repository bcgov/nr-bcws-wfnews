package ca.bc.gov.WildfireInformation.rof;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

public class RofRulesTest {

    @Test
    public void takesTheSubmissionIdForms() {
        assertTrue(RofRules.isValidSubmissionId("a1b2c3d4e5f60718"));
        assertTrue(RofRules.isValidSubmissionId("local-1795652253294"));
    }

    @Test
    public void refusesAnIdThatCouldBeAPath() {
        assertFalse(RofRules.isValidSubmissionId(null));
        assertFalse(RofRules.isValidSubmissionId(""));
        assertFalse(RofRules.isValidSubmissionId("../sent"));
        assertFalse(RofRules.isValidSubmissionId("a/b"));
        assertFalse(RofRules.isValidSubmissionId("a.json"));
        assertFalse(RofRules.isValidSubmissionId("x".repeat(65)));
    }

    @Test
    public void takesTheNotificationsApi() {
        assertTrue(RofRules.isAllowedUrl("https://wfnews-prd.bcwildfireservices.com/notifications-api/rof"));
        assertTrue(RofRules.isAllowedUrl("https://wfnews-int.bcwildfireservices.com/notifications-api/rof"));
        assertTrue(RofRules.isAllowedUrl("https://wfone-notifications-api.dev.bcwildfireservices.com/rof"));
    }

    @Test
    public void refusesEveryOtherAddress() {
        assertFalse(RofRules.isAllowedUrl(null));
        assertFalse(RofRules.isAllowedUrl("http://wfnews-prd.bcwildfireservices.com/notifications-api/rof"));
        assertFalse(RofRules.isAllowedUrl("https://evil.example/notifications-api/rof"));
        assertFalse(RofRules.isAllowedUrl("https://bcwildfireservices.com.evil.example/rof"));
        assertFalse(RofRules.isAllowedUrl("https://evilbcwildfireservices.com/rof"));
        assertFalse(RofRules.isAllowedUrl("https://user@wfnews-prd.bcwildfireservices.com/rof"));
        assertFalse(RofRules.isAllowedUrl("https://wfnews-prd.bcwildfireservices.com:8443/rof"));
        assertFalse(RofRules.isAllowedUrl("https://wfnews-prd.bcwildfireservices.com/notifications-api/other"));
        assertFalse(RofRules.isAllowedUrl("https://wfnews-prd.bcwildfireservices.com/rof?x=1"));
        assertFalse(RofRules.isAllowedUrl("file:///data/data/ca.bc.gov.WildfireInformation/rof"));
    }

    @Test
    public void sortsTheAnswers() {
        assertTrue(RofRules.isSuccess(200));
        assertFalse(RofRules.isSuccess(302));
        assertTrue(RofRules.isPermanentFailure(400));
        assertTrue(RofRules.isPermanentFailure(403));
        assertFalse(RofRules.isPermanentFailure(408));
        assertFalse(RofRules.isPermanentFailure(429));
        assertFalse(RofRules.isPermanentFailure(500));
        assertFalse(RofRules.isPermanentFailure(302));
    }

    @Test
    public void writesTextPartsAndLeavesOutAMissingPhoto() throws Exception {
        Map<String, String> fields = new LinkedHashMap<>();
        fields.put("resource", "{\"otherInfo\":\"smoke é\"}");
        fields.put("image1", null);
        fields.put("image2", "data:image/jpeg;base64,AAAA");
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        RofRules.writeMultipart(out, "B", fields);

        assertEquals(
                "--B\r\nContent-Disposition: form-data; name=\"resource\"\r\n"
                        + "Content-Type: text/plain; charset=UTF-8\r\n\r\n{\"otherInfo\":\"smoke é\"}\r\n"
                        + "--B\r\nContent-Disposition: form-data; name=\"image2\"\r\n"
                        + "Content-Type: text/plain; charset=UTF-8\r\n\r\ndata:image/jpeg;base64,AAAA\r\n"
                        + "--B--\r\n",
                out.toString(StandardCharsets.UTF_8.name()));
    }
}
