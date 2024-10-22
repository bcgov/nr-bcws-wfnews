# auto_scaling.tf

resource "aws_appautoscaling_target" "wfnews_target" {
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.wfnews_main.name}/${aws_ecs_service.wfnews_main.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  min_capacity       = var.app_count
  max_capacity       = 10
}

resource "aws_appautoscaling_target" "wfnews_nginx_target" {
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.wfnews_main.name}/${aws_ecs_service.nginx.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  min_capacity       = var.app_count
  max_capacity       = 10
}

# Automatically scale capacity up by one
resource "aws_appautoscaling_policy" "wfnews_up" {
  name               = "wfnews_scale_up"
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.wfnews_main.name}/${aws_ecs_service.wfnews_main.name}"
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

resource "aws_appautoscaling_policy" "wfnews_nginx_up" {
  name               = "wfnews_nginx_scale_up"
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.wfnews_main.name}/${aws_ecs_service.nginx.name}"
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

  depends_on = [aws_appautoscaling_target.wfnews_nginx_target]
}

# Automatically scale capacity down by one
resource "aws_appautoscaling_policy" "wfnews_down" {
  name               = "wfnews_scale_down"
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.wfnews_main.name}/${aws_ecs_service.wfnews_main.name}"
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

resource "aws_appautoscaling_policy" "wfnews_nginx_down" {
  name               = "wfnews_nginx_scale_down"
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.wfnews_main.name}/${aws_ecs_service.nginx.name}"
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

  depends_on = [aws_appautoscaling_target.wfnews_nginx_target]
}

# CloudWatch alarm that triggers the autoscaling up policy
resource "aws_cloudwatch_metric_alarm" "wfnews_service_cpu_high" {
  alarm_name          = "wfnews_cpu_utilization_high"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "1"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "60"
  statistic           = "Maximum"
  threshold           = "50"

  dimensions = {
    ClusterName = aws_ecs_cluster.wfnews_main.name
    ServiceName = aws_ecs_service.wfnews_main.name
  }

  alarm_actions = [aws_appautoscaling_policy.wfnews_up.arn]

  tags = local.common_tags
}

resource "aws_cloudwatch_metric_alarm" "wfnews_nginx_service_cpu_high" {
  alarm_name          = "wfnews_nginx_cpu_utilization_high"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "1"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "60"
  statistic           = "Maximum"
  threshold           = "50"

  dimensions = {
    ClusterName = aws_ecs_cluster.wfnews_main.name
    ServiceName = aws_ecs_service.nginx.name
  }

  alarm_actions = [aws_appautoscaling_policy.wfnews_nginx_up.arn]

  tags = local.common_tags
}

# CloudWatch alarm that triggers the autoscaling down policy
resource "aws_cloudwatch_metric_alarm" "wfnews_service_cpu_low" {
  alarm_name          = "wfnews_cpu_utilization_low"
  comparison_operator = "LessThanOrEqualToThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "60"
  statistic           = "Maximum"
  threshold           = "10"

  dimensions = {
    ClusterName = aws_ecs_cluster.wfnews_main.name
    ServiceName = aws_ecs_service.wfnews_main.name
  }

  alarm_actions = [aws_appautoscaling_policy.wfnews_down.arn]

  tags = local.common_tags
}

resource "aws_cloudwatch_metric_alarm" "wfnews_nginx_service_cpu_low" {
  alarm_name          = "wfnews_nginx_cpu_utilization_low"
  comparison_operator = "LessThanOrEqualToThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "60"
  statistic           = "Maximum"
  threshold           = "10"

  dimensions = {
    ClusterName = aws_ecs_cluster.wfnews_main.name
    ServiceName = aws_ecs_service.nginx.name
  }

  alarm_actions = [aws_appautoscaling_policy.wfnews_nginx_down.arn]

  tags = local.common_tags
}

resource "aws_appautoscaling_target" "wfnews_client_target" {
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.wfnews_main.name}/${aws_ecs_service.client.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  min_capacity       = var.app_count
  max_capacity       = 10
}

# Automatically scale capacity up by one
resource "aws_appautoscaling_policy" "wfnews_client_up" {
  name               = "wfnews_client_scale_up"
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.wfnews_main.name}/${aws_ecs_service.client.name}"
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
  name               = "wfnews_client_scale_down"
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.wfnews_main.name}/${aws_ecs_service.client.name}"
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
  alarm_name          = "wfnews_client_cpu_utilization_low"
  comparison_operator = "LessThanOrEqualToThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "60"
  statistic           = "Maximum"
  threshold           = "10"

  dimensions = {
    ClusterName = aws_ecs_cluster.wfnews_main.name
    ServiceName = aws_ecs_service.client.name
  }

  alarm_actions = [aws_appautoscaling_policy.wfnews_client_down.arn]

  tags = local.common_tags
}

