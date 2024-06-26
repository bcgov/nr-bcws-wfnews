package ca.bc.gov.nrs.wfone.notification.push.quartz.scheduler.spring;

import java.util.Properties;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadPoolExecutor;

import ca.bc.gov.nrs.wfone.notification.push.aws.client.spring.AwsClientSpringConfig;
import ca.bc.gov.nrs.wfone.notification.push.quartz.scheduler.jobs.PushNotificationEventConsumerJob;
import org.apache.commons.lang3.StringUtils;
import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.quartz.JobKey;
import org.quartz.ListenerManager;
import org.quartz.Scheduler;
import org.quartz.SchedulerContext;
import org.quartz.SchedulerException;
import org.quartz.SchedulerFactory;
import org.quartz.SchedulerListener;
import org.quartz.SimpleScheduleBuilder;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.quartz.TriggerKey;
import org.quartz.impl.StdSchedulerFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

import ca.bc.gov.nrs.wfone.notification.push.quartz.scheduler.SchedulerConstants;
import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.spring.ServiceApiSpringConfig;

@Configuration
@Import({
	ServiceApiSpringConfig.class, 
	AwsClientSpringConfig.class
})
public class QuartzSchedulerSpringConfig {

	private static final Logger logger = LoggerFactory.getLogger(QuartzSchedulerSpringConfig.class);
	
	@Autowired
	private ServiceApiSpringConfig serviceApiSpringConfig;
	
	@Autowired
	private AwsClientSpringConfig awsClientSpringConfig;
	
	public QuartzSchedulerSpringConfig() {
		logger.debug("<QuartzSchedulerSpringConfig");
		
		logger.debug(">QuartzSchedulerSpringConfig");
	}

	@Bean()
	public SchedulerFactory schedulerFactory() throws SchedulerException {
		StdSchedulerFactory result;
		
		result = new StdSchedulerFactory();
		
		Properties properties = new Properties();
		properties.put("org.quartz.threadPool.threadCount", "10");
		properties.put(StdSchedulerFactory.PROP_SCHED_JMX_EXPORT, "true");
		
		result.initialize(properties);
		
		return result;
	}

	public static final String SCHEDULER_NAME = "PushNotificationScheduler";
	
