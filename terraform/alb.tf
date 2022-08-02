# alb.tf

# Use the default ALB that is pre-provisioned as part of the account creation
# This ALB has all traffic on *.LICENSE-PLATE-ENV.nimbus.cloud.gob.bc.ca routed to it

resource "aws_lb" "main" {
  name               = "wfnews-main-alb-${var.target_env}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [data.aws_security_group.web.id]
  subnets            = [for id in data.aws_subnets.my_subnets.ids : id]

  enable_deletion_protection = true

  # access_logs {
  #   bucket  = aws_s3_bucket.log_bucket.bucket
  #   prefix  = "${var.target_env}-lb"
  #   enabled = true
  # }

  tags = {
    Environment = var.target_env
  }
}

resource "aws_lb" "client" {
  name               = "wfnews-client-alb-${var.target_env}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [data.aws_security_group.web.id]
  subnets            = [for id in data.aws_subnets.my_subnets.ids : id]

  enable_deletion_protection = true

  # access_logs {
  #   bucket  = aws_s3_bucket.log_bucket.bucket
  #   prefix  = "${var.target_env}-lb"
  #   enabled = true
  # }

  tags = {
    Environment = var.target_env
  }
}


# Redirect all traffic from the ALB to the target group
resource "aws_alb_listener" "front_end" {
  default_action {
    type = "forward"
    target_group_arn = aws_alb_target_group.server.arn
  }
  load_balancer_arn = aws_lb.main.id
  port              = 443
  protocol = "HTTPS"
}

resource "aws_alb_listener" "client_front_end" {
  default_action {
    type = "forward"
    target_group_arn = aws_alb_target_group.client.arn
  }
  load_balancer_arn = aws_lb.client.id
  port              = 443
  protocol = "HTTPS"
}

resource "aws_alb_target_group" "server" {
  name                 = "wfnews-target-group-${var.target_env}"
  port                 = var.server_port
  protocol             = "HTTP"
  vpc_id               = var.aws_vpc
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

resource "aws_alb_target_group" "client" {
  name                 = "wfnews-client-target-group-${var.target_env}"
  port                 = var.client_port
  protocol             = "HTTP"
  vpc_id               = var.aws_vpc
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

resource "aws_lb_listener_rule" "host_based_weighted_routing" {
  listener_arn = aws_alb_listener.front_end.arn

  action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.server.arn
  }

  condition {
    host_header {
      values = [for sn in var.service_names : "${sn}.*"]
    }
  }
}

resource "aws_lb_listener_rule" "host_based_weighted_routing_client" {

  listener_arn = aws_alb_listener.client_front_end.arn

  action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.client.arn
  }

  condition {
    host_header {
      values = [for sn in var.service_names : "${sn}.*"]
    }
  }
}
