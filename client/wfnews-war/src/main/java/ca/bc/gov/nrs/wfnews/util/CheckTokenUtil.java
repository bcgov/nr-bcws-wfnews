package ca.bc.gov.nrs.wfnews.util;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.nrs.wfone.common.webade.oauth2.token.client.TokenService;
import ca.bc.gov.nrs.wfone.common.webade.oauth2.token.client.impl.TokenServiceImpl;
import ca.bc.gov.nrs.wfone.common.webade.oauth2.token.client.resource.CheckedToken;

public class CheckTokenUtil {
	private static final Logger logger = LoggerFactory.getLogger(CheckTokenUtil.class);
	public CheckedToken token(HttpServletRequest request, HttpServletResponse response) throws Exception {
		CheckedToken result = null;
		String authorizationHeader = request.getHeader("Authorization");
		request.getSession().setAttribute("authToken", authorizationHeader);

    String clientSecret = System.getenv("WEBADE_OAUTH2_WFNEWS_REST_CLIENT_SECRET");
		String tokenUrl = System.getenv("WEBADE-OAUTH2_TOKEN_URL");
		String checkTokenUrl = System.getenv("WEBADE-OAUTH2_CHECK_TOKEN_V2_URL");

		logger.debug("Token URL: {}", tokenUrl);
		logger.debug("Check Token URL: {}", checkTokenUrl);

		TokenService tokenService = new TokenServiceImpl(
				"WFNEWS-UI",
				clientSecret,
				checkTokenUrl,
				tokenUrl);
        
    if(authorizationHeader == null) {
			logger.debug("No Authorization token found, cannot request token");
      response.sendError(401);
    } else {
      result = tokenService.checkToken(authorizationHeader.replace("Bearer ", ""));
    }

		return result;
	}
}
