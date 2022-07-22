# security.tf

# ALB Security Group: Edit to restrict access to the application
data "aws_security_group" "web" {
  name = "${local.aws_sec_group}"
}

# Traffic to the ECS cluster should only come from the ALB
resource "aws_security_group" "ecs_tasks" {
  name        = "wfnews-ecs-tasks-security-group"
  description = "allow inbound access from the ALB only"
  vpc_id      = local.aws_vpc

  ingress {
    protocol        = "tcp"
    from_port       = var.app_port
    to_port         = var.app_port
    security_groups = [data.aws_security_group.web.id]
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = local.common_tags
}
