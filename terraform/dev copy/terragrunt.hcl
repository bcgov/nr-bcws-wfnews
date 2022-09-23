terraform {
  source = ".."
}

include {
  path = find_in_parent_folders()
}

locals {
  sec_group = "Web_sg"
  db_pass = "dbpass"
  server_image = "test:latest"
  client_image = "test:latest"
  liquibase_image = "test:latest"
  target_env = "DEV"
  alb_name = "DEFAULT"
  vpc_name = "DEFAULT"
  subnet_filter = "DEFAULT"
  license_plate = "DEFAULT"
  #server env vars
  WEBADE-OAUTH2_TOKEN_CLIENT_URL = "DEFAULT"
  WEBADE-OAUTH2_TOKEN_URL = "DEFAULT"
  WEBADE_OAUTH2_WFNEWS_REST_CLIENT_SECRET = "DEFAULT"
  WFDM_REST_URL = "DEFAULT"
  WFIM_CLIENT_URL = "DEFAULT"
  WFIM_CODE_TABLES_URL = "DEFAULT"
  WEBADE-OAUTH2_CHECK_TOKEN_URL = "DEFAULT"
  WFNEWS_EMAIL_NOTIFICATIONS_ENABLED= "DEFAULT"
  SMTP_HOST_NAME = "DEFAULT"
  SMTP_PASSWORD = "DEFAULT"
  SMTP_FROM_EMAIL = "DEFAULT"
  SMTP_ADMIN_EMAIL = "DEFAULT"
  SMTP_EMAIL_SYNC_ERROR_FREQ= "DEFAULT"
  SMTP_EMAIL_FREQ = "DEFAULT"
  SMTP_EMAIL_ERROR_SUBJECT = "DEFAULT"
  SMTP_EMAIL_SUBJECT = "DEFAULT"
  DEFAULT_APPLICATION_ENVIRONMENT= "DEFAULT"
  WFNEWS_AGOL_QUERY_URL = "DEFAULT"
}

generate "dev_tfvars" {
  path              = "terragrunt.auto.tfvars"
  if_exists         = "overwrite"
  disable_signature = true
  contents          = <<-EOF
    cert_domain = "*.dev.bcwildfireservices.com"
    cloudfront = true
    cloudfront_origin_domain = "cfront_test.html"
    app_image = "tomcat:jdk8-corretto"
    fargate_cpu = 1024
    fargate_memory = 2048
    service_names = ["wfnews-project"]
    aws_sec_group = "App_sg"
    target_env = "${local.target_env}"
    target_aws_account_id = "718963518348"
    server_image     = "${local.server_image}"
    client_image     = "${local.client_image}"
    liquibase_image     = "${local.liquibase_image}"
    db_pass = "${local.db_pass}"
    alb_name = "${local.alb_name}"
    client_port = 8080
    server_port=8080
    vpc_name = "${local.vpc_name}"
    subnet_filter = "${local.subnet_filter}"
    license_plate = "${local.license_plate}"
    certificate_arn = "arn:aws:acm:us-east-1:718963518348:certificate/81262c52-5967-48ce-a4ee-dec3cd67a0b4"
    WEBADE-OAUTH2_TOKEN_CLIENT_URL = "${local.WEBADE-OAUTH2_TOKEN_CLIENT_URL}"
    WEBADE-OAUTH2_TOKEN_URL ="${local.WEBADE-OAUTH2_TOKEN_URL}"
    WEBADE_OAUTH2_WFNEWS_REST_CLIENT_SECRET ="${local.WEBADE_OAUTH2_WFNEWS_REST_CLIENT_SECRET}"
    WFDM_REST_URL ="${local.WFDM_REST_URL}"
    WFIM_CLIENT_URL ="${local.WFIM_CLIENT_URL}"
    WFIM_CODE_TABLES_URL ="${local.WFIM_CODE_TABLES_URL}"
    WEBADE-OAUTH2_CHECK_TOKEN_URL ="${local.WEBADE-OAUTH2_CHECK_TOKEN_URL}"
    WFNEWS_EMAIL_NOTIFICATIONS_ENABLED="${local.WFNEWS_EMAIL_NOTIFICATIONS_ENABLED}"
    SMTP_HOST_NAME ="${local.SMTP_HOST_NAME}"
    SMTP_PASSWORD ="${local.SMTP_PASSWORD}"
    SMTP_FROM_EMAIL ="${local.SMTP_FROM_EMAIL}"
    SMTP_ADMIN_EMAIL ="${local.SMTP_ADMIN_EMAIL}"
    SMTP_EMAIL_SYNC_ERROR_FREQ="${local.SMTP_EMAIL_SYNC_ERROR_FREQ}"
    SMTP_EMAIL_FREQ ="${local.SMTP_EMAIL_FREQ}"
    SMTP_EMAIL_ERROR_SUBJECT ="${local.SMTP_EMAIL_ERROR_SUBJECT}"
    SMTP_EMAIL_SUBJECT ="${local.SMTP_EMAIL_SUBJECT}"
    DEFAULT_APPLICATION_ENVIRONMENT="${local.DEFAULT_APPLICATION_ENVIRONMENT}"
    WFNEWS_AGOL_QUERY_URL ="${local.WFNEWS_AGOL_QUERY_URL}"
  EOF
}
