package ca.bc.gov.test.jetty;

import java.security.Principal;

import javax.security.auth.Subject;
import javax.servlet.ServletRequest;

import org.eclipse.jetty.security.DefaultIdentityService;
import org.eclipse.jetty.security.IdentityService;
import org.eclipse.jetty.security.LoginService;
import org.eclipse.jetty.server.UserIdentity;
import org.eclipse.jetty.util.component.AbstractLifeCycle;

public class TestLoginService extends AbstractLifeCycle implements LoginService {
	
	protected IdentityService _identityService=new DefaultIdentityService();
	
	@Override
	public IdentityService getIdentityService() {
		return _identityService;
	}

	@Override
	public String getName() {
		return "CLIENT-CERT";
	}

	@Override
	public UserIdentity login(String username, Object credentials, ServletRequest request) {
		Principal userPrincipal = new Principal() {

			@Override
			public String getName() {
				return username;
			}};
			
        Subject subject = new Subject();
        subject.getPrincipals().add(userPrincipal);
        subject.getPrivateCredentials().add(credentials);
		UserIdentity identity=_identityService.newUserIdentity(subject,userPrincipal, new String[]{});
		
		return identity;
	}

	@Override
	public void logout(UserIdentity userIdentity) {
		// do nothing
	}

	@Override
	public void setIdentityService(IdentityService identityService) {
        if (isRunning())
            throw new IllegalStateException("Running");
        _identityService = identityService;
		
	}

	@Override
	public boolean validate(UserIdentity userIdentity) {
		return true;
	}
}
