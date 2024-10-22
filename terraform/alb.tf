# alb.tf

# Must use a pre-existing ALB, such as default that is pre-provisioned as part of the account creation
# This ALB has all traffic on *.LICENSE-PLATE-ENV.nimbus.cloud.gob.bc.ca routed to it

data "aws_lb" "wfnews_main" {
  name = var.alb_name
}


# Redirect all traffic from the ALB to the target group
data "aws_alb_listener" "wfnews_server_front_end" {
  load_balancer_arn = data.aws_lb.wfnews_main.id
  port              = 443
}

resource "aws_alb_listener" "wfnews_backend_listener" {
  load_balancer_arn = data.aws_lb.wfnews_main.id
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

resource "aws_alb_target_group" "wfnews_server" {
  name                 = "wfnews-server-${var.target_env}"
  port                 = var.server_port
  protocol             = "HTTP"
  vpc_id               = module.network.aws_vpc.id
  target_type          = "ip"
  deregistration_delay = 30

  health_check {
    healthy_threshold   = "2"
    interval            = "300"
    protocol            = "HTTP"
    matcher             = "200"
    timeout             = "60"
    path                = var.api_health_check_path
    unhealthy_threshold = "2"
  }

  tags = local.common_tags
}

resource "aws_alb_target_group" "wfnews_client" {
  name                 = "wfnews-client-${var.target_env}"
  port                 = var.client_port
  protocol             = "HTTP"
  vpc_id               = module.network.aws_vpc.id
  target_type          = "ip"
  deregistration_delay = 30

  health_check {
    healthy_threshold   = "2"
    interval            = "300"
    protocol            = "HTTP"
    matcher             = "200"
    timeout             = "3"
    path                = var.client_health_check_path
    unhealthy_threshold = "2"
  }

  tags = local.common_tags
}

resource "aws_alb_target_group" "wfnews_liquibase" {
  name                 = "wfnews-liquibase-${var.target_env}"
  port                 = var.client_port
  protocol             = "HTTP"
  vpc_id               = module.network.aws_vpc.id
  target_type          = "ip"
  deregistration_delay = 30

  health_check {
    healthy_threshold   = "2"
    interval            = "300"
    protocol            = "HTTP"
    matcher             = "200"
    timeout             = "3"
    path                = var.health_check_path
    unhealthy_threshold = "2"
  }

  tags = local.common_tags
}

resource "aws_alb_target_group" "notifications_liquibase" {
  name                 = "notifications-liquibase-${var.target_env}"
  port                 = var.client_port
  protocol             = "HTTP"
  vpc_id               = module.network.aws_vpc.id
  target_type          = "ip"
  deregistration_delay = 30

  health_check {
    healthy_threshold   = "2"
    interval            = "300"
    protocol            = "HTTP"
    matcher             = "200"
    timeout             = "3"
    path                = var.health_check_path
    unhealthy_threshold = "2"
  }

  tags = local.common_tags
}

resource "aws_alb_target_group" "wfnews_nginx" {
  name                 = "wfnews-nginx-${var.target_env}"
  port                 = var.nginx_ports[0]
  protocol             = "HTTP"
  vpc_id               = module.network.aws_vpc.id
  target_type          = "ip"
  deregistration_delay = 30

  health_check {
    healthy_threshold   = "2"
    interval            = "300"
    protocol            = "HTTP"
    matcher             = "200"
    timeout             = "3"
    port                = var.health_check_port
    path                = var.api_health_check_path
    unhealthy_threshold = "2"
  }

  tags = local.common_tags
}

resource "aws_alb_target_group" "wfss_pointid" {
  name                 = "wfss-pointid-api-${var.target_env}"
  port                 = var.pointid_port
  protocol             = "HTTP"
  vpc_id               = module.network.aws_vpc.id
  target_type          = "ip"
  deregistration_delay = 30

  health_check {
    healthy_threshold   = "2"
    interval            = "300"
    protocol            = "HTTP"
    matcher             = "200"
    timeout             = "60"
    port                = var.health_check_port
    path                = var.pointid_health_check_path
    unhealthy_threshold = "2"
  }

  tags = local.common_tags
}

resource "aws_alb_target_group" "wfone_notifications_api" {
  name                 = "wfone-notifications-api-${var.target_env}"
  port                 = var.wfone_notifications_api_port
  protocol             = "HTTP"
  vpc_id               = module.network.aws_vpc.id
  target_type          = "ip"
  deregistration_delay = 30

  health_check {
    healthy_threshold   = "2"
    interval            = "300"
    protocol            = "HTTP"
    matcher             = "200"
    timeout             = "60"
    port                = var.health_check_port
    path                = var.api_health_check_path
    unhealthy_threshold = "2"
  }

  tags = local.common_tags
}

resource "aws_alb_target_group" "wfone_notifications_push_api" {
  for_each = var.WFONE_MONITORS_NAME_MAP
  #Would prefer to have name be wfone-notification-push-api-active-fires-dev or so on, but maximum is 32 chars
  name                 = "${each.key}-${var.target_env}"
  port                 = var.wfone_notifications_push_api_port
  protocol             = "HTTP"
  vpc_id               = module.network.aws_vpc.id
  target_type          = "ip"
  deregistration_delay = 30

  health_check {
    healthy_threshold   = "2"
    interval            = "300"
    protocol            = "HTTP"
    matcher             = "200"
    timeout             = "3"
    port                = var.health_check_port
    path                = var.api_health_check_path
    unhealthy_threshold = "2"
  }

  tags = local.common_tags
}


resource "aws_lb_listener_rule" "wfnews_host_based_weighted_routing_notifications_liquibase" {

  listener_arn = data.aws_alb_listener.wfnews_server_front_end.arn

  action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.notifications_liquibase.arn
  }

  condition {
    host_header {
      values = [for sn in var.notifications_liquibase_names : "${sn}.*"]
    }
  }

  condition {
    http_header {
      http_header_name = "X-Cloudfront-Header"
      values           = ["${var.cloudfront_header}"]
    }
  }
}

