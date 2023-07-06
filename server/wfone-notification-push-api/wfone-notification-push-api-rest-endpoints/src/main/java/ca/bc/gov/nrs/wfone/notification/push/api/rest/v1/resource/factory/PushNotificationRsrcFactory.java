package ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.resource.factory;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.net.URI;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.ws.rs.core.UriBuilder;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.nrs.wfone.common.model.Message;
import ca.bc.gov.nrs.wfone.common.rest.endpoints.resource.factory.BaseResourceFactory;
import ca.bc.gov.nrs.wfone.common.service.api.model.factory.FactoryContext;
import ca.bc.gov.nrs.wfone.common.service.api.model.factory.FactoryException;
import ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.endpoints.PushNearMeNotificationsEndpoint;
import ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.resource.PushNotificationListRsrc;
import ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.resource.PushNotificationRsrc;
import ca.bc.gov.nrs.wfone.notification.push.model.v1.PushEventType;
import ca.bc.gov.nrs.wfone.notification.push.model.v1.PushNotification;
import ca.bc.gov.nrs.wfone.notification.push.model.v1.PushNotificationList;
import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.model.factory.PushNotificationFactory;

public class PushNotificationRsrcFactory extends BaseResourceFactory implements PushNotificationFactory {

	private static final Logger logger = LoggerFactory.getLogger(PushNotificationRsrcFactory.class);


	@Override
	public PushNotificationList<? extends PushNotification> getPushNotificationList(
			List<PushNotification> pushNotifications,
			FactoryContext context) throws FactoryException {
		logger.debug("<getPushNotificationList");
		PushNotificationListRsrc result = new PushNotificationListRsrc();

		List<PushNotificationRsrc> resources = new ArrayList<PushNotificationRsrc>();

		for (PushNotification dto : pushNotifications) {
			PushNotificationRsrc resource = new PushNotificationRsrc();
			populate(resource, dto);
			resources.add(resource);
		}

		result.setCollection(resources);

		logger.debug(">getPushNotificationList "+result);
		return result;
	}

	private static void populate(PushNotificationRsrc resource, PushNotification dto) {
		resource.setPushEventType(dto.getPushEventType());
		resource.setDescription(dto.getDescription());

		Map<String, String> properties = new HashMap<>();

		if(dto.getProperties()!=null) {

			properties.putAll(dto.getProperties());
		}

		resource.setProperties(properties);
	}


	@Override
	public PushNotification getPushNotification(
			Object resource,
			FactoryContext context)
			throws FactoryException {
		logger.debug("<getPushNotificationList");
		PushNotificationRsrc result = null;

		result = new PushNotificationRsrc();
		populate(result, resource);

		logger.debug(">getPushNotificationList "+result);
		return result;
	}

	private static void populate(PushNotificationRsrc result, Object resource) {
		Map<String, String> properties = new HashMap<>();

		result.setPushEventType(PushEventType.Push);

		String s = resource.toString();
		properties.put("resource", s);

		result.setProperties(properties);
	}


	@Override
	public PushNotification getPushNotification(
			Object resource,
			String token,
			FactoryContext context)
			throws FactoryException {
		logger.debug("<getPushNotificationList");
		PushNotificationRsrc result = null;

		result = new PushNotificationRsrc();
		populate(result, resource, token);

		logger.debug(">getPushNotificationList "+result);
		return result;
	}

	private static void populate(PushNotificationRsrc result, Object resource, String token) {
		Map<String, String> properties = new HashMap<>();

		properties.put("token", token);

		result.setPushEventType(PushEventType.Push);

		String s = resource.toString();
		properties.put("resource", s);

		result.setProperties(properties);
	}


	@Override
	public PushNotification getPushNotification(String employeeNumber, Throwable t, FactoryContext context) throws FactoryException {
		logger.debug("<getPushNotificationList");
		PushNotificationRsrc result = null;

		result = new PushNotificationRsrc();
		populate(result, employeeNumber, t);

		logger.debug(">getPushNotificationList "+result);
		return result;
	}


	private static void populate(PushNotificationRsrc result, String employeeNumber, Throwable t) {
		Map<String, String> properties = new HashMap<>();

		result.setPushEventType(PushEventType.Failure);
		result.setDescription("Exception occured during update:"+t.getMessage());

		properties.put("employeeNumber", employeeNumber);
		properties.put("className", t.getClass().getName());
		properties.put("message", t.getMessage());
		StringWriter sw = new StringWriter();
		PrintWriter pw = new PrintWriter(sw);
		t.printStackTrace(pw);
		properties.put("stackTrace", sw.toString());

		result.setProperties(properties);
	}


	@Override
	public PushNotification getPushNotification(Throwable t, FactoryContext context) throws FactoryException {
		logger.debug("<getPushNotificationList");
		PushNotificationRsrc result = null;

		result = new PushNotificationRsrc();
		populate(result, t);

		logger.debug(">getPushNotificationList "+result);
		return result;
	}


	private static void populate(PushNotificationRsrc result, Throwable t) {
		Map<String, String> properties = new HashMap<>();

		result.setPushEventType(PushEventType.Failure);
		result.setDescription("Exception occured during update:"+t.getMessage());

		properties.put("className", t.getClass().getName());
		properties.put("message", t.getMessage());
		StringWriter sw = new StringWriter();
		PrintWriter pw = new PrintWriter(sw);
		t.printStackTrace(pw);
		properties.put("stackTrace", sw.toString());

		result.setProperties(properties);
	}


	@Override
	public PushNotification getPushNotification(
			String resourceId,
			Object resource,
			List<Message> messages,
			FactoryContext context) throws FactoryException {
		logger.debug("<getPushNotificationList");
		PushNotificationRsrc result = null;

		result = new PushNotificationRsrc();
		populate(result, resourceId, resource, messages);

		logger.debug(">getPushNotificationList "+result);
		return result;
	}

	private static void populate(PushNotificationRsrc result,
			String resourceId,
			Object resource,
			List<Message> messages) {

		Map<String, String> properties = new HashMap<>();

		result.setPushEventType(PushEventType.Failure);
		result.setDescription("Validation Errors occured during update of resource with ID "+resourceId);

		if(messages!=null) {

			int i=0;
			for(Message message:messages) {

				properties.put("messages["+i+"].path", message.getPath());
				properties.put("messages["+i+"].message", message.getMessage());
				properties.put("messages["+i+"].messageTemplate", message.getMessageTemplate());

				String[] messageArguments = message.getMessageArguments();
				if(messageArguments!=null) {

					int j=0;
					for(String messageArgument:messageArguments) {

						properties.put("messages["+i+"].messageArguments["+j+"]", messageArgument);
					}
				}
			}
		}

		result.setProperties(properties);
	}

	public static String getPushNearMeNotificationsUri(URI baseUri) {

		String result = UriBuilder.fromUri(baseUri)
			.path(PushNearMeNotificationsEndpoint.class).build()
			.toString();

		return result;
	}
}
