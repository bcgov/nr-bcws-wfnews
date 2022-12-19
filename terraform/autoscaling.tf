# auto_scaling.tf

resource "aws_appautoscaling_target" "wfnews_target" {
  count              = local.create_ecs_service
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.wfnews_main.name}/${aws_ecs_service.wfnews_main[count.index].name}"
  scalable_dimension = "ecs:service:DesiredCount"
  min_capacity       = 1
  max_capacity       = 6
}

# Automatically scale capacity up by one
resource "aws_appautoscaling_policy" "wfnews_up" {
  count              = local.create_ecs_service
  name               = "wfnews_scale_up"
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.wfnews_main.name}/${aws_ecs_service.wfnews_main[count.index].name}"
  scalable_dimension = "ecs:service:DesiredCount"

  step_scaling_policy_configuration {
    adjustment_type         = "ChangeInCapacity"
    cooldown                = 60
    metric_aggregation_type = "Maximum"

    step_adjustment {
      metric_interval_lower_bound = 0
      scaling_adjustment          = 1
    }
  }

  depends_on = [aws_appautoscaling_target.wfnews_target]
}

# Automatically scale capacity down by one
resource "aws_appautoscaling_policy" "wfnews_down" {
  count              = local.create_ecs_service
  name               = "wfnews_scale_down"
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.wfnews_main.name}/${aws_ecs_service.wfnews_main[count.index].name}"
  scalable_dimension = "ecs:service:DesiredCount"

  step_scaling_policy_configuration {
    adjustment_type         = "ChangeInCapacity"
    cooldown                = 60
    metric_aggregation_type = "Maximum"

    step_adjustment {
      metric_interval_upper_bound = 0
      scaling_adjustment          = -1
    }
  }

  depends_on = [aws_appautoscaling_target.wfnews_target]
}

# CloudWatch alarm that triggers the autoscaling up policy
resource "aws_cloudwatch_metric_alarm" "wfnews_service_cpu_high" {
  count               = local.create_ecs_service
  alarm_name          = "wfnews_cpu_utilization_high"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "60"
  statistic           = "Average"
  threshold           = "85"

  dimensions = {
    ClusterName = aws_ecs_cluster.wfnews_main.name
    ServiceName = aws_ecs_service.wfnews_main[count.index].name
  }

  alarm_actions = [aws_appautoscaling_policy.wfnews_up[count.index].arn]

  tags = local.common_tags
}

# CloudWatch alarm that triggers the autoscaling down policy
resource "aws_cloudwatch_metric_alarm" "wfnews_service_cpu_low" {
  count               = local.create_ecs_service
  alarm_name          = "wfnews_cpu_utilization_low"
  comparison_operator = "LessThanOrEqualToThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "60"
  statistic           = "Average"
  threshold           = "10"

  dimensions = {
    ClusterName = aws_ecs_cluster.wfnews_main.name
    ServiceName = aws_ecs_service.wfnews_main[count.index].name
  }

  alarm_actions = [aws_appautoscaling_policy.wfnews_down[count.index].arn]

  tags = local.common_tags
}

resource "aws_appautoscaling_target" "wfnews_client_target" {
  count              = local.create_ecs_service
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.wfnews_main.name}/${aws_ecs_service.client[count.index].name}"
  scalable_dimension = "ecs:service:DesiredCount"
  min_capacity       = 1
  max_capacity       = 6
}

# Automatically scale capacity up by one
resource "aws_appautoscaling_policy" "wfnews_client_up" {
  count              = local.create_ecs_service
  name               = "wfnews_client_scale_up"
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.wfnews_main.name}/${aws_ecs_service.client[count.index].name}"
  scalable_dimension = "ecs:service:DesiredCount"

  step_scaling_policy_configuration {
    adjustment_type         = "ChangeInCapacity"
    cooldown                = 60
    metric_aggregation_type = "Maximum"

    step_adjustment {
      metric_interval_lower_bound = 0
      scaling_adjustment          = 1
    }
  }

  depends_on = [aws_appautoscaling_target.wfnews_client_target]
}

# Automatically scale capacity down by one
resource "aws_appautoscaling_policy" "wfnews_client_down" {
  count              = local.create_ecs_service
  name               = "wfnews_client_scale_down"
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.wfnews_main.name}/${aws_ecs_service.client[count.index].name}"
  scalable_dimension = "ecs:service:DesiredCount"

  step_scaling_policy_configuration {
    adjustment_type         = "ChangeInCapacity"
    cooldown                = 60
    metric_aggregation_type = "Maximum"

    step_adjustment {
      metric_interval_upper_bound = 0
      scaling_adjustment          = -1
    }
  }

  depends_on = [aws_appautoscaling_target.wfnews_client_target]
}

# CloudWatch alarm that triggers the autoscaling down policy
resource "aws_cloudwatch_metric_alarm" "wfnews_client_service_cpu_low" {
  count               = local.create_ecs_service
  alarm_name          = "wfnews_client_cpu_utilization_low"
  comparison_operator = "LessThanOrEqualToThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "60"
  statistic           = "Average"
  threshold           = "10"

  dimensions = {
    ClusterName = aws_ecs_cluster.wfnews_main.name
    ServiceName = aws_ecs_service.client[count.index].name
  }

  alarm_actions = [aws_appautoscaling_policy.wfnews_client_down[count.index].arn]

  tags = local.common_tags
}

# CloudWatch alarm that triggers the autoscaling up policy
resource "aws_cloudwatch_metric_alarm" "wfnews_service_cpu_high" {
  count               = local.create_ecs_service
  alarm_name          = "wfnews_client_cpu_utilization_high"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "60"
  statistic           = "Average"
  threshold           = "85"

  dimensions = {
    ClusterName = aws_ecs_cluster.wfnews_main.name
    ServiceName = aws_ecs_service.client[count.index].name
  }

  alarm_actions = [aws_appautoscaling_policy.wfnews_client_up[count.index].arn]

  tags = local.common_tags
}