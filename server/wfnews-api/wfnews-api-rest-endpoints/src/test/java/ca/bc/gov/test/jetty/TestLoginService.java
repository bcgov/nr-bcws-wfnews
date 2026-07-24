package ca.bc.gov.test.jetty;

import java.util.function.Function;
import org.eclipse.jetty.security.IdentityService;
import org.eclipse.jetty.security.LoginService;
import org.eclipse.jetty.security.UserIdentity;
import org.eclipse.jetty.server.Request;

@SuppressWarnings("rawtypes")
public class TestLoginService implements LoginService {

	@Override
	public String getName() {
		return "CLIENT-CERT";
	}

	@Override
	public UserIdentity login(String username, Object credentials, Request request, Function getSession) {
		return null;
	}

	@Override
	public boolean validate(UserIdentity user) {
		return true;
	}

	@Override
	public IdentityService getIdentityService() {
		return null;
	}

	@Override
	public void setIdentityService(IdentityService service) {
	}

	@Override
	public void logout(UserIdentity user) {
	}
}
