# ecs.tf

resource "aws_ecs_cluster" "wfnews_main" {
  name               = "wfnews-cluster"

  tags = local.common_tags
}

resource "aws_ecs_cluster_capacity_providers" "wfnews_main_providers" {
    cluster_name = aws_ecs_cluster.wfnews_main.name

    capacity_providers = ["FARGATE","FARGATE_SPOT"]

    default_capacity_provider_strategy {
        base              = 1
        weight            = 100
        capacity_provider = "FARGATE_SPOT"
    }
}

resource "aws_ecs_task_definition" "wfnews_server" {
  count                    = local.create_ecs_service
  family                   = "wfnews-server-task-${var.target_env}"
  execution_role_arn       = aws_iam_role.wfnews_ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.wfnews_app_container_role.arn
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.fargate_cpu
  memory                   = var.fargate_memory
  tags                     = local.common_tags
  container_definitions = jsonencode([
    {
      essential   = true
      name        = var.server_container_name
      image       = var.server_image
      cpu         = var.fargate_cpu
      memory      = var.fargate_memory
      networkMode = "awsvpc"
      portMappings = [
        {
          protocol      = "tcp"
          containerPort = var.server_port
          hostPort      = var.server_port
        }
      ]
      environment = [
        {
          name  = "DB_NAME"
          value = "${aws_db_instance.wfnews_pgsqlDB.name}"
        },
        {
          name  = "AWS_REGION",
          value = var.aws_region
        },
        {
          name  = "bucketName",
          value = aws_s3_bucket.wfnews_upload_bucket.id
        },
        {
          name = "WEBADE_OAUTH2_CLIENT_ID",
          value = var.WEBADE_OAUTH2_CLIENT_ID
        },
        {
          name = "WEBADE-OAUTH2_TOKEN_CLIENT_URL",
          value = var.WEBADE-OAUTH2_TOKEN_CLIENT_URL
        },
        {
          name = "WEBADE-OAUTH2_TOKEN_URL",
          value = var.WEBADE-OAUTH2_TOKEN_URL
        },
        {
          name = "WEBADE_OAUTH2_WFNEWS_REST_CLIENT_SECRET",
          value = var.WEBADE_OAUTH2_WFNEWS_REST_CLIENT_SECRET
        },
        {
          name = "WFDM_REST_URL",
          value = var.WFDM_REST_URL
        },
        {
          name = "WFIM_CLIENT_URL",
          value = var.WFIM_CLIENT_URL
        },
        {
          name = "WFIM_CODE_TABLES_URL",
          value = var.WFIM_CODE_TABLES_URL
        },
        {
          name = "WEBADE-OAUTH2_CHECK_TOKEN_URL",
          value = var.WEBADE-OAUTH2_CHECK_TOKEN_URL
        },
        {
          name = "WFNEWS_EMAIL_NOTIFICATIONS_ENABLED_IND",
          value = var.WFNEWS_EMAIL_NOTIFICATIONS_ENABLED
        },
        {
          name = "SMTP_HOST_NAME",
          value = var.SMTP_HOST_NAME
        },
        {
          name = "SMTP_PASSWORD",
          value = var.SMTP_PASSWORD
        },
        {
          name = "SMTP_FROM_EMAIL",
          value = var.SMTP_FROM_EMAIL
        },
        {
          name = "SMTP_ADMIN_EMAIL",
          value = var.SMTP_ADMIN_EMAIL
        },
        {
          name = "SMTP_EMAIL_SYNC_ERROR_FREQ",
          value = var.SMTP_EMAIL_SYNC_ERROR_FREQ
        },
        {
          name = "SMTP_EMAIL_FREQ",
          value = var.SMTP_EMAIL_FREQ
        },{
          name = "SMTP_EMAIL_ERROR_SUBJECT",
          value = var.SMTP_EMAIL_ERROR_SUBJECT
        },
        {
          name = "SMTP_EMAIL_SUBJECT",
          value = var.SMTP_EMAIL_SUBJECT
        },
        {
          name = "DEFAULT_APPLICATION_ENVIRONMENT",
          value = var.DEFAULT_APPLICATION_ENVIRONMENT
        },
        {
          name = "WFNEWS_AGOL_QUERY_URL",
          value = var.WFNEWS_AGOL_QUERY_URL
        },
        {
          name  = "WFNEWS_DB_URL",
          value = "jdbc:postgresql://${aws_db_instance.wfnews_pgsqlDB.endpoint}/${aws_db_instance.wfnews_pgsqlDB.name}"
        },
        {
          name = "WFNEWS_USERNAME",
          value = var.WFNEWS_USERNAME
        },
        {
          name = "WFNEWS_MAX_CONNECTIONS",
          value = var.WFNEWS_MAX_CONNECTIONS
        },
        {
          name = "DB_PASS"
          value = "${var.db_pass}"
        }

      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-create-group  = "true"
          awslogs-group         = "/ecs/${var.server_name}"
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
      mountPoints = []
      volumesFrom = []
    }
  ])
}

resource "aws_ecs_task_definition" "wfnews_client" {
  count                    = local.create_ecs_service
  family                   = "wfnews-client-task-${var.target_env}"
  execution_role_arn       = aws_iam_role.wfnews_ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.wfnews_app_container_role.arn
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.fargate_cpu
  memory                   = var.fargate_memory
  tags                     = local.common_tags
  container_definitions = jsonencode([
    {
      essential   = true
      name        = var.client_container_name
      image       = var.client_image
      cpu         = var.fargate_cpu
      memory      = var.fargate_memory
      networkMode = "awsvpc"
      portMappings = [
        {
          protocol      = "tcp"
          containerPort = var.client_port
          hostPort      = var.client_port
        }
      ]
      environment = [
        {
          name  = "AWS_REGION",
          value = var.aws_region
        },
        {
          name  = "bucketName",
          value = aws_s3_bucket.wfnews_upload_bucket.id
        },
        {
          name = "BASE_URL",
          value = "https://${aws_route53_record.wfnews_client.name}/"
        },
        {
          name = "WEBADE_OAUTH2_WFNEWS_REST_CLIENT_SECRET",
          value = var.WEBADE_OAUTH2_WFNEWS_REST_CLIENT_SECRET
        },
        {
          name = "WEBADE-OAUTH2_TOKEN_URL",
          value = var.WEBADE-OAUTH2_TOKEN_URL
        },
        {
          name = "WEBADE-OAUTH2_CHECK_TOKEN_V2_URL"
          value = var.WEBADE-OAUTH2_CHECK_TOKEN_URL
        },
        {
          name = "WFIM_API_URL",
          value = var.WFIM_CLIENT_URL
        },
        {
          name = "WFDM_API_URL",
          value = var.WFDM_REST_URL
        },
        {
          name = "ORG_UNIT_URL",
          value = ""
        },
        {
          name = "WFNEWS_API_URL",
          value = "https://${aws_route53_record.wfnews_server.name}/"
        },
        {
          name = "WEBADE_OAUTH2_AUTHORIZE_URL"
          value = var.WEBADE_OAUTH2_AUTHORIZE_URL
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-create-group  = "true"
          awslogs-group         = "/ecs/${var.client_name}"
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
      mountPoints = []
      volumesFrom = []
    }
  ])
}

resource "aws_ecs_task_definition" "wfnews_liquibase" {
  family                   = "wfnews-liquibase-task-${var.target_env}"
  execution_role_arn       = aws_iam_role.wfnews_ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.wfnews_app_container_role.arn
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.fargate_cpu
  memory                   = var.fargate_memory
  tags                     = local.common_tags
  container_definitions = jsonencode([
    {
      essential   = true
      name        = var.liquibase_container_name
      image       = var.liquibase_image
      cpu         = var.fargate_cpu
      memory      = var.fargate_memory
      networkMode = "awsvpc"
      portMappings = [
        {
          protocol      = "tcp"
          containerPort = var.db_port
          hostPort      = var.db_port
        }
      ]
      environment = [
        {
          name  = "DB_URL",
          value = "jdbc:postgresql://${aws_db_instance.wfnews_pgsqlDB.endpoint}/${aws_db_instance.wfnews_pgsqlDB.name}"
        },
        {
          name  = "DB_USER",
          value = "${aws_db_instance.wfnews_pgsqlDB.username}"
        },
        {
          name = "DB_PASS"
          value = "${var.db_pass}"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-create-group  = "true"
          awslogs-group         = "/ecs/${var.liquibase_container_name}"
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
      mountPoints = []
      volumesFrom = []
    }
  ])
}

resource "aws_ecs_task_definition" "wfnews_apisix" {
  count                    = local.create_ecs_service
  family                   = "wfnews-apisix-task-${var.target_env}"
  execution_role_arn       = aws_iam_role.wfnews_ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.wfnews_app_container_role.arn
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.fargate_cpu
  memory                   = var.fargate_memory
  tags                     = local.common_tags
  container_definitions = jsonencode([
    {
      essential   = true
      name        = var.apisix_container_name
      image       = var.apisix_image
      cpu         = var.fargate_cpu
      memory      = var.fargate_memory
      networkMode = "awsvpc"
      for_each = var.apisix_ports
      portMappings = [
        {
          protocol = "tcp"
          containerPort = var.apisix_ports[0]
          hostPort = var.apisix_ports[0]
        },
        {
          protocol = "tcp"
          containerPort = var.apisix_ports[1]
          hostPort = var.apisix_ports[1]
        },
        {
          protocol = "tcp"
          containerPort = var.apisix_admin_port
          hostPort = var.apisix_admin_port
        },
        {
          protocol = "tcp"
          containerPort = var.health_check_port
          hostPort = var.health_check_port
        }

      ]
      environment = [
        {
          name: "ETCD_URL",
          value: "wfnews-etcd.${var.license_plate}-${var.target_env}.nimbus.cloud.gov.bc.ca"
        },
        {
          name: "API_KEY",
          value: "${var.api_key}"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-create-group  = "true"
          awslogs-group         = "/ecs/${var.etcd_names[0]}"
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
      mountPoints = []
      volumesFrom = []
    }
  ])
}

resource "aws_ecs_task_definition" "wfnews_etcd" {
  count                    = local.create_ecs_service
  family                   = "wfnews-etcd-task-${var.target_env}"
  execution_role_arn       = aws_iam_role.wfnews_ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.wfnews_app_container_role.arn
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.fargate_cpu
  memory                   = var.fargate_memory
  tags                     = local.common_tags
  container_definitions = jsonencode([
    {
      essential   = true
      name        = var.etcd_container_name
      image       = var.etcd_image
      cpu         = var.fargate_cpu
      memory      = var.fargate_memory
      networkMode = "awsvpc"
      portMappings = [
        {
          protocol = "tcp"
          containerPort = var.etcd_port
          hostPort = var.etcd_port
        }
      ]
      environment = [
        {
          name: "API_KEY",
          value: "${var.api_key}"
        },
        {
          name: "ETCD_ENABLE_V2",
          value: "true"
        },
        {
          name: "ETCD_ADVERTISE_CLIENT_URLS",
          value: "http://0.0.0.0:2379, https://wfnews-etcd.${var.license_plate}-${var.target_env}.nimbus.cloud.gov.bc.ca"
        },
        {
          name: "ETCD_LISTEN_CLIENT_URLS",
          value: "http://0.0.0.0:2379, https://wfnews-etcd.${var.license_plate}-${var.target_env}.nimbus.cloud.gov.bc.ca"
        },
        {
          name: "ETCD_ROOT_PASSWORD",
          value: "${var.etcd_password}"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-create-group  = "true"
          awslogs-group         = "/ecs/${var.etcd_names[0]}"
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
      mountPoints = [
        {
          sourceVolume: "efs-storage"
          containerPath: "/bitnami/etcd"
        }
      ]
      volumesFrom = []
      ulimits = [
        {
          "name": "nofile"
          "softLimit": 2048
          "hardLimit": 4096
        }
      ]
    } 
  ])
  
  volume {
    name = "efs-storage"
    efs_volume_configuration {
      file_system_id = aws_efs_file_system.wfnews_efs.id
      transit_encryption      = "ENABLED"
      transit_encryption_port = 2999
      authorization_config {
        iam             = "ENABLED"
      }
    }
  }
  
}

resource "aws_ecs_task_definition" "wfnews_apisix_gui" {
  count                    = local.create_ecs_service
  family                   = "wfnews-apisix-gui-task-${var.target_env}"
  execution_role_arn       = aws_iam_role.wfnews_ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.wfnews_app_container_role.arn
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.fargate_cpu
  memory                   = var.fargate_memory
  tags                     = local.common_tags
  container_definitions = jsonencode([
    {
      essential   = true
      name        = var.apisix_gui_container_name
      image       = var.apisix_image
      cpu         = var.fargate_cpu
      memory      = var.fargate_memory
      networkMode = "awsvpc"
      portMappings = [
        {
          protocol = "tcp"
          containerPort = var.apisix_gui_port
          hostPort = var.apisix_gui_port
        }
      ]
      environment = [
        {
          name: "ETCD_URL",
          value: "wfnews-etcd.${var.license_plate}-${var.target_env}.nimbus.cloud.gov.bc.ca"
        },
        {
          name: "API_KEY",
          value: "${var.api_key}"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-create-group  = "true"
          awslogs-group         = "/ecs/${var.apisix_gui_names[0]}"
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
      mountPoints = []
      volumesFrom = []
    }
  ])
}

resource "aws_ecs_service" "wfnews_liquibase" {
  count                             = 1
  name                              = "wfnews-liquibase-service-${var.target_env}"
  cluster                           = aws_ecs_cluster.wfnews_main.id
  task_definition                   = aws_ecs_task_definition.wfnews_liquibase.arn
  desired_count                     = 1
  enable_ecs_managed_tags           = true
  propagate_tags                    = "TASK_DEFINITION"
  health_check_grace_period_seconds = 60
  wait_for_steady_state             = false


  capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight = 100
    base = 1
  }

  network_configuration {
    security_groups  = [aws_security_group.wfnews_ecs_tasks.id, data.aws_security_group.app.id]
    subnets          = module.network.aws_subnet_ids.app.ids
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_alb_target_group.wfnews_liquibase.id
    container_name   = var.liquibase_container_name
    container_port   = var.db_port
  }

  depends_on = [aws_iam_role_policy_attachment.wfnews_ecs_task_execution_role]

  tags = local.common_tags
}


resource "aws_ecs_service" "wfnews_main" {
  count                             = local.create_ecs_service
  name                              = "wfnews-server-service-${var.target_env}"
  cluster                           = aws_ecs_cluster.wfnews_main.id
  task_definition                   = aws_ecs_task_definition.wfnews_server[count.index].arn
  desired_count                     = var.app_count
  enable_ecs_managed_tags           = true
  propagate_tags                    = "TASK_DEFINITION"
  health_check_grace_period_seconds = 60
  wait_for_steady_state             = false


  capacity_provider_strategy {
    capacity_provider = "FARGATE_SPOT"
    weight            = 80
  }
  capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight = 20
    base = 1
  }


  network_configuration {
    security_groups  = [aws_security_group.wfnews_ecs_tasks.id, data.aws_security_group.app.id]
    subnets          = module.network.aws_subnet_ids.app.ids
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_alb_target_group.wfnews_server.id
    container_name   = var.server_container_name
    container_port   = var.server_port
  }

  depends_on = [aws_iam_role_policy_attachment.wfnews_ecs_task_execution_role]

  tags = local.common_tags
}

resource "aws_ecs_service" "client" {
  count                             = local.create_ecs_service
  name                              = "wfnews-client-service-${var.target_env}"
  cluster                           = aws_ecs_cluster.wfnews_main.id
  task_definition                   = aws_ecs_task_definition.wfnews_client[count.index].arn
  desired_count                     = var.app_count
  enable_ecs_managed_tags           = true
  propagate_tags                    = "TASK_DEFINITION"
  health_check_grace_period_seconds = 60
  wait_for_steady_state             = false


  capacity_provider_strategy {
    capacity_provider = "FARGATE_SPOT"
    weight            = 80
  }
  capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight = 20
    base = 1
  }


  network_configuration {
    security_groups  = [aws_security_group.wfnews_ecs_tasks.id, data.aws_security_group.app.id]
    subnets          = module.network.aws_subnet_ids.app.ids
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_alb_target_group.wfnews_client.id
    container_name   = var.client_container_name
    container_port   = var.client_port
  }

  depends_on = [aws_iam_role_policy_attachment.wfnews_ecs_task_execution_role]

  tags = local.common_tags
}

resource "aws_ecs_service" "apisix" {
  count                             = local.create_ecs_service
  name                              = "wfnews-apisix-service-${var.target_env}"
  cluster                           = aws_ecs_cluster.wfnews_main.id
  task_definition                   = aws_ecs_task_definition.wfnews_apisix[count.index].arn
  desired_count                     = var.app_count
  enable_ecs_managed_tags           = true
  propagate_tags                    = "TASK_DEFINITION"
  health_check_grace_period_seconds = 60
  wait_for_steady_state             = false


  capacity_provider_strategy {
    capacity_provider = "FARGATE_SPOT"
    weight            = 80
  }
  capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight = 20
    base = 1
  }


  network_configuration {
    security_groups  = [aws_security_group.wfnews_ecs_tasks.id, data.aws_security_group.app.id]
    subnets          = module.network.aws_subnet_ids.app.ids
    assign_public_ip = true
  }

  #Hit http endpoint
  load_balancer {
    target_group_arn = aws_alb_target_group.wfnews_apisix.id
    container_name   = var.apisix_container_name
    container_port   = var.apisix_ports[0]
  }

  #hit admin api
  load_balancer {
    target_group_arn = aws_alb_target_group.wfnews_apisix_admin.id
    container_name   = var.apisix_container_name
    container_port   = var.apisix_admin_port
  }

  depends_on = [aws_iam_role_policy_attachment.wfnews_ecs_task_execution_role]

  tags = local.common_tags
}

resource "aws_ecs_service" "etcd" {
  count                             = local.create_ecs_service
  name                              = "wfnews-etcd-service-${var.target_env}"
  cluster                           = aws_ecs_cluster.wfnews_main.id
  task_definition                   = aws_ecs_task_definition.wfnews_etcd[count.index].arn
  desired_count                     = var.app_count
  enable_ecs_managed_tags           = true
  propagate_tags                    = "TASK_DEFINITION"
  health_check_grace_period_seconds = 60
  wait_for_steady_state             = false


  capacity_provider_strategy {
    capacity_provider = "FARGATE_SPOT"
    weight            = 80
  }
  capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight = 20
    base = 1
  }


  network_configuration {
    security_groups  = [aws_security_group.wfnews_ecs_tasks.id, data.aws_security_group.app.id, data.aws_security_group.data.id, aws_security_group.wfnews_efs_access.id]
    subnets          = module.network.aws_subnet_ids.app.ids
    assign_public_ip = true
  }

  #Hit http endpoint
  load_balancer {
    target_group_arn = aws_alb_target_group.wfnews_etcd.id
    container_name   = var.etcd_container_name
    container_port   = var.etcd_port

  }

  depends_on = [aws_iam_role_policy_attachment.wfnews_ecs_task_execution_role]

  tags = local.common_tags
}

resource "aws_ecs_service" "apisix_gui" {
  count                             = local.create_ecs_service
  name                              = "wfnews-apisix-gui-service-${var.target_env}"
  cluster                           = aws_ecs_cluster.wfnews_main.id
  task_definition                   = aws_ecs_task_definition.wfnews_apisix_gui[count.index].arn
  desired_count                     = var.app_count
  enable_ecs_managed_tags           = true
  propagate_tags                    = "TASK_DEFINITION"
  health_check_grace_period_seconds = 60
  wait_for_steady_state             = false


  capacity_provider_strategy {
    capacity_provider = "FARGATE_SPOT"
    weight            = 80
  }
  capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight = 20
    base = 1
  }


  network_configuration {
    security_groups  = [aws_security_group.wfnews_ecs_tasks.id, data.aws_security_group.app.id]
    subnets          = module.network.aws_subnet_ids.app.ids
    assign_public_ip = true
  }

  #Hit http endpoint
  load_balancer {
    target_group_arn = aws_alb_target_group.wfnews_apisix_gui.id
    container_name   = var.apisix_gui_container_name
    container_port   = var.apisix_gui_port
  }


  depends_on = [aws_iam_role_policy_attachment.wfnews_ecs_task_execution_role]

  tags = local.common_tags
}