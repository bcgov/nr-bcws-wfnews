package ca.bc.gov.nrs.wfnews.api.rest.v1.resource;

import java.io.Serial;

import jakarta.xml.bind.annotation.XmlRootElement;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import ca.bc.gov.nrs.common.wfone.rest.resource.BaseResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.types.ResourceTypes;

/**
 * Information Request Mail Resource
 * This resource should only be used for the Mail to SNS handler
 */
@XmlRootElement(namespace = ResourceTypes.NAMESPACE, name = ResourceTypes.MAIL_NAME)
@JsonIgnoreProperties(ignoreUnknown = true)  // callers still send @type; do not reject it
public class MailResource extends BaseResource {
	@Serial
	private static final long serialVersionUID = 1L;

  private String name;
  private String emailAddress;
  private String subject;
  private String messageBody;

  public MailResource() { }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getEmailAddress() {
    return emailAddress;
  }

  public void setEmailAddress(String emailAddress) {
    this.emailAddress = emailAddress;
  }

  public String getSubject() {
    return subject;
  }

  public void setSubject(String subject) {
    this.subject = subject;
  }

  public String getMessageBody() {
    return messageBody;
  }

  public void setMessageBody(String messageBody) {
    this.messageBody = messageBody;
  }

  
}
