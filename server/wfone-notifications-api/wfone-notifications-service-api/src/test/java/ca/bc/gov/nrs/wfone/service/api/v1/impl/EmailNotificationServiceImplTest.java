package ca.bc.gov.nrs.wfone.service.api.v1.impl;

import static org.easymock.EasyMock.capture;
import static org.easymock.EasyMock.expectLastCall;
import static org.hamcrest.Matchers.containsString;
import static org.junit.Assert.assertThat;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import javax.mail.Session;
import javax.mail.internet.MimeMessage;

import org.easymock.Capture;
import org.easymock.EasyMock;
import org.easymock.IMocksControl;
import org.junit.Test;

import ca.bc.gov.nrs.common.wfone.rest.resource.HealthCheckResponseRsrc;
import ca.bc.gov.nrs.wfdm.api.rest.client.FileService;
import ca.bc.gov.nrs.wfone.common.model.ValidationStatus;
import ca.bc.gov.nrs.wfone.common.rest.client.RestClientServiceException;
import ca.bc.gov.nrs.wfone.service.api.model.RoFRetryInfo;
import ca.bc.gov.nrs.wfone.service.api.v1.config.EmailNotificationConfig;
import ca.bc.gov.nrs.wfone.service.api.v1.impl.HealthCheckUtils.ServiceWithHealthCheck;

public class EmailNotificationServiceImplTest {
	
	@Test
	public void testStuckHealthChecksSucceed() throws Exception {
		EmailNotificationConfig emailConfig = new EmailNotificationConfig();
		Session emailSession = null;
		
		emailConfig.setEmailNotificationsEnabledInd(true);
		emailConfig.setRawAddresses("user1@test;user2@test");
		
		IMocksControl control = EasyMock.createControl();
		
		FileService fileService = control.createMock(FileService.class);
		ServiceWithHealthCheck incidentService = control.createMock(ServiceWithHealthCheck.class);
		
		EmailNotificationServiceImpl service = EasyMock.partialMockBuilder(EmailNotificationServiceImpl.class)
				.withConstructor(EmailNotificationConfig.class, Session.class)
				.withArgs(emailConfig, emailSession)
				.addMockedMethod("doSend")
				.createMock(control);
		
		service.setFileService(fileService);
		service.setIncidentService(incidentService);
		service.setEnvironment("LOCAL");
		
		Capture<MimeMessage> messageCapture = EasyMock.newCapture();
		
		service.doSend(capture(messageCapture)); expectLastCall().once();
		
		HealthCheckResponseRsrc fileHealth = new HealthCheckResponseRsrc();
		fileHealth.setStatusDetails("Skookum");
		fileHealth.setValidationStatus(ValidationStatus.GREEN);
		EasyMock.expect(fileService.getHealthCheck(EasyMock.anyString())).andReturn(fileHealth).once();
		
		HealthCheckResponseRsrc incidentHealth = new HealthCheckResponseRsrc();
		EasyMock.expect(incidentService.getHealthCheck(EasyMock.anyString())).andReturn(incidentHealth).once();
		incidentHealth.setStatusDetails("Cultus");
		incidentHealth.setValidationStatus(ValidationStatus.RED);
		
		control.replay();
		
		Exception ex = new Exception();
		
		service.sendRoFsStuckMessage("{\"test\":\"Some JSON\"}", "TEST_GUID", ex, "run a test");
		
		control.verify();
		
		MimeMessage message = messageCapture.getValue();
		
		String content = (String) message.getContent();
		
		assertThat(content, containsString("🟢 Skookum"));
		assertThat(content, containsString("🔴 Cultus"));
	}
	
