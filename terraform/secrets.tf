/*
resource "aws_secretsmanager_secret" "wfnews_db_pw_secret" {
  name = "wfnews-db-secret-${var.target_env}"
}

resource "aws_secretsmanager_secret_version" "wfnews_db_pw_secret_version" {
    secret_id = aws_secretsmanager_secret.wfnews_db_pw_secret.id
    secret_string = var.db_pass
}
*/