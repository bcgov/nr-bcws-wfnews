resource "aws_db_subnet_group" "wfnews_db_subnet_group" {
  name       = "wfnews_${var.target_env}_db_subnet_group"
  subnet_ids = module.network.aws_subnet_ids.app.ids
  tags       = local.common_tags
}

/*TODO: adapt to be accessible externally*/
resource "aws_db_instance" "wfnews_pgsqlDB" {
  identifier                      = "wfnews${var.target_env}"
  engine                          = "postgres"
  engine_version                  = "13.10"
  auto_minor_version_upgrade      = false
  db_name                         = "wfnews${var.target_env}"
  instance_class                  = var.db_instance_type
  multi_az                        = var.db_multi_az
  backup_retention_period         = 7
  allocated_storage               = var.db_size
  username                        = var.WFNEWS_USERNAME
  password                        = var.db_pass
  publicly_accessible             = false
  skip_final_snapshot             = true
  storage_encrypted               = true
  vpc_security_group_ids          = [data.aws_security_group.app.id, aws_security_group.wfnews_ecs_tasks.id]
  tags                            = local.common_tags
  db_subnet_group_name            = aws_db_subnet_group.wfnews_db_subnet_group.name
  enabled_cloudwatch_logs_exports = ["postgresql"]
  parameter_group_name            = "wfnews-manual"
}
/*
resource "aws_db_parameter_group" "wfnews_params" {
  name   = "wfnews-${var.target_env}"
  family = "postgres13"

  parameter {
    name  = "max_connections"
    value = "LEAST({DBInstanceClassMemory/2382848},5000)"
  }
}
*/
/*
resource "aws_db_proxy" "wfnews_db_proxy" {
  name                   = "wfnews-db-proxy-${var.target_env}"
  debug_logging          = false
  engine_family          = "POSTGRESQL"
  idle_client_timeout    = 1800
  require_tls            = true
  role_arn               = data.aws_iam_role.wfnews_automation_role.arn
  vpc_security_group_ids = [data.aws_security_group.web.id, aws_security_group.wfnews_ecs_tasks.id]
  vpc_subnet_ids         = module.network.aws_subnet_ids.app.ids

  auth {
    iam_auth    = "DISABLED"
    secret_arn  = aws_secretsmanager_secret.wfnews_db_pw_secret.arn
    username = aws_db_instance.wfnews_pgsqlDB.username
  }

  tags = local.common_tags
  depends_on = [
    aws_secretsmanager_secret.wfnews_db_pw_secret
  ]
}

resource "aws_db_proxy_default_target_group" "wfnews_db_target_group" {
  db_proxy_name = aws_db_proxy.wfnews_db_proxy.name
}

resource "aws_db_proxy_target" "wfnews_db_proxy_target" {
  db_instance_identifier = aws_db_instance.wfnews_pgsqlDB.id
  db_proxy_name          = aws_db_proxy.wfnews_db_proxy.name
  target_group_name      = aws_db_proxy_default_target_group.wfnews_db_target_group.name
}
*/
