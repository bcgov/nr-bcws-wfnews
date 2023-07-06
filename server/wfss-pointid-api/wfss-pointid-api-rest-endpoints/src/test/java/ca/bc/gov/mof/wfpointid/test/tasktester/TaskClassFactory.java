package ca.bc.gov.mof.wfpointid.test.tasktester;

public class TaskClassFactory implements TaskFactory {

	private Class<Task> clz;
	
	@SuppressWarnings("unchecked")
	public TaskClassFactory(String classname) throws ClassNotFoundException {
		clz = (Class<Task>) Class.forName(classname);
	}
	
	@Override
	public Task createTask() {

		try {
			return clz.getDeclaredConstructor().newInstance();
		} catch (Exception e) {

			throw new RuntimeException(e.getMessage());
		}
	}

}
