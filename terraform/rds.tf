resource "aws_db_subnet_group" "wfnews_db_subnet_group" {
  name       = "wfnews_${var.target_env}_db_subnet_group"
  subnet_ids = module.networking.subnets.app.ids
  tags       = local.common_tags
}

/*TODO: adapt to be accessible externally*/
resource "aws_db_instance" "wfnews_pgsqlDB" {
  identifier                      = "wfnews${var.target_env}"
  engine                          = "postgres"
  engine_version                  = var.db_postgres_version
  auto_minor_version_upgrade      = false
  allow_major_version_upgrade     = true
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
  vpc_security_group_ids          = [module.networking.security_groups.app.id, aws_security_group.wfnews_ecs_tasks.id]
  tags                            = local.common_tags
  db_subnet_group_name            = aws_db_subnet_group.wfnews_db_subnet_group.name
  enabled_cloudwatch_logs_exports = ["postgresql"]
  parameter_group_name            = "wfnews-manual-postgres15"

  lifecycle {
    prevent_destroy = true
  }
}