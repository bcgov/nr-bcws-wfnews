package ca.bc.gov.mof.wfpointid.perf;

import ca.bc.gov.mof.wfpointid.test.tasktester.Task;
import ca.bc.gov.mof.wfpointid.test.tasktester.TaskFactory;
import ca.bc.gov.mof.wfpointid.test.tasktester.TaskPerfTester;


public class PointIDPerfTester {
	public static void main(String[] args) {

		run();
	}

	private static void run() {
		TaskPerfTester restTester = new TaskPerfTester(new PointIDTestFactory(), 300, 10);
		restTester.launch();
	}
}

class PointIDTestFactory implements TaskFactory  {

	@Override
	public Task createTask() {
		return new PointIDTask();
	}	
}

