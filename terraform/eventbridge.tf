//EventBridge Resources
/*
resource "aws_cloudwatch_event_rule" "wfnews-monitor-schedule" {
  name                = "wfnews-monitor-schedule-${var.target_env}"
  description         = "Run the monitor lambdas on a regular schedule"
  schedule_expression = "rate(5 minutes)"
}

resource "aws_cloudwatch_event_rule" "wfnews-monitor-schedule-extended" {
  name                = "wfnews-monitor-schedule-extended-${var.target_env}"
  description         = "Run the monitor lambdas on a regular schedule"
  schedule_expression = "rate(60 minutes)"
}

resource "aws_cloudwatch_event_target" "wfnews-active-fires-event-target" {
  rule      = aws_cloudwatch_event_rule.wfnews-monitor-schedule.name
  target_id = "active-fires-${var.target_env}-target"
  arn       = aws_lambda_function.monitor-active-fires.arn
}

resource "aws_cloudwatch_event_target" "wfnews-bans-prohibitions-event-target" {
  rule      = aws_cloudwatch_event_rule.wfnews-monitor-schedule-extended.name
  target_id = "bans-prohibitions-${var.target_env}-target"
  arn       = aws_lambda_function.monitor-bans-prohibitions.arn
}

resource "aws_cloudwatch_event_target" "wfnews-evacuation-event-target" {
  rule      = aws_cloudwatch_event_rule.wfnews-monitor-schedule.name
  target_id = "evacuation-event-${var.target_env}-target"
  arn       = aws_lambda_function.monitor-evacuation.arn
}

resource "aws_cloudwatch_event_target" "wfnews-area-restrictions-event-target" {
  rule      = aws_cloudwatch_event_rule.wfnews-monitor-schedule-extended.name
  target_id = "area-restrictions-${var.target_env}-target"
  arn       = aws_lambda_function.monitor-area-restrictions.arn
}

resource "aws_lambda_permission" "allow_fast_eventbridge_to_call_fires" {
  statement_id = "AllowFiresFromCloudWatch"
  action = "lambda:InvokeFunction"
  function_name=aws_lambda_function.monitor-active-fires.function_name
  principal="events.amazonaws.com"
  source_arn=aws_cloudwatch_event_rule.wfnews-monitor-schedule.arn
}

resource "aws_lambda_permission" "allow_fast_eventbridge_to_call_evac" {
  statement_id = "AllowEvacFromCloudWatch"
  action = "lambda:InvokeFunction"
  function_name=aws_lambda_function.monitor-evacuation.function_name
  principal="events.amazonaws.com"
  source_arn=aws_cloudwatch_event_rule.wfnews-monitor-schedule.arn
}

resource "aws_lambda_permission" "allow_extended_eventbridge_to_call_bans" {
  statement_id = "AllowBansFromCloudWatch"
  action = "lambda:InvokeFunction"
  function_name=aws_lambda_function.monitor-bans-prohibitions.function_name
  principal="events.amazonaws.com"
  source_arn=aws_cloudwatch_event_rule.wfnews-monitor-schedule-extended.arn
}

resource "aws_lambda_permission" "allow_extended_eventbridge_to_call_restrictions" {
  statement_id = "AllowRestrictionsFromCloudWatch"
  action = "lambda:InvokeFunction"
  function_name=aws_lambda_function.monitor-area-restrictions.function_name
  principal="events.amazonaws.com"
  source_arn=aws_cloudwatch_event_rule.wfnews-monitor-schedule-extended.arn
}
*/
