package ca.bc.gov.nrs.wfone.service.api.v1.impl;

import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertThat;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

import org.junit.Test;

import com.mercateo.test.clock.TestClock;

import ca.bc.gov.nrs.wfone.api.model.v1.RoFEntryForm;
import ca.bc.gov.nrs.wfone.persistence.v1.dto.RoFFormDto;
import ca.bc.gov.nrs.wfone.service.api.v1.RecordServiceConstants;
import ca.bc.gov.nrs.wfone.service.api.v1.impl.RecordRoFServiceImpl.FormPushHandler;

public class RecordRoFServiceImplTest {
	
	@Test
	public void testRetryWait() {
		RecordRoFServiceImpl service = new RecordRoFServiceImpl();
		TestClock clock = TestClock.fixed(OffsetDateTime.of(2018, 10, 19, 9, 27, 55, 0, ZoneOffset.UTC));
		service.clock = clock;
		RoFFormDto form = new RoFFormDto();
		RoFEntryForm rofFormData= new RoFEntryForm();
		
		form.setSubmittedTimestamp(LocalDateTime.now(clock));
		rofFormData.setRetries(0);
		rofFormData.setSubmissionStatus(RecordServiceConstants.WRITING_STATUS);
		
		FormPushHandler result = service.howToHandle(form, rofFormData);
		
		assertThat(result, is(FormPushHandler.INVALID));
		
		rofFormData.setSubmissionStatus(RecordServiceConstants.QUEUED_STATUS);
		result = service.howToHandle(form, rofFormData);
		
		assertThat(result, is(FormPushHandler.RETRY));
		
		// Wait 1 minute after first try
		rofFormData.setRetries(rofFormData.getRetries()+1);
		result = service.howToHandle(form, rofFormData);
		
		assertThat(result, is(FormPushHandler.WAIT));

		clock.fastForward(Duration.ofMinutes(1)); 
		result = service.howToHandle(form, rofFormData);
		
		assertThat(result, is(FormPushHandler.RETRY));
		
		// Wait 2 minutes after second try
		rofFormData.setRetries(rofFormData.getRetries()+1);
		result = service.howToHandle(form, rofFormData);

		assertThat(result, is(FormPushHandler.WAIT));

		clock.fastForward(Duration.ofMinutes(1));
		result = service.howToHandle(form, rofFormData);
		
		assertThat(result, is(FormPushHandler.WAIT));
		
		clock.fastForward(Duration.ofMinutes(1));
		
		result = service.howToHandle(form, rofFormData);
		
		assertThat(result, is(FormPushHandler.RETRY));
		
		// Wait 4 minutes after third try
		rofFormData.setRetries(rofFormData.getRetries()+1);
		result = service.howToHandle(form, rofFormData);
		
		assertThat(result, is(FormPushHandler.WAIT));

		clock.fastForward(Duration.ofMinutes(1));
		result = service.howToHandle(form, rofFormData);
		
		assertThat(result, is(FormPushHandler.WAIT));
		
		clock.fastForward(Duration.ofMinutes(1));
		result = service.howToHandle(form, rofFormData);
		
		assertThat(result, is(FormPushHandler.WAIT));
		
		clock.fastForward(Duration.ofMinutes(1));
		result = service.howToHandle(form, rofFormData);
		
		assertThat(result, is(FormPushHandler.WAIT));
		
		clock.fastForward(Duration.ofMinutes(1));
		result = service.howToHandle(form, rofFormData);
		
		assertThat(result, is(FormPushHandler.RETRY));
		
		// Wait 8 minutes after fourth try
		rofFormData.setRetries(rofFormData.getRetries()+1);
		result = service.howToHandle(form, rofFormData);
		
		assertThat(result, is(FormPushHandler.WAIT));

		clock.fastForward(Duration.ofMinutes(1));
		result = service.howToHandle(form, rofFormData);
		
		assertThat(result, is(FormPushHandler.WAIT));
		
		clock.fastForward(Duration.ofMinutes(1));
		result = service.howToHandle(form, rofFormData);
		
		assertThat(result, is(FormPushHandler.WAIT));
		
		clock.fastForward(Duration.ofMinutes(1));
		result = service.howToHandle(form, rofFormData);
		
		assertThat(result, is(FormPushHandler.WAIT));
		
		clock.fastForward(Duration.ofMinutes(1));
		result = service.howToHandle(form, rofFormData);
		assertThat(result, is(FormPushHandler.WAIT));

		clock.fastForward(Duration.ofMinutes(1));
		result = service.howToHandle(form, rofFormData);
		
		assertThat(result, is(FormPushHandler.WAIT));
		
		clock.fastForward(Duration.ofMinutes(1));
		result = service.howToHandle(form, rofFormData);
		
		assertThat(result, is(FormPushHandler.WAIT));
		
		clock.fastForward(Duration.ofMinutes(1));
		result = service.howToHandle(form, rofFormData);
		
		assertThat(result, is(FormPushHandler.WAIT));
		
		clock.fastForward(Duration.ofMinutes(1));
		result = service.howToHandle(form, rofFormData);
		
		assertThat(result, is(FormPushHandler.RETRY));
		
		
		// Wait 16 minutes after fifth try
		rofFormData.setRetries(rofFormData.getRetries()+1);
		
		for(int i = 0; i<16; i++) {
			result = service.howToHandle(form, rofFormData);
			assertThat(result, is(FormPushHandler.WAIT));
			
			clock.fastForward(Duration.ofMinutes(1));
		}
		
		result = service.howToHandle(form, rofFormData);

		assertThat(result, is(FormPushHandler.RETRY));
		
		// Wait 32 minutes after sixth try
		rofFormData.setRetries(rofFormData.getRetries()+1);
		
		for(int i = 0; i<32; i++) {
			result = service.howToHandle(form, rofFormData);
			assertThat(result, is(FormPushHandler.WAIT));
			
			clock.fastForward(Duration.ofMinutes(1));
		}
		
		result = service.howToHandle(form, rofFormData);

		assertThat(result, is(FormPushHandler.RETRY));
		
		// Wait 64 minutes after seventh try
		rofFormData.setRetries(rofFormData.getRetries()+1);
		
		for(int i = 0; i<64; i++) {
			result = service.howToHandle(form, rofFormData);
			assertThat(result, is(FormPushHandler.WAIT));
			
			clock.fastForward(Duration.ofMinutes(1));
		}
		
		result = service.howToHandle(form, rofFormData);

		assertThat(result, is(FormPushHandler.RETRY));
		
		// Wait 128 minutes after eighth try
		rofFormData.setRetries(rofFormData.getRetries()+1);
		
		for(int i = 0; i<128; i++) {
			result = service.howToHandle(form, rofFormData);
			assertThat(result, is(FormPushHandler.WAIT));
			
			clock.fastForward(Duration.ofMinutes(1));
		}
		
		result = service.howToHandle(form, rofFormData);

		assertThat(result, is(FormPushHandler.RETRY));

		
		// Wait 256 minutes after ninth try
		rofFormData.setRetries(rofFormData.getRetries()+1);
		
		for(int i = 0; i<256; i++) {
			result = service.howToHandle(form, rofFormData);
			assertThat(result, is(FormPushHandler.WAIT));
			
			clock.fastForward(Duration.ofMinutes(1));
		}
		
		result = service.howToHandle(form, rofFormData);

		assertThat(result, is(FormPushHandler.RETRY));

		
		// Wait 512 minutes after tenth try
		rofFormData.setRetries(rofFormData.getRetries()+1);
		
		for(int i = 0; i<512; i++) {
			result = service.howToHandle(form, rofFormData);
			assertThat(result, is(FormPushHandler.WAIT));
			
			clock.fastForward(Duration.ofMinutes(1));
		}
		
		result = service.howToHandle(form, rofFormData);

		assertThat(result, is(FormPushHandler.RETRY));

		
		// Wait 1024 minutes after eleventh try
		rofFormData.setRetries(rofFormData.getRetries()+1);
		
		for(int i = 0; i<1024; i++) {
			result = service.howToHandle(form, rofFormData);
			assertThat(result, is(FormPushHandler.WAIT));
			
			clock.fastForward(Duration.ofMinutes(1));
		}
		
		result = service.howToHandle(form, rofFormData);

		assertThat(result, is(FormPushHandler.RETRY));

	
	}
}
