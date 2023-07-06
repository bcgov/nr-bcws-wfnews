package ca.bc.gov.mof.wfpointid.rest.model;


public class ErrorResource {

	public static ErrorResource create(Throwable e) {
		return new ErrorResource(e.getMessage());
	}

	public static ErrorResource createWithDetails(Throwable e) {
		Throwable cause = e.getCause();
		if (cause != null) {
			return new ErrorResource(e.getMessage(), e.getCause().toString());
		}
		return new ErrorResource(e.getMessage());
	}

	public static ErrorResource createWithDetails(String msg, Throwable e) {
		return new ErrorResource(msg, e.toString());
	}

	int errorCount = 0;
	String errorMsg = "";
	String errorDetail = "";
	
	public ErrorResource() {

	}
	
	public ErrorResource(String msg) {
		errorCount = 1;
		errorMsg = msg;
	}
	
	public ErrorResource(String msg, String detail) {
		errorCount = 1;
		errorMsg = msg;
		errorDetail = detail;
	}

	public int getErrorCount() {
		return errorCount;
	}

	public void setErrorCount(int errorCount) {
		this.errorCount = errorCount;
	}

	public String getErrorMsg() {
		return errorMsg;
	}

	public void setErrorMsg(String errorMsg) {
		this.errorMsg = errorMsg;
	}

	public String getErrorDetail() {
		return errorDetail;
	}

	public void setErrorDetail(String errorDetail) {
		this.errorDetail = errorDetail;
	}

	
}
