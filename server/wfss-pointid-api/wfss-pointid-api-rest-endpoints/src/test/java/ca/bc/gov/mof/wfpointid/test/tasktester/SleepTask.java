package ca.bc.gov.mof.wfpointid.test.tasktester;


public class SleepTask extends Task {

	private long taskID;
	
	@Override
	public void execute() {
		try {
			Thread.sleep(1000);
		} catch (InterruptedException e) {
			// do nothing
		}
		System.out.println("Done " + taskID);
	}

	@Override
	public void init() {
		// do nothing
	}

	
}