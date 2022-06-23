package ca.bc.gov.nrs.wfim.util;

import ca.bc.gov.nrs.common.rest.client.AuthorizationHeaderRestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;

public class ChainedAuthorizationRestTemplate extends AuthorizationHeaderRestTemplate {

    private static final Logger logger = LoggerFactory.getLogger(ca.bc.gov.nrs.wfim.util.ChainedAuthorizationRestTemplate.class);

    @Override
    public String getAuthorizationHeaderValue() {
        String result = null;

        HttpServletRequest httpServletRequest =
                ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes())
                        .getRequest();
        logger.debug("httpServletRequest="+httpServletRequest);

        result = httpServletRequest.getHeader(AUTHORIZATION_HEADER);
        return result;
    }
}
