package ca.bc.gov.nrs.wfim.web.controller;

import ca.bc.gov.webade.oauth2.spring.security.core.WebAdeAuthentication;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.DirectEncrypter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import javax.servlet.http.HttpServletResponse;
import java.security.MessageDigest;
import java.util.Properties;

@Controller
@RequestMapping(value="/causeCodes")
public class CauseCodesTokenController {
	
	private static final Logger logger = LoggerFactory.getLogger(CauseCodesTokenController.class);
	
	@Autowired
	private Properties applicationProperties;

	@RequestMapping(value="/token", method=RequestMethod.GET)
	@ResponseBody
	protected CauseCodeToken token(HttpServletResponse response, Authentication authentication) throws Exception {
		logger.debug("<token");
		CauseCodeToken result = null;
		
		String causeCodesSecuritySalt = applicationProperties.getProperty("rest-services.wfim_shared_salt");
		logger.debug("causeCodesSecuritySalt="+(causeCodesSecuritySalt!=null&&causeCodesSecuritySalt.trim().length()>0));
		
		String causeCodesSecurityPassword = applicationProperties.getProperty("rest-services.wfim_shared_secret");
		logger.debug("causeCodesSecurityPassword="+(causeCodesSecurityPassword!=null&&causeCodesSecurityPassword.trim().length()>0));
		
		try {
			
			if(authentication==null) {
				
				response.sendError(401);
				
			} else {
			
				WebAdeAuthentication webadeAuthentication = (WebAdeAuthentication) authentication;
				
				result = new CauseCodeToken();
			
				UserAttributes userAttributes = result.getUserAttributes();
				
				userAttributes.setGuid(webadeAuthentication.getUserGuid());
				userAttributes.setUserId(webadeAuthentication.getUserId());
				
				byte[] b = (causeCodesSecuritySalt + causeCodesSecurityPassword).getBytes("UTF-8");
				MessageDigest md = MessageDigest.getInstance("MD5");
				
				byte[] key = md.digest(b);
				
				SecretKey secretKey = new SecretKeySpec(key, "AES");
				
				OneTimeTokenDO ottd = new OneTimeTokenDO();
				ottd.setGuid(userAttributes.getGuid());
				ottd.setUserId(userAttributes.getUserId());
				
				ObjectMapper mapper = new ObjectMapper();
				
				String json = mapper.writeValueAsString(ottd);
				
				JWEHeader jweHeader = new JWEHeader(JWEAlgorithm.DIR, EncryptionMethod.A128GCM);
				
				Payload payload = new Payload(json);
				
				JWEObject jweObject = new JWEObject(jweHeader, payload);
				jweObject.encrypt(new DirectEncrypter(secretKey));
				
				String userToken = jweObject.serialize();
				userAttributes.setUserToken(userToken);
			}
		
		} catch(Throwable t) {
			
			response.sendError(500, t.getMessage());
		}

		logger.debug(">token");
		return result;
	}

	public void setApplicationProperties(Properties applicationProperties) {
		this.applicationProperties = applicationProperties;
	}

}
