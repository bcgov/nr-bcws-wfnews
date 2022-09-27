package ca.bc.gov.nrs.wfnews.web.controller;

import ca.bc.gov.nrs.wfone.common.webade.oauth2.token.client.impl.TokenServiceImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import ca.bc.gov.nrs.wfone.common.webade.oauth2.token.client.TokenService;
import ca.bc.gov.nrs.wfone.common.webade.oauth2.token.client.resource.CheckedToken;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.util.Properties;

@Controller
public class CheckTokenController {
	
	private static final Logger logger = LoggerFactory.getLogger(CheckTokenController.class);
	
	@Autowired
	private Properties applicationProperties;

	@RequestMapping(value="/checkToken", method=RequestMethod.GET, headers="Accept=*/*")
	@ResponseBody
	protected CheckedToken token(HttpServletRequest request, HttpServletResponse response) throws Exception {
		logger.debug("<checkToken");

		TokenServiceImpl tokenService;

		String clientSecret= System.getenv("WEBADE_OAUTH2_WFNEWS_REST_CLIENT_SECRET");
		String tokenUrl= System.getenv("WEBADE-OAUTH2_TOKEN_URL");
		String checkTokenUrl= System.getenv("WEBADE-OAUTH2_TOKEN_CLIENT_URL");

		tokenService = new TokenServiceImpl(
				"WFNEWS-UI",
				clientSecret,
				checkTokenUrl,
				tokenUrl);

		CheckedToken result = null;
		String authorizationHeader = request.getHeader("Authorization");
		request.getSession().setAttribute("authToken", authorizationHeader);
		try {
			if(authorizationHeader == null) {
				response.sendError(401);
			} else {
				result = tokenService.checkToken(authorizationHeader.replace("Bearer ", ""));
			}
		} catch(Throwable t) {
			response.sendError(500, t.getMessage());
		}

		logger.debug(">checkToken");
		return result;
	}

	public void setApplicationProperties(Properties applicationProperties) {
		this.applicationProperties = applicationProperties;
	}

}