# CloudWatch alarm that triggers the autoscaling up policy
resource "aws_cloudwatch_metric_alarm" "wfnews_client_service_cpu_high" {
  alarm_name          = "wfnews_client_cpu_utilization_high"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "1"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "60"
  statistic           = "Maximum"
  threshold           = "50"

  dimensions = {
    ClusterName = aws_ecs_cluster.wfnews_main.name
    ServiceName = aws_ecs_service.client.name
  }

  alarm_actions = [aws_appautoscaling_policy.wfnews_client_up.arn]

  tags = local.common_tags
}


//////////////////////////////////////////////////
////  WFSS-POINTID-API ///////////////////////////
//////////////////////////////////////////////////

resource "aws_appautoscaling_target" "wfss_pointid_target" {
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.wfnews_main.name}/${aws_ecs_service.pointid.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  min_capacity       = var.app_count
  max_capacity       = 16
}

# Automatically scale capacity up by one
resource "aws_appautoscaling_policy" "wfss_pointid_up" {
  name               = "wfss_pointid_scale_up"
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.wfnews_main.name}/${aws_ecs_service.pointid.name}"
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

  depends_on = [aws_appautoscaling_target.wfss_pointid_target]
}

# Automatically scale capacity down by one
resource "aws_appautoscaling_policy" "wfss_pointid_down" {
  name               = "wfss_pointid_scale_down"
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.wfnews_main.name}/${aws_ecs_service.pointid.name}"
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

  depends_on = [aws_appautoscaling_target.wfss_pointid_target]
}

# CloudWatch alarm that triggers the autoscaling down policy
resource "aws_cloudwatch_metric_alarm" "wfss_pointid_service_cpu_low" {
  alarm_name          = "wfss_pointid_cpu_utilization_low"
  comparison_operator = "LessThanOrEqualToThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "60"
  statistic           = "Maximum"
  threshold           = "10"

  dimensions = {
    ClusterName = aws_ecs_cluster.wfnews_main.name
    ServiceName = aws_ecs_service.pointid.name
  }

  alarm_actions = [aws_appautoscaling_policy.wfss_pointid_down.arn]

  tags = local.common_tags
}

# CloudWatch alarm that triggers the autoscaling up policy
resource "aws_cloudwatch_metric_alarm" "wfss_pointid_service_cpu_high" {
  alarm_name          = "wfss_pointid_cpu_utilization_high"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "1"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "60"
  statistic           = "Maximum"
  threshold           = "50"

  dimensions = {
    ClusterName = aws_ecs_cluster.wfnews_main.name
    ServiceName = aws_ecs_service.pointid.name
  }

  alarm_actions = [aws_appautoscaling_policy.wfss_pointid_up.arn]

  tags = local.common_tags
}

# __________________________________________________________
# 
#                 WFONE-NOTIFICATION-API
# __________________________________________________________

resource "aws_appautoscaling_target" "wfone_notifications_api_target" {
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.wfnews_main.name}/${aws_ecs_service.wfone_notifications_api.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  min_capacity       = var.app_count
  max_capacity       = 10
}

# Automatically scale capacity up by one
resource "aws_appautoscaling_policy" "wfone_notifications_api_up" {
  name               = "wfone_notifications_api_scale_up"
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.wfnews_main.name}/${aws_ecs_service.wfone_notifications_api.name}"
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

  depends_on = [aws_appautoscaling_target.wfone_notifications_api_target]
}

# Automatically scale capacity down by one
resource "aws_appautoscaling_policy" "wfone_notifications_api_down" {
  name               = "wfone_notifications_api_scale_down"
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.wfnews_main.name}/${aws_ecs_service.wfone_notifications_api.name}"
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

  depends_on = [aws_appautoscaling_target.wfone_notifications_api_target]
}

# CloudWatch alarm that triggers the autoscaling down policy
resource "aws_cloudwatch_metric_alarm" "wfone_notifications_api_service_cpu_low" {
  alarm_name          = "wfone_notifications_api_cpu_utilization_low"
  comparison_operator = "LessThanOrEqualToThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "60"
  statistic           = "Maximum"
  threshold           = "10"

  dimensions = {
    ClusterName = aws_ecs_cluster.wfnews_main.name
    ServiceName = aws_ecs_service.wfone_notifications_api.name
  }

  alarm_actions = [aws_appautoscaling_policy.wfone_notifications_api_down.arn]

  tags = local.common_tags
}

# CloudWatch alarm that triggers the autoscaling up policy
resource "aws_cloudwatch_metric_alarm" "wfone_notifications_api_service_cpu_high" {
  alarm_name          = "wfone_notifications_api_cpu_utilization_high"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "1"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "60"
  statistic           = "Maximum"
  threshold           = "50"

  dimensions = {
    ClusterName = aws_ecs_cluster.wfnews_main.name
    ServiceName = aws_ecs_service.wfone_notifications_api.name
  }

  alarm_actions = [aws_appautoscaling_policy.wfone_notifications_api_up.arn]

  tags = local.common_tags
}
