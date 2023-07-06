//EventBridge Resources
resource "aws_cloudwatch_event_rule" "wfone-public-mobile-monitor-schedule" {
  name                = "${var.application}-monitor-schedule-${module.vars.env.env_lowercase}"
  description         = "Run the monitor lambdas on a regular schedule"
  schedule_expression = "rate(5 minutes)"
}

resource "aws_cloudwatch_event_rule" "wfone-public-mobile-monitor-schedule-extended" {
  name                = "${var.application}-monitor-schedule-extended-${module.vars.env.env_lowercase}"
  description         = "Run the monitor lambdas on a regular schedule"
  schedule_expression = "rate(60 minutes)"
}

resource "aws_cloudwatch_event_target" "wfone-public-mobile-active-fires-event-target" {
  rule      = aws_cloudwatch_event_rule.wfone-public-mobile-monitor-schedule.name
  target_id = "active-fires-${module.vars.env.env_lowercase}-target"
  arn       = aws_lambda_function.monitor-active-fires.arn
}

resource "aws_cloudwatch_event_target" "wfone-public-mobile-bans-prohibitions-event-target" {
  rule      = aws_cloudwatch_event_rule.wfone-public-mobile-monitor-schedule-extended.name
  target_id = "bans-prohibitions-${module.vars.env.env_lowercase}-target"
  arn       = aws_lambda_function.monitor-bans-prohibitions.arn
}

resource "aws_cloudwatch_event_target" "wfone-public-mobile-evacuation-event-target" {
  rule      = aws_cloudwatch_event_rule.wfone-public-mobile-monitor-schedule.name
  target_id = "evacuation-event-${module.vars.env.env_lowercase}-target"
  arn       = aws_lambda_function.monitor-evacuation.arn
}

resource "aws_cloudwatch_event_target" "wfone-public-mobile-area-restrictions-event-target" {
  rule      = aws_cloudwatch_event_rule.wfone-public-mobile-monitor-schedule-extended.name
  target_id = "area-restrictions-${module.vars.env.env_lowercase}-target"
  arn       = aws_lambda_function.monitor-area-restrictions.arn
}

resource "aws_lambda_permission" "allow_fast_eventbridge_to_call_fires" {
  statement_id = "AllowFiresFromCloudWatch"
  action = "lambda:InvokeFunction"
  function_name=aws_lambda_function.monitor-active-fires.function_name
  principal="events.amazonaws.com"
  source_arn=aws_cloudwatch_event_rule.wfone-public-mobile-monitor-schedule.arn
}

resource "aws_lambda_permission" "allow_fast_eventbridge_to_call_evac" {
  statement_id = "AllowEvacFromCloudWatch"
  action = "lambda:InvokeFunction"
  function_name=aws_lambda_function.monitor-evacuation.function_name
  principal="events.amazonaws.com"
  source_arn=aws_cloudwatch_event_rule.wfone-public-mobile-monitor-schedule.arn
}

resource "aws_lambda_permission" "allow_extended_eventbridge_to_call_bans" {
  statement_id = "AllowBansFromCloudWatch"
  action = "lambda:InvokeFunction"
  function_name=aws_lambda_function.monitor-bans-prohibitions.function_name
  principal="events.amazonaws.com"
  source_arn=aws_cloudwatch_event_rule.wfone-public-mobile-monitor-schedule-extended.arn
}

resource "aws_lambda_permission" "allow_extended_eventbridge_to_call_restrictions" {
  statement_id = "AllowRestrictionsFromCloudWatch"
  action = "lambda:InvokeFunction"
  function_name=aws_lambda_function.monitor-area-restrictions.function_name
  principal="events.amazonaws.com"
  source_arn=aws_cloudwatch_event_rule.wfone-public-mobile-monitor-schedule-extended.arn
}
