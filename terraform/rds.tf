resource "aws_db_instance" "wfnews_pgsqlDB"{
    engine = "postgres"
    name = "wfnews${var.target_env}"
    instance_class       = "db.t3.micro"
    allocated_storage = 10
    username = "wfnews${var.target_env}"
    password = var.db_pass
    skip_final_snapshot = true
    vpc_security_group_ids = [data.aws_security_group.web.id]
}