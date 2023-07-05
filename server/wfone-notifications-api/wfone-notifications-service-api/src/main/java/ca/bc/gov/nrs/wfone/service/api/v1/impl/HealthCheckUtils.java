package ca.bc.gov.nrs.wfone.service.api.v1.impl;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

import org.springframework.util.ReflectionUtils;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;
import com.mashape.unirest.http.exceptions.UnirestException;

import ca.bc.gov.nrs.common.wfone.rest.resource.HealthCheckResponseRsrc;
import ca.bc.gov.nrs.wfone.common.model.ValidationStatus;
import ca.bc.gov.nrs.wfone.common.rest.client.RestClientServiceException;

public class HealthCheckUtils {
	
	public static String getCallstack() {
		return "WFONE_NOTIFICATIONS_API";
	}
	
	public static HealthCheckResponseRsrc checkHealth(Object o) throws RestClientServiceException {
		if(o instanceof ServiceWithHealthCheck) {
			return ((ServiceWithHealthCheck) o).getHealthCheck(getCallstack());
		}
		Method checkHealth = ReflectionUtils.findMethod(o.getClass(), "getHealthCheck", String.class);
		try {
			return (HealthCheckResponseRsrc) checkHealth.invoke(o, getCallstack());
		} catch (InvocationTargetException ex) {
			Throwable targetEx = ex.getTargetException();
			if(targetEx instanceof RuntimeException) {
				throw (RuntimeException) targetEx;
			} else if (targetEx instanceof RestClientServiceException) {
				throw (RestClientServiceException) targetEx;
			} else {
				throw new IllegalStateException(ex);
			}
		} catch (IllegalAccessException ex) {
			throw new IllegalStateException(ex);
		}
	}
	
	@FunctionalInterface
	public static interface ServiceWithHealthCheck {
		HealthCheckResponseRsrc getHealthCheck(String callStack) throws RestClientServiceException;
	}
	
	public static ServiceWithHealthCheck makeHealthCheckStub(String url) {
		return (callstack)-> {
			
			HttpResponse<String> response;
			try {
				response = Unirest.post(url+"checkHealth")
						.header("Accept", "application/json").asString();
				ObjectMapper mapper = new ObjectMapper();
				return mapper.readValue(response.getRawBody(), HealthCheckResponseRsrc.class);
			} catch (UnirestException | IOException ex) {
				throw new RestClientServiceException(ex);
			}
		};
	}

	public static String statusEmoji(ValidationStatus status) {
		switch(status) {
		case GREEN:
			return "🟢";
		case RED:
			return "🔴";
		case YELLOW:
			return "🟡";
		default:
			return "⚠️";
		}
	}
}
