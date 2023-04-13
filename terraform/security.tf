# security.tf

# ALB Security Group: Edit to restrict access to the application
data "aws_security_group" "web" {
  name = "Web_sg"
}

data "aws_security_group" "app" {
  name = "App_sg"
}

data "aws_security_group" "data" {
  name = "Data_sg"
}

resource "aws_security_group" "wfnews_ecs_tasks" {
  name        = "wfnews-ecs-tasks-security-group"
  description = "Allow access"
  vpc_id      = module.network.aws_vpc.id

  ingress {
    protocol        = "tcp"
    from_port       = var.server_port
    to_port         = var.server_port
    security_groups = [data.aws_security_group.web.id, data.aws_security_group.app.id]
  }

  #necessary to pull image from ghcr
  ingress {
    protocol        = "tcp"
    from_port       = 443
    to_port         = 443
    security_groups = [data.aws_security_group.web.id, data.aws_security_group.app.id]
    #cidr_blocks = ["0.0.0.0/0"]
  }

  #necessary for postgres dev work
  #TODO: REMOVE  THIS
  ingress {
    protocol        = "tcp"
    from_port       = 0
    to_port         = 5432
    security_groups = [data.aws_security_group.web.id, data.aws_security_group.app.id]
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

# resource "aws_security_group" "wfnews_efs_access" {
#   name = "wfnews-efs-access-${var.target_env}"
#   description = "allow access for efs"
#   vpc_id      = module.network.aws_vpc.id

#   ingress {
#     protocol = -1
#     from_port = 0
#     to_port = 0
#     self = true
#   }
# }

# resource "aws_security_group_rule" "wfnews_allow_http" {
#   type              = "ingress"
#   from_port         = 80
#   to_port           = 80
#   protocol          = "tcp"
#   cidr_blocks = ["0.0.0.0/0"]
#   security_group_id =  data.aws_security_group.data.id