	@Test
	public void testStuckHealthChecksFail() throws Exception {
		EmailNotificationConfig emailConfig = new EmailNotificationConfig();
		Session emailSession = null;
		
		emailConfig.setEmailNotificationsEnabledInd(true);
		emailConfig.setRawAddresses("user1@test;user2@test");
		
		IMocksControl control = EasyMock.createControl();
		
		FileService fileService = control.createMock(FileService.class);
		ServiceWithHealthCheck incidentService = control.createMock(ServiceWithHealthCheck.class);
		
		EmailNotificationServiceImpl service = EasyMock.partialMockBuilder(EmailNotificationServiceImpl.class)
				.withConstructor(EmailNotificationConfig.class, Session.class)
				.withArgs(emailConfig, emailSession)
				.addMockedMethod("doSend")
				.createMock(control);
		
		service.setFileService(fileService);
		service.setIncidentService(incidentService);
		service.setEnvironment("LOCAL");
		
		Capture<MimeMessage> messageCapture = EasyMock.newCapture();
		
		service.doSend(capture(messageCapture)); expectLastCall().once();
		
		EasyMock.expect(fileService.getHealthCheck(EasyMock.anyString())).andThrow(new RestClientServiceException("Testing"));
		
		HealthCheckResponseRsrc incidentHealth = new HealthCheckResponseRsrc();
		EasyMock.expect(incidentService.getHealthCheck(EasyMock.anyString())).andReturn(incidentHealth).once();
		incidentHealth.setStatusDetails("Questionable");
		incidentHealth.setValidationStatus(ValidationStatus.YELLOW);
		
		control.replay();
		
		Exception ex = new Exception();
		
		service.sendRoFsStuckMessage("{\"test\":\"Some JSON\"}", "TEST_GUID", ex, "run a test");
		
		control.verify();
		
		MimeMessage message = messageCapture.getValue();
		
		String content = (String) message.getContent();
		
		assertThat(content, containsString("⚠️ Error while performing health check: Testing"));
		assertThat(content, containsString("🟡 Questionable"));
	}
	
	@Test
	public void testServiceDegraded() throws Exception {
		EmailNotificationConfig emailConfig = new EmailNotificationConfig();
		Session emailSession = null;
		
		emailConfig.setEmailNotificationsEnabledInd(true);
		emailConfig.setRawAddresses("user1@test;user2@test");
		
		IMocksControl control = EasyMock.createControl();
		
		FileService fileService = control.createMock(FileService.class);
		ServiceWithHealthCheck incidentService = control.createMock(ServiceWithHealthCheck.class);
		
		EmailNotificationServiceImpl service = EasyMock.partialMockBuilder(EmailNotificationServiceImpl.class)
				.withConstructor(EmailNotificationConfig.class, Session.class)
				.withArgs(emailConfig, emailSession)
				.addMockedMethod("doSend")
				.createMock(control);
		
		service.setFileService(fileService);
		service.setIncidentService(incidentService);
		service.setEnvironment("LOCAL");
		
		Capture<MimeMessage> messageCapture = EasyMock.newCapture();
		
		service.doSend(capture(messageCapture)); expectLastCall().once();
		
		HealthCheckResponseRsrc fileHealth = new HealthCheckResponseRsrc();
		fileHealth.setStatusDetails("Skookum");
		fileHealth.setValidationStatus(ValidationStatus.GREEN);
		EasyMock.expect(fileService.getHealthCheck(EasyMock.anyString())).andReturn(fileHealth).once();
		
		HealthCheckResponseRsrc incidentHealth = new HealthCheckResponseRsrc();
		EasyMock.expect(incidentService.getHealthCheck(EasyMock.anyString())).andReturn(incidentHealth).once();
		incidentHealth.setStatusDetails("Cultus");
		incidentHealth.setValidationStatus(ValidationStatus.RED);
		
		control.replay();
		
		List<RoFRetryInfo> stuckRequests = new ArrayList<>();
		stuckRequests.add(new RoFRetryInfo());
		
		stuckRequests.get(0).setRofCacheGuid("TEST_ROF_GUID");
		stuckRequests.get(0).setRetries(3);
		stuckRequests.get(0).setNextRetry(LocalDateTime.now().plusSeconds(42));
		
		
		service.sendServiceDegradedMessage(stuckRequests, "Runnign a test");
		
		control.verify();
		
		MimeMessage message = messageCapture.getValue();
		
		String content = (String) message.getContent();
		
		assertThat(content, containsString("🟢 Skookum"));
		assertThat(content, containsString("🔴 Cultus"));
	}
}
