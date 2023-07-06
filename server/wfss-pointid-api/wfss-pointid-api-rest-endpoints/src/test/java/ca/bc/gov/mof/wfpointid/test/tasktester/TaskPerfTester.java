package ca.bc.gov.mof.wfpointid.test.tasktester;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import ca.bc.gov.mof.wfpointid.util.Stopwatch;

public class TaskPerfTester {
	
	private ExecutorService pool;
	private int total;
	private int concurrent;
	private TaskFactory testFactory;
	Stat stat = new Stat();
	
	private static int counter = 0;
	
	private synchronized static int newID() {
		return counter++;
	}
	

	public TaskPerfTester(TaskFactory testFactory, int total, int concurrent) {
		this.testFactory = testFactory;
		this.total = total;
		this.concurrent = concurrent;
	}
	
	public void launch() {
		pool = Executors.newFixedThreadPool(concurrent);
		
		for (int i = 0; i < total; i++) {
			final Task task = testFactory.createTask();
			task.setId(newID());
			task.init();
			Runnable runnable = new Runnable() {

				@Override
				public void run() {
					Stopwatch sw = new Stopwatch();
					System.out.println("[" + task.getId() + "]- Starting");
					String status = "";
					boolean isOK = false;
					try {
						task.execute();
						status = "Complete";
						isOK = true;
					}
					catch (Exception ex) {
						status = "ERROR: " + ex.getClass().getSimpleName() + "--" + ex.getMessage();
					}
					System.out.println("[" + task.getId() + "] time=" + sw.getTimeString()
							+ " -- " + status
						);
					stat.status(sw.getTime(), isOK);
					System.out.println("TASK STATUS: " + stat.report());
				}
				
			};
			pool.submit(runnable);
		}
	}
	
}