	@Bean(initMethod="start", destroyMethod="shutdown")
	public Scheduler scheduler() throws SchedulerException {
		Scheduler result;
		
		result = schedulerFactory().getScheduler();
		
		SchedulerContext context = result.getContext();
		context.put(SchedulerConstants.AMAZON_SQS_QUEUE_SERVICE_KEY, awsClientSpringConfig.queueService());
		context.put(SchedulerConstants.SERVICE_API_V2_CONTEXT_KEY, serviceApiSpringConfig.wildfirePushNotificationServiceV2());
		
		result.scheduleJob(pushNotificationEventConsumerJob(), pushNotificationEventConsumerJobTrigger());
		
		ListenerManager listenerManager = result.getListenerManager();
		listenerManager.addSchedulerListener(new SchedulerListener() {

			@Override
			public void jobScheduled(Trigger trigger) {
				logger.debug("<jobScheduled");

				logger.debug(">jobScheduled");
			}

			@Override
			public void jobUnscheduled(TriggerKey triggerKey) {
				logger.debug("<jobUnscheduled");

				logger.debug(">jobUnscheduled");
			}

			@Override
			public void triggerFinalized(Trigger trigger) {
				logger.debug("<triggerFinalized");

				logger.debug(">triggerFinalized");
			}

			@Override
			public void triggerPaused(TriggerKey triggerKey) {
				logger.debug("<triggerPaused");

				logger.debug(">triggerPaused");
			}

			@Override
			public void triggersPaused(String triggerGroup) {
				logger.debug("<triggersPaused");

				logger.debug(">triggersPaused");
			}

			@Override
			public void triggerResumed(TriggerKey triggerKey) {
				logger.debug("<triggerResumed");

				logger.debug(">triggerResumed");
			}

			@Override
			public void triggersResumed(String triggerGroup) {
				logger.debug("<triggersResumed");

				logger.debug(">triggersResumed");
			}

			@Override
			public void jobAdded(JobDetail jobDetail) {
				logger.debug("<jobAdded");

				logger.debug(">jobAdded");
			}

			@Override
			public void jobDeleted(JobKey jobKey) {
				logger.debug("<jobDeleted");

				logger.debug(">jobDeleted");
			}

			@Override
			public void jobPaused(JobKey jobKey) {
				logger.debug("<jobPaused");

				logger.debug(">jobPaused");
			}

			@Override
			public void jobsPaused(String jobGroup) {
				logger.debug("<jobsPaused");

				logger.debug(">jobsPaused");
			}

			@Override
			public void jobResumed(JobKey jobKey) {
				logger.debug("<jobResumed");

				logger.debug(">jobResumed");
			}

			@Override
			public void jobsResumed(String jobGroup) {
				logger.debug("<jobsResumed");

				logger.debug(">jobsResumed");
			}

			@Override
			public void schedulerError(String msg, SchedulerException cause) {
				logger.debug("<schedulerError");

				logger.debug(">schedulerError");
			}

			@Override
			public void schedulerInStandbyMode() {
				logger.debug("<schedulerInStandbyMode");

				logger.debug(">schedulerInStandbyMode");
			}

			@Override
			public void schedulerStarted() {
				logger.debug("<schedulerStarted");

				logger.debug(">schedulerStarted");
			}

			@Override
			public void schedulerStarting() {
				logger.debug("<schedulerStarting");

				logger.debug(">schedulerStarting");
			}

			@Override
			public void schedulerShutdown() {
				logger.debug("<schedulerShutdown");

				logger.debug(">schedulerShutdown");
			}

			@Override
			public void schedulerShuttingdown() {
				logger.debug("<schedulerShuttingdown");

				logger.debug(">schedulerShuttingdown");
			}

			@Override
			public void schedulingDataCleared() {
				logger.debug("<schedulingDataCleared");

				logger.debug(">schedulingDataCleared");
			}});
		
		return result;
	}

	@Bean
	JobDetail pushNotificationEventConsumerJob() {
		JobDetail result;

		result = JobBuilder.newJob(PushNotificationEventConsumerJob.class)
				.withIdentity(PushNotificationEventConsumerJob.class.getName())
				.storeDurably(true)
				.build();

		return result;
	}

	@Value("${WFONE_PUSH_NOTIFICATION_CONSUMER_INTERVAL_SECONDS}")
	private String pushNotificationEventConsumerInterval;

	@Bean
	int pushNotificationEventConsumerIntervalSeconds() {
		return parseIntegerConfig("push.notification.event.consumer.interval.seconds", pushNotificationEventConsumerInterval, 300);
	}
	
	static int parseIntegerConfig(String name, String stringValue, int defaultValue) {
		logger.debug("<parseIntegerConfig " + name);
		int result = defaultValue;

		if (StringUtils.isNotBlank(stringValue)) {

			try {
				result = Integer.parseInt(stringValue);

			} catch (NumberFormatException e) {
				logger.warn("Failed to parse "+name+".");
				logger.warn("Unable to parse '" + stringValue + "' to integer.  Using default.");
				// use default
			}
		}

		logger.debug(">parseIntegerConfig " + result);
		return result;
	}

	@Bean
	Trigger pushNotificationEventConsumerJobTrigger() {
		Trigger result;

		result = TriggerBuilder.newTrigger()
				.withIdentity(SchedulerConstants.PUSH_NOTIFICATION_EVENT_CONSUMER_TRIGGER_IDENTITY)
				.startNow()
				.withSchedule(SimpleScheduleBuilder.simpleSchedule()
					.withIntervalInSeconds(pushNotificationEventConsumerIntervalSeconds())
					.repeatForever())
				.build();
		
		return result;
	}
}
