# security.tf

# ALB Security Group: Edit to restrict access to the application
data "aws_security_group" "web" {
  name = "${var.aws_sec_group}"
}

resource "aws_security_group" "wfnews_ecs_tasks" {
  name        = "wfnews-ecs-tasks-security-group"
  description = "Allow access"
  vpc_id      = data.aws_vpc.main_vpc.id

  ingress {
    protocol        = "tcp"
    from_port       = var.server_port
    to_port         = var.server_port
    security_groups = [data.aws_security_group.web.id]
  }
  #necessary to pull image from ghcr
  ingress {
    protocol = "tcp"
    from_port = 443
    to_port = 443
    cidr_blocks = [for s in data.aws_subnet.web_subnet : s.cidr_block]
  }

  #Permit external access for test purposes
  ingress {
    protocol = "tcp"
    from_port = 8080
    to_port = 8080
    cidr_blocks = [for s in data.aws_subnet.web_subnet : s.cidr_block]
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = [for s in data.aws_subnet.web_subnet : s.cidr_block]
  }

  tags = local.common_tags
}
