package ca.bc.gov.nrs.wfone.api.model.v1;

/**
 * Basic POJO for working with the RoF cache form
 * The "form" string will be the submitted json blob
 * and can be read as a JSONObject where needed
 */
public class RoFEntryForm {
  private String submissionStatus;
  private String error;
  private int retries;
  private String form;

  public RoFEntryForm() {/* empty contructor */}

  public String getSubmissionStatus() {
    return submissionStatus;
  }

  public void setSubmissionStatus(String submissionStatus) {
    this.submissionStatus = submissionStatus;
  }

  public String getError() {
    return error;
  }

  public void setError(String error) {
    this.error = error;
  }

  public String getForm() {
    return form;
  }

  public void setForm(String form) {
    this.form = form;
  }

  public int getRetries() {
    return retries;
  }

  public void setRetries(int retries) {
    this.retries = retries;
  }
}