# security.tf

resource "aws_security_group" "wfnews_ecs_tasks" {
  name        = "wfnews-ecs-tasks-security-group"
  description = "Allow access"
  vpc_id      = module.networking.vpc.id

  ingress {
    protocol        = "tcp"
    from_port       = var.server_port
    to_port         = var.server_port
    security_groups = [module.networking.security_groups.web.id, module.networking.security_groups.app.id]
  }

  #necessary to pull image from ghcr
  ingress {
    protocol        = "tcp"
    from_port       = 443
    to_port         = 443
    security_groups = [module.networking.security_groups.web.id, module.networking.security_groups.app.id]
    #cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = local.common_tags
}


resource "aws_security_group" "jumphost" {
  name        = "wfnews-jumphost-access"
  description = "Allow access to jumphost via ssm"
  vpc_id      = module.networking.vpc.id
  ingress {
    protocol = "tcp"
    from_port = 3389
    to_port = 3389
    security_groups = [module.networking.security_groups.web.id]
  }

  ingress {
    protocol = "tcp"
    from_port = 3389
    to_port = 3389
    security_groups = [module.networking.security_groups.app.id]
  }
}