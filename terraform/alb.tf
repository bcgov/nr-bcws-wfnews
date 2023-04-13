# alb.tf

# Must use a pre-existing ALB, such as default that is pre-provisioned as part of the account creation
# This ALB has all traffic on *.LICENSE-PLATE-ENV.nimbus.cloud.gob.bc.ca routed to it

data "aws_lb" "wfnews_main" {
  name = var.alb_name
}

# resource "aws_lb" "wfnews_main" {
#   name               = "wfnews-alb-${var.target_env}"
#   internal           = false
#   load_balancer_type = "application"
#   security_groups    = [data.aws_security_group.web.id]
#   subnets            = [for id in data.aws_subnets.my_subnets.ids : id]

#   enable_deletion_protection = true

#   # access_logs {
#   #   bucket  = aws_s3_bucket.log_bucket.bucket
#   #   prefix  = "${var.target_env}-lb"
#   #   enabled = true
#   # }

#   tags = {
#     Environment = var.target_env
#   }
# }

# resource "aws_lb" "wfnews_client" {
#   name               = "wfnews-client-alb-${var.target_env}"
#   internal           = false
#   load_balancer_type = "application"
#   security_groups    = [data.aws_security_group.web.id]
#   subnets            = [for id in data.aws_subnets.my_subnets.ids : id]

#   enable_deletion_protection = true

#   # access_logs {
#   #   bucket  = aws_s3_bucket.log_bucket.bucket
#   #   prefix  = "${var.target_env}-lb"
#   #   enabled = true
#   # }

#   tags = {
#     Environment = var.target_env
#   }
# }


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
    timeout             = "3"
    path                = var.health_check_path
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
    path                = var.health_check_path
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

resource "aws_alb_target_group" "wfnews_apisix" {
  name                 = "wfnews-apisix-${var.target_env}"
  port                 = var.apisix_ports[0]
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
    path                = var.health_check_path
    unhealthy_threshold = "2"
  }

  tags = local.common_tags
}

/*
resource "aws_alb_target_group" "wfnews_apisix_admin" {
  name                 = "wfnews-apisix-admin-${var.target_env}"
  port                 = var.apisix_admin_port
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
    port = var.health_check_port
    path                = var.health_check_path
    unhealthy_threshold = "2"
  }

  tags = local.common_tags
}


resource "aws_alb_target_group" "wfnews_etcd" {
  name                 = "wfnews-etcd-${var.target_env}"
  port                 = var.etcd_port
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
    path                = "/version"
    unhealthy_threshold = "2"
  }

  tags = local.common_tags
}


resource "aws_alb_target_group" "wfnews_apisix_gui" {
  name                 = "wfnews-apisix-gui-${var.target_env}"
  port                 = var.apisix_gui_port
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
    port = var.apisix_gui_port
    path                = var.health_check_path
    unhealthy_threshold = "2"
  }

  tags = local.common_tags
}
*/

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

resource "aws_lb_listener_rule" "wfnews_host_based_weighted_routing_apisix" {

  listener_arn = data.aws_alb_listener.wfnews_server_front_end.arn

  action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.wfnews_apisix.arn
  }

  condition {
    host_header {
      values = [for sn in var.apisix_names : "${sn}.*"]
    }
  }
  condition {
    http_header {
      http_header_name = "X-Cloudfront-Header"
      values           = ["${var.cloudfront_header}"]
    }
  }
}

/*
resource "aws_lb_listener_rule" "wfnews_host_based_weighted_routing_apisix_admin" {

  listener_arn = data.aws_alb_listener.wfnews_server_front_end.arn

  action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.wfnews_apisix_admin.arn
  }

  condition {
    host_header {
      values = [for sn in var.apisix_admin_names : "${sn}.*"]
    }
  }
}


resource "aws_lb_listener_rule" "wfnews_host_based_weighted_routing_etcd" {

  listener_arn = aws_alb_listener.wfnews_backend_listener.arn

  action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.wfnews_etcd.arn
  }

  condition {
    host_header {
      values = [for sn in var.etcd_names : "${sn}.*"]
    }
  }
}


resource "aws_lb_listener_rule" "wfnews_host_based_weighted_routing_apisix_gui" {

  listener_arn = data.aws_alb_listener.wfnews_server_front_end.arn

  action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.wfnews_apisix_gui.arn
  }

  condition {
    host_header {
      values = [for sn in var.apisix_gui_names : "${sn}.*"]
    }
  }
}
*/
