resource "aws_db_subnet_group" "wfnews_db_subnet_group" {
  name       = "wfnews_${var.target_env}_db_subnet_group"
  subnet_ids = data.aws_subnets.my_subnets.ids

  tags = local.common_tags
}

resource "aws_db_instance" "wfnews_pgsqlDB"{
    identifier = "wfnews${var.target_env}"
    engine = "postgres"
    name = "wfnews${var.target_env}"
    instance_class       = "db.t3.micro"
    allocated_storage = 10
    username = "wfnews${var.target_env}"
    password = var.db_pass
    skip_final_snapshot = true
    vpc_security_group_ids = [data.aws_security_group.web.id]
    tags = local.common_tags
    db_subnet_group_name = aws_db_subnet_group.wfnews_db_subnet_group.name
}