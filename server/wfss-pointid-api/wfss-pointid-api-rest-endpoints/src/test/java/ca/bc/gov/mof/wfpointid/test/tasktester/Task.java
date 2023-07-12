package ca.bc.gov.mof.wfpointid.test.tasktester;


public abstract class Task {
	
	long id;
	
	
	public long getId() {
		return id;
	}
	public void setId(long id) {
		this.id = id;
	}
	
	public void init() {
		// do nothing
	}
	
	public abstract void execute() throws Exception;
}