resource "aws_lb_listener_rule" "wfnews_host_based_weighted_routing" {
  listener_arn = data.aws_alb_listener.wfnews_server_front_end.arn

  action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.wfnews_server.arn
  }

  condition {
    host_header {
      values = [for sn in var.server_names : "${sn}.*"]
    }
  }
  condition {
    http_header {
      http_header_name = "X-Cloudfront-Header"
      values           = ["${var.cloudfront_header}"]
    }
  }
}

resource "aws_lb_listener_rule" "wfnews_host_based_weighted_routing_client" {

  listener_arn = data.aws_alb_listener.wfnews_server_front_end.arn

  action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.wfnews_client.arn
  }

  condition {
    host_header {
      values = [for sn in var.client_names : "${sn}.*"]
    }
  }
  condition {
    http_header {
      http_header_name = "X-Cloudfront-Header"
      values           = ["${var.cloudfront_header}"]
    }
  }
}

resource "aws_lb_listener_rule" "wfnews_host_based_weighted_routing_liquibase" {

  listener_arn = data.aws_alb_listener.wfnews_server_front_end.arn

  action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.wfnews_liquibase.arn
  }

  condition {
    host_header {
      values = [for sn in var.liquibase_names : "${sn}.*"]
    }
  }

  condition {
    http_header {
      http_header_name = "X-Cloudfront-Header"
      values           = ["${var.cloudfront_header}"]
    }
  }
}

resource "aws_lb_listener_rule" "wfnews_host_based_weighted_routing_nginx" {

  listener_arn = data.aws_alb_listener.wfnews_server_front_end.arn

  action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.wfnews_nginx.arn
  }

  condition {
    host_header {
      values = [for sn in concat(var.nginx_names, var.redirect_names) : "${sn}.*"]
    }
  }
  condition {
    http_header {
      http_header_name = "X-Cloudfront-Header"
      values           = ["${var.cloudfront_header}"]
    }
  }
}

resource "aws_lb_listener_rule" "wfnews_host_based_weighted_routing_wfss_pointid" {

  listener_arn = data.aws_alb_listener.wfnews_server_front_end.arn

  action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.wfss_pointid.arn
  }

  condition {
    host_header {
      values = [for sn in var.pointid_names : "${sn}.*"]
    }
  }
  condition {
    http_header {
      http_header_name = "X-Cloudfront-Header"
      values           = ["${var.cloudfront_header}"]
    }
  }
}

resource "aws_lb_listener_rule" "wfnews_host_based_weighted_routing_wfone_notifications_api" {

  listener_arn = data.aws_alb_listener.wfnews_server_front_end.arn

  action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.wfone_notifications_api.arn
  }

  condition {
    host_header {
      values = [for sn in var.wfone_notifications_api_names : "${sn}.*"]
    }
  }
  condition {
    http_header {
      http_header_name = "X-Cloudfront-Header"
      values           = ["${var.cloudfront_header}"]
    }
  }
}

#Creation is mandatory when using ecs service
resource "aws_lb_listener_rule" "wfnews_host_based_weighted_routing_push_api" {
  for_each = var.WFONE_MONITORS_NAME_MAP
  listener_arn = data.aws_alb_listener.wfnews_server_front_end.arn

  action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.wfone_notifications_push_api[each.key].arn
  }

  condition {
    host_header {
      values = ["wfone-notifications-push-api-${each.key}.*"]
    }
  }
  condition {
    source_ip {
      values           = ["127.0.0.1/32"]
    }
  }
}

