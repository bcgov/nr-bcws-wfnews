# Alarms for the notification pipeline. They publish to the SNS topic in sns.tf.
#
# The thresholds are hardcoded, not Terragrunt inputs: a GitHub variable for each one is five
# more things to create before a deploy can pass.

locals {
  # A dead letter queue must be empty. One event on it is one event that never reached a
  # subscriber, so the alarm fires on the first message.
  push_dlq_message_threshold = 0

  # The consumer job polls every 20 s. An event that has waited 15 minutes means the pipeline
  # is behind, not busy.
  push_queue_age_alarm_seconds = 900

  # The push worker serves one monitor type and there is one task for each. Below one healthy
  # target, that monitor type sends nothing at all.
  push_worker_minimum_healthy_hosts = 1
}

# An event on the dead letter queue reached the receive count and was given up on.
resource "aws_cloudwatch_metric_alarm" "push_deadletter_not_empty" {
  for_each = var.WFONE_MONITORS_NAME_MAP

  alarm_name          = "wfnews_push_${each.key}_deadletter_not_empty_${var.target_env}"
  alarm_description   = "Events on the ${each.key} dead letter queue. Each one is a near me notification that no subscriber got."
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = "300"
  statistic           = "Maximum"
  threshold           = local.push_dlq_message_threshold
  treat_missing_data  = "notBreaching"

  dimensions = {
    QueueName = aws_sqs_queue.deadletters[each.key].name
  }

  alarm_actions = [aws_sns_topic.wfnews_sns_topic.arn]
  ok_actions    = [aws_sns_topic.wfnews_sns_topic.arn]

  tags = local.common_tags
}

# The age of the oldest event says how far behind the push worker is. A queue depth cannot:
# a deep queue that drains fast is healthy, and one stuck event is not.
resource "aws_cloudwatch_metric_alarm" "push_queue_backlog_old" {
  for_each = var.WFONE_MONITORS_NAME_MAP

  alarm_name          = "wfnews_push_${each.key}_queue_age_high_${var.target_env}"
  alarm_description   = "The oldest ${each.key} event has waited more than ${local.push_queue_age_alarm_seconds} s. The end-to-end latency is above target."
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "ApproximateAgeOfOldestMessage"
  namespace           = "AWS/SQS"
  period              = "300"
  statistic           = "Maximum"
  threshold           = local.push_queue_age_alarm_seconds
  treat_missing_data  = "notBreaching"

  dimensions = {
    QueueName = aws_sqs_queue.queues[each.key].name
  }

  alarm_actions = [aws_sns_topic.wfnews_sns_topic.arn]
  ok_actions    = [aws_sns_topic.wfnews_sns_topic.arn]

  tags = local.common_tags
}

# Reads the healthy target count, not the ECS task count: task count metrics need Container
# Insights, which this cluster does not have.
resource "aws_cloudwatch_metric_alarm" "push_worker_down" {
  for_each = var.WFONE_MONITORS_NAME_MAP

  alarm_name          = "wfnews_push_${each.key}_worker_down_${var.target_env}"
  alarm_description   = "No healthy ${each.key} push worker. That monitor type sends no near me notifications."
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "HealthyHostCount"
  namespace           = "AWS/ApplicationELB"
  period              = "300"
  statistic           = "Minimum"
  threshold           = local.push_worker_minimum_healthy_hosts
  treat_missing_data  = "breaching"

  dimensions = {
    LoadBalancer = aws_lb.wfnews_main.arn_suffix
    TargetGroup  = aws_alb_target_group.wfone_notifications_push_api[each.key].arn_suffix
  }

  alarm_actions = [aws_sns_topic.wfnews_sns_topic.arn]
  ok_actions    = [aws_sns_topic.wfnews_sns_topic.arn]

  tags = local.common_tags
}
