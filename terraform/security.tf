# security.tf

# ALB Security Group: Edit to restrict access to the application
data "aws_security_group" "web" {
  name = "Web_sg"
}

resource "aws_security_group" "wfnews_ecs_tasks" {
  name        = "wfnews-ecs-tasks-security-group"
  description = "Allow access"
  vpc_id      = module.network.aws_vpc.id

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
    security_groups = [data.aws_security_group.web.id]
    #cidr_blocks = ["0.0.0.0/0"]
  }
    
  #necessary for postgres dev work
  #TODO: REMOVE  THIS
  ingress {
    protocol = "postgresql"
    from_port = 0
    to_port = 5432
    #cidr_blocks = ["0.0.0.0/0"]
  }

  # #Permit external access for test purposes
  # ingress {
  #   protocol    = "-1"
  #   from_port   = 0
  #   to_port     = 0
  #   cidr_blocks = ["0.0.0.0/0"]
  # }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = local.common_tags
}
