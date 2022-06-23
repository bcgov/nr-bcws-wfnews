package ca.bc.gov.nrs.wfim.web.controller;

import ca.bc.gov.webade.oauth2.rest.v1.token.client.impl.TokenServiceImpl;
import ca.bc.gov.webade.oauth2.rest.v1.token.client.resource.CheckedToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.util.Properties;

@Controller
public class CheckTokenController {
	
	private static final Logger logger = LoggerFactory.getLogger(CheckTokenController.class);
	
	@Autowired
	private Properties applicationProperties;
	@Inject
	TokenServiceImpl tokenService;

	@RequestMapping(value="/checkToken", method=RequestMethod.GET, headers="Accept=*/*")
	@ResponseBody
	protected CheckedToken token(HttpServletRequest request, HttpServletResponse response) throws Exception {
		logger.debug("<checkToken");
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
