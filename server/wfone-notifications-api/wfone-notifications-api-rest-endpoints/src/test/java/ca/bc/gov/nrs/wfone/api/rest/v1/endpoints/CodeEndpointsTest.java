package ca.bc.gov.nrs.wfone.api.rest.v1.endpoints;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.nrs.common.wfone.rest.resource.CodeRsrc;
import ca.bc.gov.nrs.common.wfone.rest.resource.CodeTableListRsrc;
import ca.bc.gov.nrs.common.wfone.rest.resource.CodeTableRsrc;
import ca.bc.gov.nrs.wfone.api.rest.client.v1.NotificationService;
import ca.bc.gov.nrs.wfone.api.rest.client.v1.WildfireResourceServiceException;
import ca.bc.gov.nrs.wfone.api.rest.client.v1.impl.NotificationServiceImpl;
import ca.bc.gov.nrs.wfone.api.rest.test.EndpointsTest;
import ca.bc.gov.nrs.wfone.api.rest.v1.resource.EndpointsRsrc;
import ca.bc.gov.nrs.wfone.common.model.Code;
import ca.bc.gov.nrs.wfone.common.webade.oauth2.token.client.Oauth2ClientException;
import ca.bc.gov.nrs.wfone.common.webade.oauth2.token.client.resource.AccessToken;

public class CodeEndpointsTest extends EndpointsTest {
	private static final Logger logger = LoggerFactory
			.getLogger(CodeEndpointsTest.class);

	@Test
	@Disabled("NotificationService.getCodeTables() & NotificationService.getCodeTable() are not being used in code")
	public void testCodeTables() throws WildfireResourceServiceException, Oauth2ClientException {
		logger.debug("<testCodeTables");
		
		if(skipTests) {
			logger.warn("Skipping tests");
			return;
		}
		
		final String WebadeOauth2ClientGuid = System.getProperty("webade-oauth2.token.client.guid");
		final String WebadeOauth2ClientId = System.getProperty("webade-oauth2.token.client.id");
		final String WebadeOauth2ClientSecret = System.getProperty("webade-oauth2.token.client.secret");
		final String Scope = System.getProperty("webade-oauth2.token.client.secret");
		
		tokenService.selectServiceClient(WebadeOauth2ClientId, WebadeOauth2ClientGuid, Scope);
		AccessToken token = tokenService.getToken(WebadeOauth2ClientId, WebadeOauth2ClientSecret, Scope);

		NotificationService service = new NotificationServiceImpl("Bearer "+token.getAccessToken());
		((NotificationServiceImpl) service).setTopLevelRestURL(topLevelRestURL);
		
		EndpointsRsrc topLevelEndpoints = service.getTopLevelEndpoints();

		{

			String codeTableName = null;
			LocalDate effectiveAsOfDate = LocalDate.now();

			CodeTableListRsrc codeTables = service.getCodeTables(topLevelEndpoints, codeTableName, effectiveAsOfDate);

			Assertions.assertNotNull(codeTables);
			List<CodeTableRsrc> codeTableList = codeTables.getCodeTableList();
			Assertions.assertNotNull(codeTableList);

			for (CodeTableRsrc codeTable : codeTableList) {
				
				codeTable = service.getCodeTable(codeTable, effectiveAsOfDate);
				Assertions.assertNotNull(codeTable);
				
				List<CodeRsrc> codes = codeTable.getCodes();
				Assertions.assertNotNull(codes);
				
				for(Code code:codes) {
					Assertions.assertNotNull(code.getCode());
					Assertions.assertNotNull(code.getDescription());
				}
			}
		}

		logger.debug(">testCodeTables");
	}

}
